import React, {useMemo, useState} from 'react';
import {FlatList, Pressable, StyleSheet, View} from 'react-native';
import {Icon} from '../../components/Icon';
import {EmptyState} from '../../components/States';
import {myCourses, type CourseStatus, type InstructorCourse} from '../../data/instructor';
import {colors, spacing} from '../../theme/tokens';
import {IconBadge, Pill, Row, Segments, TabHeader, type Tone} from './shared';

type Filter = 'All' | 'Published' | 'Draft';
const statusTone: Record<CourseStatus, Tone> = {Published: 'green', Draft: 'grey', 'In review': 'amber'};

type Props = {onOpen: (course: InstructorCourse) => void; onNew: () => void; onNotifications: () => void};

export function CoursesScreen({onOpen, onNew, onNotifications}: Props) {
  const [filter, setFilter] = useState<Filter>('All');
  const rows = useMemo(() => myCourses.filter(c => filter === 'All' || c.status === filter), [filter]);
  return <View style={styles.screen}>
    <TabHeader title="My courses" onBell={onNotifications} />
    <Segments items={['All', 'Published', 'Draft'] as const} active={filter} onSelect={setFilter} />
    <FlatList data={rows} keyExtractor={c => c.id} contentContainerStyle={styles.list}
      ListEmptyComponent={<EmptyState title="No courses here" message="Courses you create will show in this list." />}
      renderItem={({item, index}) => <Row order={index} onPress={() => onOpen(item)} leading={<IconBadge name="book" />} title={item.title}
        meta={`${item.lessons} lessons`} trailing={<Pill label={item.status} tone={statusTone[item.status]} />} />} />
    <Pressable onPress={onNew} style={({pressed}) => [styles.fab, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel="New course">
      <Icon name="plus" size={26} color={colors.white} />
    </Pressable>
  </View>;
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.cream},
  list: {paddingHorizontal: spacing.screen, paddingBottom: 100, flexGrow: 1},
  pressed: {opacity: 0.85},
  fab: {position: 'absolute', right: spacing.screen, bottom: 24, width: 58, height: 58, borderRadius: 29, backgroundColor: colors.blue700, alignItems: 'center', justifyContent: 'center', shadowColor: colors.blue900, shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: {width: 0, height: 4}, elevation: 4},
});
