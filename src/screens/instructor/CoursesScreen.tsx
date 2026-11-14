import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, Alert, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {instructorApi, type CourseRow} from '../../api/endpoints';
import {Icon} from '../../components/Icon';
import {EmptyState} from '../../components/States';
import {type CourseStatus, type InstructorCourse} from '../../data/instructor';
import {colors, fonts, spacing} from '../../theme/tokens';
import {font, IconBadge, Pill, Row, Segments, TabHeader, type Tone} from './shared';

const toStatus = (s: CourseRow['status']): CourseStatus => (s === 'published' ? 'Published' : s === 'in_review' ? 'In review' : 'Draft');
const toCourse = (c: CourseRow): InstructorCourse => ({id: c.id, title: c.title, lessons: c.lessonCount, status: toStatus(c.status)});

type Filter = 'All' | 'Published' | 'Draft';
const statusTone: Record<CourseStatus, Tone> = {Published: 'green', Draft: 'grey', 'In review': 'amber'};

type Props = {onOpen: (course: InstructorCourse) => void; onNotifications: () => void};

export function CoursesScreen({onOpen, onNotifications}: Props) {
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const create = async () => {
    if (newTitle.trim().length < 3 || busy) return;
    setBusy(true);
    try { const c = await instructorApi.createCourse(newTitle.trim()); setCreating(false); setNewTitle(''); onOpen({id: c.id, title: c.title, lessons: 0, status: 'Draft'}); }
    catch (e) { Alert.alert('Could not create the course', e instanceof Error ? e.message : 'Try again.'); }
    finally { setBusy(false); }
  };
  const [filter, setFilter] = useState<Filter>('All');
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const load = useCallback(() => {
    setState('loading');
    instructorApi.courses().then(p => { setCourses(p.data.map(toCourse)); setState('ready'); }, e => { setError(e instanceof Error ? e.message : 'Could not load your courses.'); setState('error'); });
  }, []);
  useEffect(load, [load]);
  const rows = useMemo(() => courses.filter(c => filter === 'All' || c.status === filter), [courses, filter]);
  return <View style={styles.screen}>
    <TabHeader title="My courses" onBell={onNotifications} />
    <Segments items={['All', 'Published', 'Draft'] as const} active={filter} onSelect={setFilter} />
    {state === 'loading' && <ActivityIndicator color={colors.blue700} style={{marginTop: 24}} />}
    {state === 'error' && <Pressable onPress={load} style={styles.retry} accessibilityRole="button"><Text style={[font, styles.retryText]}>{error} Tap to try again.</Text></Pressable>}
    {state === 'ready' && <FlatList data={rows} keyExtractor={c => c.id} contentContainerStyle={styles.list}
      ListEmptyComponent={<EmptyState title={courses.length ? 'No courses here' : 'No courses yet'} message={courses.length ? 'Try another filter.' : 'Courses you create will show in this list.'} />}
      renderItem={({item, index}) => <Row order={index} onPress={() => onOpen(item)} leading={<IconBadge name="book" />} title={item.title}
        meta={`${item.lessons} lessons`} trailing={<Pill label={item.status} tone={statusTone[item.status]} />} />} />}
    <Pressable onPress={() => setCreating(true)} style={({pressed}) => [styles.fab, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel="New course">
      <Icon name="plus" size={26} color={colors.white} />
    </Pressable>
    <Modal visible={creating} transparent animationType="fade" onRequestClose={() => setCreating(false)}>
      <Pressable style={styles.scrim} onPress={() => setCreating(false)} accessibilityLabel="Close" />
      <View style={styles.sheet}>
        <Text style={[font, styles.sheetTitle]}>New course</Text>
        <TextInput value={newTitle} onChangeText={setNewTitle} placeholder="Course title" placeholderTextColor={colors.muted} style={[font, styles.titleInput]} autoFocus />
        <Pressable onPress={create} disabled={busy || newTitle.trim().length < 3} style={[styles.createBtn, (busy || newTitle.trim().length < 3) && styles.dim]} accessibilityRole="button">
          <Text style={[font, styles.createText]}>{busy ? 'Creating…' : 'Create course'}</Text>
        </Pressable>
      </View>
    </Modal>
  </View>;
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.cream},
  list: {paddingHorizontal: spacing.screen, paddingBottom: 100, flexGrow: 1},
  pressed: {opacity: 0.85},
  scrim: {flex: 1, backgroundColor: 'rgba(0,0,0,0.45)'},
  sheet: {backgroundColor: colors.cream, padding: spacing.screen, paddingBottom: 32, borderTopLeftRadius: 24, borderTopRightRadius: 24},
  sheetTitle: {fontSize: 20, color: colors.ink, fontFamily: fonts.display, marginBottom: 14},
  titleInput: {minHeight: 52, borderRadius: 12, borderWidth: 1, borderColor: colors.sandLine, backgroundColor: colors.white, paddingHorizontal: 16, fontSize: 16, color: colors.ink},
  createBtn: {height: 52, borderRadius: 12, backgroundColor: colors.blue700, alignItems: 'center', justifyContent: 'center', marginTop: 14},
  createText: {fontSize: 16, color: colors.white, fontFamily: fonts.bold},
  dim: {opacity: 0.5},
  retry: {margin: spacing.screen, padding: 16, borderRadius: 12, backgroundColor: colors.blue50},
  retryText: {fontSize: 15, color: colors.blue700, fontFamily: fonts.bold},
  fab: {position: 'absolute', right: spacing.screen, bottom: 24, width: 58, height: 58, borderRadius: 29, backgroundColor: colors.blue700, alignItems: 'center', justifyContent: 'center', shadowColor: colors.blue900, shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: {width: 0, height: 4}, elevation: 4},
});
