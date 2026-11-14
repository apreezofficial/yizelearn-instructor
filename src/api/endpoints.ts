import {request} from './client';
import {session} from './session';
import {toUser} from './mappers';
import type {ApiAuthResult} from './contract';
import type {User} from './types';

// Instructor app endpoints, from the live contract (https://16-170-53-222.sslip.io/docs).
// Sign-in is email and password, with a 6-digit authenticator code when two-step is on.
export type SignInResult = {status: 'signed-in'; user: User} | {status: 'two-step'; challengeToken: string};

async function finish(result: ApiAuthResult): Promise<SignInResult> {
  if (result.status === 'mfa_required') return {status: 'two-step', challengeToken: result.mfa.challengeToken};
  await session.set(result.tokens);
  return {status: 'signed-in', user: toUser(result.tokens.user)};
}

export const authApi = {
  logIn: async (email: string, password: string) => finish(await request<ApiAuthResult>('/auth/login', {method: 'POST', anonymous: true, body: {email, password, deviceName: 'yizelearn instructor app', platform: 'ios'}})),
  mfaVerify: async (challengeToken: string, code: string) => finish(await request<ApiAuthResult>('/auth/mfa/verify', {method: 'POST', anonymous: true, body: {challengeToken, code}})),
  forgotPassword: (email: string) => request<void>('/auth/password/forgot', {method: 'POST', anonymous: true, body: {email}}),
  ssoDiscover: (email: string) => request<{available: boolean; name?: string | null}>('/auth/sso/discover', {method: 'POST', anonymous: true, body: {email}}),
  logout: async () => {
    const tokens = session.get();
    try { if (tokens) await request<void>('/auth/logout', {method: 'POST', body: {refreshToken: tokens.refreshToken}}); } catch { /* signed out here either way */ }
    await session.clear();
  },
};

export type Metric = {value: number; changePct: number | null; changePts: number | null};
export type Dashboard = {range: string; activeLearners: Metric; completion: Metric; toGrade: {count: number; overdue: number}; engagement: {date: string; value: number}[]; toGradePreview: GradingItem[]};
export type GradingItem = {id: string; type: string; learner: {id: string; fullName: string; initials: string}; courseId: string; courseTitle: string; title: string; submittedAt: string; dueAt: string | null; status: 'pending' | 'overdue' | 'graded'};
export type CourseRow = {id: string; title: string; lessonCount: number; status: 'draft' | 'in_review' | 'changes_requested' | 'published' | 'unpublished'; thumbnailUrl: string | null; learnersCount: number; updatedAt: string};
export type Page<T> = {data: T[]; page: {nextCursor: string | null; hasMore: boolean; total: number | null}};
export type LessonRow = {id: string; title: string; type: 'video' | 'document' | 'quiz' | 'assignment'; position: number; isPreview: boolean; isPublished: boolean; durationSec: number | null};
export type ModuleRow = {id: string; position: number; title: string; lessonCount: number; lessons: LessonRow[]};
export type Curriculum = {courseId: string; moduleCount: number; lessonCount: number; durationMin: number; modules: ModuleRow[]};

export const instructorApi = {
  dashboard: (range: '7d' | '30d' = '7d') => request<Dashboard>(`/instructor/dashboard?range=${range}`),
  courses: () => request<Page<CourseRow>>('/instructor/courses?limit=100'),
  createCourse: (title: string) => request<CourseRow & Record<string, unknown>>('/instructor/courses', {method: 'POST', idempotent: true, body: {title}}),
  curriculum: (courseId: string) => request<Curriculum>(`/instructor/courses/${courseId}/curriculum`),
  addModule: (courseId: string, title: string) => request<ModuleRow>(`/instructor/courses/${courseId}/modules`, {method: 'POST', body: {title}}),
  addLesson: (moduleId: string, type: LessonRow['type'], title: string, isPreview = false) => request<LessonRow>(`/instructor/modules/${moduleId}/lessons`, {method: 'POST', body: {type, title, isPreview}}),
  publish: (courseId: string) => request<unknown>(`/instructor/courses/${courseId}/publish`, {method: 'POST'}),
  grading: () => request<Page<GradingItem>>('/instructor/submissions?limit=50'),
  grade: (submissionId: string, score: number, feedback: string) => request<unknown>(`/instructor/submissions/${submissionId}/grade`, {method: 'PUT', body: {score, feedback, rubricScores: []}}),
  students: () => request<Page<{learner: {id: string; fullName: string; initials: string}; course: {id: string; title: string}; progressPct: number; status: string | null; lastActiveAt: string | null}>>('/instructor/students?limit=50'),
};
