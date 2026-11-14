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
export type LessonRow = {id: string; title: string; type: 'video' | 'document' | 'quiz' | 'assignment'; position: number; isPreview: boolean; isPublished: boolean; durationSec: number | null; quizId?: string | null; assessmentId?: string | null};
export type ModuleRow = {id: string; position: number; title: string; lessonCount: number; lessons: LessonRow[]};
export type Curriculum = {courseId: string; moduleCount: number; lessonCount: number; durationMin: number; modules: ModuleRow[]};

export type SetupData = {course: {id: string; title: string; status: CourseRow['status']; thumbnailUrl: string | null}; steps: {key: 'basics' | 'curriculum' | 'pricing' | 'publish'; done: boolean; summary: string}[]; doneCount: number; total: number};
export type Checklist = {ready: number; total: number; canPublish: boolean; items: {key: string; label: string; ok: boolean; fixTarget: 'curriculum' | 'pricing' | 'basics' | 'thumbnail' | null}[]};
export type Money = {amountMinor: number; currency: string};
export type PricingData = {price: Money | null; listPrice: Money | null; discount: {enabled: boolean; promoCode: string | null; percent: number | null; validUntil: string | null} | null};
export type CourseBasics = {title: string; subtitle: string | null; summary: string | null; about: string | null};

export type LiveRow = {id: string; title: string; startsAt: string; durationMin: number; status: string; capacity: number; bookedCount: number};

export type ConversationRow = {id: string; counterpart: {id: string; fullName: string; initials: string}; lastMessage: {text?: string; sentAt?: string} | null; unread: boolean; updatedAt: string};
export type MessageRow = {id: string; text: string; isMine: boolean; sentAt: string};
export const messagesApi = {
  conversations: () => request<Page<ConversationRow>>('/conversations?limit=50'),
  messages: (id: string) => request<Page<MessageRow>>(`/conversations/${id}/messages?limit=100`),
  send: (id: string, text: string) => request<MessageRow>(`/conversations/${id}/messages`, {method: 'POST', body: {text, clientMessageId: `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`}}),
  markRead: (id: string) => request<void>(`/conversations/${id}/read`, {method: 'POST'}),
};

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';
export type QuizData = {id: string; title: string; passMarkPct: number; timeLimitMinutes: number | null; maxAttempts: number | null; shuffleQuestions: boolean; questionCount: number; questions: {id: string; type: QuestionType; prompt: string; points: number}[]};
export type AssessmentData = {id: string; title: string; dueAt: string | null; brief: string | null; plagiarismCheck: boolean; maxAttempts: number | null; maxScore: number};
export type ProfileData = {fullName: string; headline: string | null; bio: string | null; website: string | null; links: {label: string; url: string}[]; stats: {coursesCount: number; learnersCount: number; ratingAvg: number | null; ratingCount: number}};
export type SecurityData = {twoStepEnabled: boolean; passwordChangedAt: string | null; sessions: {id: string; deviceName: string; city: string | null; country: string | null; lastActiveAt: string; isCurrent: boolean}[]};
export type NotificationRow = {id: string; title: string; body: string | null; createdAt: string; read: boolean};

export const instructorApi = {
  quiz: (id: string) => request<QuizData>(`/instructor/quizzes/${id}`),
  saveQuiz: (id: string, q: {title: string; passMarkPct: number; timeLimitMinutes: number | null; maxAttempts: number | null; shuffleQuestions: boolean}) => request<QuizData>(`/instructor/quizzes/${id}`, {method: 'PUT', body: q}),
  addQuestion: (quizId: string, q: {type: QuestionType; prompt: string; points: number; options?: {text: string; isCorrect: boolean}[]; correctBoolean?: boolean; acceptedAnswers?: string[]}) => request<unknown>(`/instructor/quizzes/${quizId}/questions`, {method: 'POST', body: q}),
  assessment: (id: string) => request<AssessmentData>(`/instructor/assessments/${id}`),
  saveAssessment: (id: string, a: {title: string; dueAt: string | null; brief: string | null; plagiarismCheck: boolean; maxAttempts: number | null; maxScore: number}) => request<AssessmentData>(`/instructor/assessments/${id}`, {method: 'PUT', body: a}),
  profile: () => request<ProfileData>('/me/instructor-profile'),
  saveProfile: (p: {fullName: string; headline: string | null; bio: string | null; website: string | null; links: {label: string; url: string}[]}) => request<ProfileData>('/me/instructor-profile', {method: 'PUT', body: p}),
  security: () => request<SecurityData>('/me/security'),
  revokeOthers: () => request<void>('/me/sessions/revoke-others', {method: 'POST'}),
  notifications: () => request<Page<NotificationRow>>('/notifications?limit=50'),
  readAll: () => request<void>('/notifications/read-all', {method: 'POST'}),
  announce: (courseId: string, title: string, body: string) => request<{id: string; recipientCount: number | null}>('/instructor/announcements', {method: 'POST', idempotent: true, body: {courseId, title, body}}),
  liveSessions: () => request<Page<LiveRow>>('/instructor/live-sessions?limit=50'),
  scheduleLive: (v: {title: string; startsAt: string; durationMin: number; capacity: number; courseId?: string | null}) => request<LiveRow>('/instructor/live-sessions', {method: 'POST', idempotent: true, body: {kind: 'general', provider: 'zoom', recordingEnabled: false, description: null, minAttendees: null, courseId: null, ...v}}),
  liveJoinLink: (id: string) => request<{url?: string; joinUrl?: string}>(`/instructor/live-sessions/${id}/join-link`),
  setup: (courseId: string) => request<SetupData>(`/instructor/courses/${courseId}/setup`),
  checklist: (courseId: string) => request<Checklist>(`/instructor/courses/${courseId}/publish-checklist`),
  pricing: (courseId: string) => request<PricingData>(`/instructor/courses/${courseId}/pricing`),
  savePricing: (courseId: string, body: {price: Money; listPrice?: Money | null; discount?: {enabled: boolean; promoCode?: string; percent?: number; validUntil?: string} | null}) => request<PricingData>(`/instructor/courses/${courseId}/pricing`, {method: 'PUT', body}),
  course: (courseId: string) => request<CourseBasics & Record<string, unknown>>(`/instructor/courses/${courseId}`),
  saveCourse: (courseId: string, body: Partial<CourseBasics>) => request<CourseBasics>(`/instructor/courses/${courseId}`, {method: 'PATCH', body}),
  dashboard: (range: '7d' | '30d' = '7d') => request<Dashboard>(`/instructor/dashboard?range=${range}`),
  courses: () => request<Page<CourseRow>>('/instructor/courses?limit=100'),
  createCourse: (title: string) => request<CourseRow & Record<string, unknown>>('/instructor/courses', {method: 'POST', idempotent: true, body: {title}}),
  curriculum: (courseId: string) => request<Curriculum>(`/instructor/courses/${courseId}/curriculum`),
  addModule: (courseId: string, title: string) => request<ModuleRow>(`/instructor/courses/${courseId}/modules`, {method: 'POST', body: {title}}),
  addLesson: (moduleId: string, type: LessonRow['type'], title: string, isPreview = false) => request<LessonRow>(`/instructor/modules/${moduleId}/lessons`, {method: 'POST', body: {type, title, isPreview}}),
  publish: (courseId: string) => request<unknown>(`/instructor/courses/${courseId}/publish`, {method: 'POST'}),
  grading: () => request<Page<GradingItem>>('/instructor/submissions?limit=50'),
  submission: (id: string) => request<{id: string; learner: {fullName: string}; files: {fileName: string; sizeBytes: number}[]; note: string | null; score: number | null; maxScore: number; feedback: string | null; similarity?: {score?: number; percent?: number} | null}>(`/instructor/submissions/${id}`),
  grade: (submissionId: string, score: number, feedback: string) => request<unknown>(`/instructor/submissions/${submissionId}/grade`, {method: 'PUT', body: {score, feedback, rubricScores: []}}),
  students: () => request<Page<{learner: {id: string; fullName: string; initials: string}; course: {id: string; title: string}; progressPct: number; status: string | null; lastActiveAt: string | null}>>('/instructor/students?limit=50'),
};
