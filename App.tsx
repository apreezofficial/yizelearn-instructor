import React, {useState} from 'react';
import {Alert, StatusBar, StyleSheet, View} from 'react-native';
import {initialWindowMetrics, SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {TabBar, type TabItem} from './src/components/Catalog';
import {LaunchIntro} from './src/components/LaunchIntro';
import {ScreenTransition} from './src/components/ScreenTransition';
import {EmptyState} from './src/components/States';
import type {InstructorCourse, LessonType} from './src/data/instructor';
import {LoginScreen, VerifyCodeScreen} from './src/screens/auth/AuthScreens';
import {
  AssessmentBuilderScreen, CurriculumScreen, PricingScreen, PublishChecklistScreen, QuizBuilderScreen, SetupScreen, UploadVideoScreen,
} from './src/screens/instructor/CourseBuilderScreens';
import {CoursesScreen} from './src/screens/instructor/CoursesScreen';
import {DashboardScreen} from './src/screens/instructor/DashboardScreen';
import {DiscussionScreen, GradeSubmissionScreen, GradingScreen, StudentDetailScreen, StudentsScreen} from './src/screens/instructor/GradingScreens';
import {AnnouncementScreen, CertificateScreen, LiveSessionsScreen, MoreScreen, type MoreLink} from './src/screens/instructor/MoreScreens';
import {ConversationScreen, MessagesScreen, threads, type Thread} from './src/screens/instructor/MessagesScreens';
import {auth} from './src/api/client';
import {colors} from './src/theme/tokens';

type Tab = 'Dashboard' | 'Courses' | 'Students' | 'Messages' | 'More';
type Page = Tab | 'Login' | 'Verify' | 'Notifications' | 'Grading' | 'Grade' | 'Setup' | 'Curriculum' | 'Quiz' | 'Assessment'
  | 'Upload' | 'Pricing' | 'Publish' | 'Student' | 'Discussion' | 'Announcement' | 'Live' | 'Certificate' | 'Conversation';

const tabs: TabItem<Tab>[] = [
  {key: 'Dashboard', label: 'Home', icon: 'dashboard'},
  {key: 'Courses', label: 'Courses', icon: 'laptop'},
  {key: 'Students', label: 'Students', icon: 'users'},
  {key: 'Messages', label: 'Messages', icon: 'chat'},
  {key: 'More', label: 'More', icon: 'more'},
];
const tabPages: Page[] = ['Dashboard', 'Courses', 'Students', 'Messages', 'More'];

export default function App() {
  return <SafeAreaProvider initialMetrics={initialWindowMetrics}><InstructorApp /></SafeAreaProvider>;
}

function InstructorApp() {
  const [page, setPage] = useState<Page>('Login');
  const [pendingEmail, setPendingEmail] = useState('');
  const [course, setCourse] = useState<InstructorCourse | undefined>();
  const [thread, setThread] = useState<Thread>(threads[0]);
  const [draftTitle, setDraftTitle] = useState('Data analysis in Excel');
  const nav = (p: Page) => setPage(p);
  const openCourse = (c: InstructorCourse) => { setCourse(c); setDraftTitle(c.title); nav('Setup'); };

  const onStep = (key: string) => {
    if (key === 'curriculum') nav('Curriculum');
    else if (key === 'pricing') nav('Pricing');
    else if (key === 'publish') nav('Publish');
    else Alert.alert('Basics', 'Editing course details is not connected yet.');
  };
  const openMore = (link: MoreLink) => {
    if (link === 'Discussions') nav('Discussion');
    else if (link === 'Announcements') nav('Announcement');
    else if (link === 'Live') nav('Live');
    else if (link === 'Certificate') nav('Certificate');
    else Alert.alert(link === 'Profile' ? 'Profile' : 'Help centre', 'This is not connected yet.');
  };
  const logout = () => { auth.clear(); setPendingEmail(''); nav('Login'); };
  const onPick = (type: LessonType) => {
    if (type === 'Quiz') nav('Quiz');
    else if (type === 'Assignment') nav('Assessment');
    else nav('Upload');
  };

  const screen = (() => {
    switch (page) {
      case 'Login': return <LoginScreen onSignUp={() => Alert.alert('Instructor access', 'Instructor accounts are set up by invitation. Log in with your email.')} onSso={() => Alert.alert('Organisation login', 'School and work sign-in is not connected yet.')} onSent={email => { setPendingEmail(email); nav('Verify'); }} />;
      case 'Verify': return <VerifyCodeScreen key={pendingEmail} email={pendingEmail} onBack={() => nav('Login')} onVerified={() => nav('Dashboard')} />;
      case 'Dashboard': return <DashboardScreen onGrading={() => nav('Grading')} onNotifications={() => nav('Notifications')} onGradeItem={() => nav('Grade')} />;
      case 'Courses': return <CoursesScreen onOpen={openCourse} onNew={() => { setCourse(undefined); setDraftTitle('New course'); nav('Setup'); }} onNotifications={() => nav('Notifications')} />;
      case 'Students': return <StudentsScreen onOpen={() => nav('Student')} onNotifications={() => nav('Notifications')} />;
      case 'Messages': return <MessagesScreen onOpen={t => { setThread(t); nav('Conversation'); }} onNotifications={() => nav('Notifications')} />;
      case 'Conversation': return <ConversationScreen key={thread.id} thread={thread} onBack={() => nav('Messages')} />;
      case 'More': return <MoreScreen onOpen={openMore} onNotifications={() => nav('Notifications')} onLogout={logout} />;
      case 'Announcement': return <AnnouncementScreen onBack={() => nav('More')} onSent={() => nav('More')} />;
      case 'Live': return <LiveSessionsScreen onBack={() => nav('More')} />;
      case 'Certificate': return <CertificateScreen onBack={() => nav('More')} onSave={() => nav('More')} />;
      case 'Notifications': return <EmptyState title="Notifications" message="This screen is waiting on its design." actionLabel="Back" onAction={() => nav('Dashboard')} />;
      case 'Grading': return <GradingScreen onBack={() => nav('Dashboard')} onOpen={() => nav('Grade')} onNotifications={() => nav('Notifications')} />;
      case 'Grade': return <GradeSubmissionScreen onBack={() => nav('Grading')} onSave={() => nav('Grading')} onRubric={() => Alert.alert('Rubric', 'Rubrics are not connected yet.')} />;
      case 'Setup': return <SetupScreen title={draftTitle} onBack={() => nav('Courses')} onStep={onStep} />;
      case 'Curriculum': return <CurriculumScreen onBack={() => nav('Setup')} onPick={onPick} />;
      case 'Quiz': return <QuizBuilderScreen onBack={() => nav('Curriculum')} onSave={() => nav('Curriculum')} />;
      case 'Assessment': return <AssessmentBuilderScreen onBack={() => nav('Curriculum')} onSave={() => nav('Curriculum')} />;
      case 'Upload': return <UploadVideoScreen onBack={() => nav('Curriculum')} onDone={() => nav('Curriculum')} />;
      case 'Pricing': return <PricingScreen onBack={() => nav('Setup')} onSave={() => nav('Setup')} />;
      case 'Publish': return <PublishChecklistScreen onBack={() => nav('Setup')} onFix={id => (id === 'c3' ? nav('Pricing') : Alert.alert('Thumbnail', 'Thumbnail upload is not connected yet.'))} onPublish={() => Alert.alert('Publish', `${course?.title ?? draftTitle} can be published once the API is connected.`)} />;
      case 'Student': return <StudentDetailScreen onBack={() => nav('Students')} onMessage={() => { setThread(threads[0]); nav('Conversation'); }} />;
      case 'Discussion': return <DiscussionScreen onBack={() => nav('Student')} />;
    }
  })();

  const showTabs = tabPages.includes(page);
  return <LaunchIntro><SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
    <StatusBar barStyle="dark-content" />
    <View style={styles.app}>
      <ScreenTransition key={page}>{screen}</ScreenTransition>
      {showTabs && <TabBar items={tabs} active={page as Tab} onSelect={nav} />}
    </View>
  </SafeAreaView></LaunchIntro>;
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.cream},
  app: {flex: 1, backgroundColor: colors.cream},
});
