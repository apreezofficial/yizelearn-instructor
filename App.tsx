import React, {useEffect, useRef, useState} from 'react';
import {Alert, BackHandler, StatusBar, StyleSheet, useColorScheme, View} from 'react-native';
import {initialWindowMetrics, SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {TabBar, type TabItem} from './src/components/Catalog';
import {LaunchIntro} from './src/components/LaunchIntro';
import {ScreenTransition} from './src/components/ScreenTransition';
import {EmptyState} from './src/components/States';
import {setIdentity, type InstructorCourse, type LessonType} from './src/data/instructor';
import {LoginScreen} from './src/screens/auth/AuthScreens';
import {errorCodes, isErrorWithCode, pick as pickFile, types} from '@react-native-documents/picker';
import {authApi, instructorApi, uploadsApi} from './src/api/endpoints';
import type {User} from './src/api/types';
import {
  AssessmentBuilderScreen, CurriculumScreen, PricingScreen, PublishChecklistScreen, BasicsScreen, QuizBuilderScreen, SetupScreen, UploadVideoScreen,
} from './src/screens/instructor/CourseBuilderScreens';
import {CoursesScreen} from './src/screens/instructor/CoursesScreen';
import {DashboardScreen} from './src/screens/instructor/DashboardScreen';
import {GradeSubmissionScreen, GradingScreen, StudentsScreen} from './src/screens/instructor/GradingScreens';
import {AnnouncementScreen, LiveSessionsScreen, MoreScreen, type MoreLink} from './src/screens/instructor/MoreScreens';
import {PublicProfileScreen, SettingsScreen} from './src/screens/instructor/ProfileHelpScreens';
import {CertificateScreen, DiscussionScreen, EditProfileScreen, NotificationSettingsScreen, NotificationsScreen, ProfileScreen, SecurityScreen, StudentDetailScreen} from './src/screens/instructor/AccountScreens';
import {InstructorHelpScreen} from './src/screens/instructor/HelpScreen';
import {ConversationScreen, MessagesScreen, type Thread} from './src/screens/instructor/MessagesScreens';
import {colors} from './src/theme/tokens';

type Tab = 'Dashboard' | 'Courses' | 'Students' | 'Messages' | 'More';
type Page = Tab | 'Login' | 'Verify' | 'Notifications' | 'Grading' | 'Grade' | 'Setup' | 'Curriculum' | 'Quiz' | 'Assessment'
  | 'Upload' | 'Pricing' | 'Basics' | 'Publish' | 'Student' | 'Discussion' | 'Sso' | 'Announcement' | 'Live' | 'Certificate' | 'Conversation'
  | 'Profile' | 'EditProfile' | 'PublicProfile' | 'Settings' | 'NotificationSettings' | 'Security' | 'Help' | 'HelpSearch' | 'HelpArticle' | 'ContactSupport' | 'MessageSent' | 'Tickets' | 'TicketDetail';

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
  const [user, setUser] = useState<User | undefined>();
  const [course, setCourse] = useState<InstructorCourse | undefined>();
  const [thread, setThread] = useState<Thread>({id: '', name: '', initials: '', last: '', time: '', unread: false});
  const [draftTitle, setDraftTitle] = useState('Data analysis in Excel');
  const [feedback, setFeedback] = useState(false);
  const [gradeId, setGradeId] = useState('');
  const [editId, setEditId] = useState('');
  const [uploadKind, setUploadKind] = useState<'video' | 'document'>('video');
  const [learner, setLearner] = useState<{id: string; courseId: string}>({id: '', courseId: ''});
  // Pages visited since the last tab, so Android's back button retraces them.
  const history = useRef<Page[]>([]);
  const nav = (p: Page) => {
    if (p === page) return;
    history.current = tabPages.includes(p) || p === 'Login' ? [] : [...history.current.filter(h => h !== p), page];
    setPage(p);
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      const prev = history.current.pop();
      if (prev) { setPage(prev); return true; }
      if (page !== 'Dashboard' && page !== 'Login') { history.current = []; setPage(tabPages.includes(page) ? 'Dashboard' : 'Login'); return true; }
      return false;
    });
    return () => sub.remove();
  });
  const pickThumbnail = async () => {
    if (!course) return;
    try {
      const [res] = await pickFile({type: [types.images], mode: 'import'});
      const id = await uploadsApi.upload({uri: res.uri, name: res.name ?? 'thumbnail.jpg', type: res.type ?? 'image/jpeg', size: res.size ?? 0}, 'course_thumbnail');
      await instructorApi.setThumbnail(course.id, id);
      Alert.alert('Thumbnail added', 'Go back to the checklist to see it tick off.');
    } catch (e) {
      if (!(isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED)) Alert.alert('Could not add the thumbnail', e instanceof Error ? e.message : 'Try again.');
    }
  };
  const openCourse = (c: InstructorCourse) => { setCourse(c); setDraftTitle(c.title); nav('Setup'); };

  const onStep = (key: string) => {
    if (key === 'curriculum') nav('Curriculum');
    else if (key === 'pricing') nav('Pricing');
    else if (key === 'publish') nav('Publish');
    else nav('Basics');
  };
  const openMore = (link: MoreLink) => {
    if (link === 'Discussions') nav('Discussion');
    else if (link === 'Announcements') nav('Announcement');
    else if (link === 'Live') nav('Live');
    else if (link === 'Certificate') nav('Certificate');
    else if (link === 'Profile') nav('Profile');
    else if (link === 'Help') nav('Help');
  };
  const logout = () => { authApi.logout().finally(() => { setUser(undefined); history.current = []; setPage('Login'); }); };
  const onPick = (type: LessonType) => {
    if (type === 'Quiz') nav('Quiz');
    else if (type === 'Assignment') nav('Assessment');
    else nav('Upload');
  };

  const screen = (() => {
    switch (page) {
      case 'Login': return <LoginScreen onSignUp={() => Alert.alert('Instructor access', 'Instructor accounts are set up by your admin. Ask them for an invitation.')} onSignedIn={u => { setIdentity(u.name); setUser(u); nav('Dashboard'); }} />;
      case 'Dashboard': return <DashboardScreen onGrading={() => nav('Grading')} onNotifications={() => nav('Notifications')} onGradeItem={id => { setGradeId(id); nav('Grade'); }} />;
      case 'Courses': return <CoursesScreen onOpen={openCourse} onNotifications={() => nav('Notifications')} />;
      case 'Students': return <StudentsScreen onOpen={(id, courseId) => { setLearner({id, courseId}); nav('Student'); }} onNotifications={() => nav('Notifications')} />;
      case 'Messages': return <MessagesScreen onOpen={t => { setThread(t); nav('Conversation'); }} onNotifications={() => nav('Notifications')} />;
      case 'Conversation': return <ConversationScreen key={thread.id} thread={thread} onBack={() => nav('Messages')} />;
      case 'More': return <MoreScreen onOpen={openMore} onNotifications={() => nav('Notifications')} onLogout={logout} />;
      case 'Profile': return <ProfileScreen onBack={() => nav('More')} onEdit={() => nav('EditProfile')} onSettings={() => nav('Settings')} />;
      case 'EditProfile': return <EditProfileScreen onBack={() => nav('Profile')} onSave={() => nav('Profile')} />;
      case 'PublicProfile': return <PublicProfileScreen onBack={() => nav('Profile')} />;
      case 'Settings': return <SettingsScreen onBack={() => nav('Profile')} onNotifications={() => nav('NotificationSettings')} onSecurity={() => nav('Security')} onHelp={() => nav('Help')} onLogout={logout} />;
      case 'NotificationSettings': return <NotificationSettingsScreen onBack={() => nav('Settings')} />;
      case 'Security': return <SecurityScreen onBack={() => nav('Settings')} />;
      case 'Help': return <InstructorHelpScreen onBack={() => nav('More')} />;
      case 'Announcement': return <AnnouncementScreen onBack={() => nav('More')} onSent={() => nav('More')} />;
      case 'Live': return <LiveSessionsScreen onBack={() => nav('More')} />;
      case 'Certificate': return <CertificateScreen onBack={() => nav('More')} onSave={() => nav('More')} />;
      case 'Notifications': return <NotificationsScreen onBack={() => nav('Dashboard')} />;
      case 'Grading': return <GradingScreen onBack={() => nav('Dashboard')} onOpen={id => { setGradeId(id); nav('Grade'); }} onNotifications={() => nav('Notifications')} />;
      case 'Grade': return <GradeSubmissionScreen key={gradeId} id={gradeId} onBack={() => nav('Grading')} onSave={() => nav('Grading')} />;
      case 'Setup': return <SetupScreen courseId={course?.id} title={draftTitle} onBack={() => nav('Courses')} onStep={onStep} />;
      case 'Curriculum': return <CurriculumScreen courseId={course?.id} onBack={() => nav('Setup')} onEdit={(kind, id) => { setEditId(id); if (kind === 'video' || kind === 'document') { setUploadKind(kind); nav('Upload'); } else nav(kind === 'quiz' ? 'Quiz' : 'Assessment'); }} />;
      case 'Quiz': return <QuizBuilderScreen key={editId} quizId={editId} onBack={() => nav('Curriculum')} onSave={() => nav('Curriculum')} />;
      case 'Assessment': return <AssessmentBuilderScreen key={editId} assessmentId={editId} onBack={() => nav('Curriculum')} onSave={() => nav('Curriculum')} />;
      case 'Upload': return <UploadVideoScreen key={editId} lessonId={editId} kind={uploadKind} onBack={() => nav('Curriculum')} onDone={() => nav('Curriculum')} />;
      case 'Pricing': return <PricingScreen courseId={course?.id} onBack={() => nav('Setup')} onSave={() => nav('Setup')} />;
      case 'Publish': return <PublishChecklistScreen courseId={course?.id} onBack={() => nav('Setup')} onFix={target => (target === 'curriculum' ? nav('Curriculum') : target === 'pricing' ? nav('Pricing') : target === 'basics' ? nav('Basics') : pickThumbnail())} onPublished={() => nav('Courses')} />;
      case 'Basics': return course ? <BasicsScreen courseId={course.id} onBack={() => nav('Setup')} onSave={() => nav('Setup')} /> : null;
      case 'Student': return <StudentDetailScreen key={learner.id} learnerId={learner.id} courseId={learner.courseId} onBack={() => nav('Students')} onMessage={() => nav('Messages')} />;
      case 'Discussion': return <DiscussionScreen onBack={() => nav('More')} />;
    }
  })();

  const showTabs = tabPages.includes(page);
  return <LaunchIntro><SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
    <StatusBar barStyle={useColorScheme() === 'dark' ? 'light-content' : 'dark-content'} />
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
