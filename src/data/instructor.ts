// Sample instructor data until the instructor API is live.
export const instructorName = 'Tunde Bello';
export const instructorInitials = 'TB';

export const dashboard = {
  activeLearners: 1284,
  activeChange: '+12% this month',
  completion: 72,
  completionChange: '+3 pts',
  toGrade: 6,
  overdue: 2,
  engagement: [
    {day: 'M', value: 38}, {day: 'T', value: 52}, {day: 'W', value: 44}, {day: 'T', value: 60},
    {day: 'F', value: 56}, {day: 'S', value: 128}, {day: 'S', value: 70},
  ],
  pendingGrades: [
    {id: 'g1', title: 'Assignment 1', learner: 'Mercy Ibe', time: '2h ago'},
    {id: 'g2', title: 'Assignment 1', learner: 'Chidi Eze', time: '5h ago'},
  ],
};

export type CourseStatus = 'Draft' | 'Published' | 'In review';
export type InstructorCourse = {id: string; title: string; lessons: number; status: CourseStatus};
export const myCourses: InstructorCourse[] = [
  {id: 'excel', title: 'Data analysis in Excel', lessons: 24, status: 'Published'},
  {id: 'finance', title: 'Financial modelling', lessons: 18, status: 'Draft'},
  {id: 'writing', title: 'Business writing', lessons: 12, status: 'In review'},
  {id: 'python', title: 'Intro to Python', lessons: 30, status: 'Published'},
];

export const setupSteps = [
  {key: 'basics', title: 'Basics', detail: 'Title, summary, level', done: true},
  {key: 'curriculum', title: 'Curriculum', detail: '6 modules, 24 lessons', done: true},
  {key: 'pricing', title: 'Pricing', detail: 'Not set yet', done: false},
  {key: 'publish', title: 'Publish', detail: '2 items missing', done: false},
];

export type LessonType = 'Video' | 'Document' | 'Quiz' | 'Assignment';
export type ModuleItem = {id: string; title: string; type: LessonType};
export const curriculum: {id: string; title: string; lessons: ModuleItem[]}[] = [
  {id: 'm1', title: 'Module 1: Getting started', lessons: [
    {id: 'l1', title: 'Welcome and tour', type: 'Video'},
    {id: 'l2', title: 'Download the files', type: 'Document'},
  ]},
  {id: 'm2', title: 'Module 2: Formulas', lessons: [
    {id: 'l3', title: 'Cell references', type: 'Video'},
    {id: 'l4', title: 'SUMIF and COUNTIF', type: 'Video'},
  ]},
];

export const lessonTypes: {type: LessonType; detail: string; icon: 'video' | 'document' | 'quiz' | 'assignment'}[] = [
  {type: 'Video', detail: 'Upload MP4 or MOV', icon: 'video'},
  {type: 'Document', detail: 'PDF, slides or sheets', icon: 'document'},
  {type: 'Quiz', detail: 'Test what learners know', icon: 'quiz'},
  {type: 'Assignment', detail: 'Collect and grade work', icon: 'assignment'},
];

export const quizQuestions = [
  {id: 'q1', text: 'Which function looks up a value?', kind: 'Multiple choice'},
  {id: 'q2', text: 'A pivot table can summarise data', kind: 'True or false'},
  {id: 'q3', text: 'Name one chart type for trends', kind: 'Short answer'},
];

export const assessmentBrief = {
  title: 'Build a sales dashboard',
  dueDate: '27 Oct 2026',
  brief: '',
  attempts: '3',
};

export const videoUploads = [
  {id: 'v1', name: 'module-3-intro.mp4', status: 'uploading' as const, progress: 64},
  {id: 'v2', name: 'module-2-pivot.mp4', status: 'uploaded' as const, progress: 100},
  {id: 'v3', name: 'module-1-welcome.mov', status: 'failed' as const, progress: 0, error: 'File is over 2 GB'},
];

export const publishChecks = [
  {id: 'c1', title: 'Curriculum has lessons', done: true, fix: undefined},
  {id: 'c2', title: 'Quizzes added', done: true, fix: undefined},
  {id: 'c3', title: 'Pricing set', done: false, fix: 'Fix'},
  {id: 'c4', title: 'Catalog details complete', done: true, fix: undefined},
  {id: 'c5', title: 'Thumbnail added', done: false, fix: 'Fix'},
];

export type GradeStatus = 'Pending' | 'Graded' | 'Overdue';
export const gradingQueue: {id: string; learner: string; initials: string; title: string; time: string; status: GradeStatus}[] = [
  {id: 'g1', learner: 'Mercy Ibe', initials: 'MI', title: 'Assignment 1', time: '2h ago', status: 'Pending'},
  {id: 'g2', learner: 'Chidi Eze', initials: 'CE', title: 'Assignment 1', time: '5h ago', status: 'Pending'},
  {id: 'g3', learner: 'Tunde Bello', initials: 'TB', title: 'Assignment 1', time: '1d ago', status: 'Overdue'},
  {id: 'g4', learner: 'Adaeze Okafor', initials: 'AO', title: 'Quiz 2', time: '2d ago', status: 'Graded'},
];

export const submission = {file: 'dashboard-final.xlsx', learner: 'Mercy Ibe', size: '2.4 MB', similarity: 12, score: '85 / 100', feedback: ''};

export type StudentFilter = 'All' | 'Behind' | 'Done';
export const students: {id: string; name: string; initials: string; course: string; progress: number; note?: 'Pending' | 'Done'; behind: boolean}[] = [
  {id: 's1', name: 'Mercy Ibe', initials: 'MI', course: 'Excel course, 64%', progress: 64, behind: false},
  {id: 's2', name: 'Chidi Eze', initials: 'CE', course: 'Excel course, 22%', progress: 22, note: 'Pending', behind: true},
  {id: 's3', name: 'Tunde Bello', initials: 'TB', course: 'Python, 90%', progress: 90, behind: false},
  {id: 's4', name: 'Ada Obi', initials: 'AO', course: 'Excel course, 100%', progress: 100, note: 'Done', behind: false},
];

export const studentDetail = {
  name: 'Mercy Ibe', initials: 'MI', enrolled: '3 Oct 2026',
  course: 'Excel course progress', progress: 64, lessonsDone: 15, lessonsTotal: 24,
  grades: [{title: 'Module 1 quiz', score: '90%'}, {title: 'Module 2 quiz', score: '80%'}, {title: 'Assignment 1', score: 'Pending'}],
};

export const discussion = {
  question: {author: 'Mercy Ibe', initials: 'MI', meta: 'Lookup functions, 2h ago', text: 'Why does VLOOKUP return #N/A when the value is in the sheet?'},
  replies: [{from: 'instructor' as const, text: 'Check for trailing spaces in the lookup cell. Try TRIM first.'}],
};
