import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
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

type Props = {onOpen: (course: InstructorCourse) => void; onNew: () => void; onNotifications: () => void};

export function CoursesScreen({onOpen, onNew, onNotifications}: Props) {
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
    <Pressable onPress={onNew} style={({pressed}) => [styles.fab, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel="New course">
      <Icon name="plus" size={26} color={colors.white} />
    </Pressable>
  </View>;
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.cream},
  list: {paddingHorizontal: spacing.screen, paddingBottom: 100, flexGrow: 1},
  pressed: {opacity: 0.85},
  retry: {margin: spacing.screen, padding: 16, borderRadius: 12, backgroundColor: colors.blue50},
  retryText: {fontSize: 15, color: colors.blue700, fontFamily: fonts.bold},
  fab: {position: 'absolute', right: spacing.screen, bottom: 24, width: 58, height: 58, borderRadius: 29, backgroundColor: colors.blue700, alignItems: 'center', justifyContent: 'center', shadowColor: colors.blue900, shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: {width: 0, height: 4}, elevation: 4},
});
