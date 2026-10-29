import React, {useMemo, useState} from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import {Icon} from '../../components/Icon';
import {EmptyState} from '../../components/States';
import {myCourses, type CourseStatus, type InstructorCourse} from '../../data/instructor';
import {colors, radius, spacing, type} from '../../theme/tokens';
import {font, Pill, Segments, TabHeader, type Tone} from './shared';

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
      renderItem={({item}) => <Pressable onPress={() => onOpen(item)} style={({pressed}) => [styles.row, pressed && styles.pressed]} accessibilityRole="button">
        <View style={styles.icon}><Icon name="book" size={20} color={colors.blue700} /></View>
        <View style={styles.copy}>
          <Text style={[styles.title, font]}>{item.title}</Text>
          <Text style={[styles.meta, font]}>{item.lessons} lessons</Text>
        </View>
        <Pill label={item.status} tone={statusTone[item.status]} />
      </Pressable>} />
    <Pressable onPress={onNew} style={({pressed}) => [styles.fab, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel="New course">
      <Icon name="plus" size={26} color={colors.onSky} />
    </Pressable>
  </View>;
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.cream},
  list: {paddingHorizontal: spacing.screen, paddingBottom: 100, flexGrow: 1},
  row: {flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.card, padding: 14, marginBottom: 12},
  icon: {width: 44, height: 44, borderRadius: 22, backgroundColor: colors.blue100, alignItems: 'center', justifyContent: 'center'},
  copy: {flex: 1},
  title: {fontSize: type.label, color: colors.ink, fontWeight: '800'},
  meta: {fontSize: type.caption, color: colors.muted, marginTop: 4},
  pressed: {opacity: 0.85},
  fab: {position: 'absolute', right: spacing.screen, bottom: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: colors.sky, alignItems: 'center', justifyContent: 'center'},
});
