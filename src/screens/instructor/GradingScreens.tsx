import React, {useMemo, useState} from 'react';
import {FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {ProgressBar} from '../../components/Chalkboard';
import {Icon} from '../../components/Icon';
import {PrimaryAction} from '../../components/Layout';
import {EmptyState} from '../../components/States';
import {discussion, gradingQueue, students, studentDetail, submission, type GradeStatus, type StudentFilter} from '../../data/instructor';
import {colors, radius, spacing, type} from '../../theme/tokens';
import {Avatar, font, Pill, Segments, SectionTitle, StackHeader, TabHeader, type Tone} from './shared';

const gradeTone: Record<GradeStatus, Tone> = {Pending: 'amber', Overdue: 'red', Graded: 'green'};

export function GradingScreen({onBack, onOpen, onNotifications}: {onBack: () => void; onOpen: () => void; onNotifications: () => void}) {
  const [filter, setFilter] = useState<'Pending' | 'Graded'>('Pending');
  const rows = useMemo(() => gradingQueue.filter(g => (filter === 'Graded' ? g.status === 'Graded' : g.status !== 'Graded')), [filter]);
  return <View style={styles.screen}>
    <TabHeader title="Grading" onBell={onNotifications} />
    <Segments items={['Pending', 'Graded'] as const} active={filter} onSelect={setFilter} />
    <FlatList data={rows} keyExtractor={g => g.id} contentContainerStyle={styles.list}
      ListEmptyComponent={<EmptyState title={filter === 'Pending' ? 'Nothing to grade' : 'No graded work yet'} message="Submissions will appear here." />}
      renderItem={({item}) => <Pressable onPress={onOpen} style={({pressed}) => [styles.row, pressed && styles.pressed]} accessibilityRole="button">
        <Avatar initials={item.initials} size={44} />
        <View style={styles.copy}>
          <Text style={[styles.title, font]}>{item.learner}</Text>
          <Text style={[styles.meta, font]}>{item.title}, {item.time}</Text>
        </View>
        <Pill label={item.status} tone={gradeTone[item.status]} />
      </Pressable>} />
  </View>;
}

export function GradeSubmissionScreen({onBack, onSave, onRubric}: {onBack: () => void; onSave: () => void; onRubric: () => void}) {
  const [score, setScore] = useState(submission.score);
  const [feedback, setFeedback] = useState(submission.feedback);
  return <View style={styles.screen}>
    <StackHeader title="Grade submission" onBack={onBack} />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={styles.fileCard}>
        <Icon name="document" size={22} color={colors.blue700} />
        <View style={styles.copy}>
          <Text style={[styles.title, font]}>{submission.file}</Text>
          <Text style={[styles.meta, font]}>{submission.learner}, {submission.size}</Text>
        </View>
      </View>

      <View style={styles.similarity}>
        <Text style={[styles.simLabel, font]}>Similarity report</Text>
        <View style={styles.simRow}>
          <Text style={[styles.simValue, font]}>{submission.similarity}%</Text>
          <View style={styles.simBar}><ProgressBar value={submission.similarity} fill={colors.success} track="rgba(46, 139, 103, 0.2)" height={6} /></View>
          <Text style={[styles.simNote, font]}>Low</Text>
        </View>
      </View>

      <View style={styles.pair}>
        <View style={styles.half}>
          <Text style={[styles.label, font]}>Score</Text>
          <TextInput value={score} onChangeText={setScore} style={[styles.input, font]} />
        </View>
        <View style={styles.half}>
          <Text style={[styles.label, font]}>Rubric</Text>
          <Pressable onPress={onRubric} style={styles.input} accessibilityRole="button"><Text style={[styles.link, font]}>Open rubric</Text></Pressable>
        </View>
      </View>

      <Text style={[styles.label, font, styles.gap]}>Feedback</Text>
      <TextInput value={feedback} onChangeText={setFeedback} placeholder="Write feedback for the learner" placeholderTextColor={colors.muted} multiline style={[styles.input, styles.feedback, font]} />
    </ScrollView>
    <View style={styles.footer}><PrimaryAction label="Save grade" onPress={onSave} /></View>
  </View>;
}

export function StudentsScreen({onOpen, onNotifications}: {onOpen: () => void; onNotifications: () => void}) {
  const [filter, setFilter] = useState<StudentFilter>('All');
  const [query, setQuery] = useState('');
  const rows = useMemo(() => students.filter(s =>
    (filter === 'All' || (filter === 'Behind' ? s.behind : !s.behind && s.progress === 100)) &&
    s.name.toLowerCase().includes(query.trim().toLowerCase())), [filter, query]);
  return <View style={styles.screen}>
    <TabHeader title="Students" onBell={onNotifications} />
    <View style={styles.searchWrap}>
      <View style={styles.search}>
        <Icon name="search" size={18} color={colors.muted} />
        <TextInput value={query} onChangeText={setQuery} placeholder="Search students" placeholderTextColor={colors.muted} style={[styles.searchInput, font]} />
      </View>
    </View>
    <Segments items={['All', 'Behind', 'Done'] as const} active={filter} onSelect={setFilter} />
    <FlatList data={rows} keyExtractor={s => s.id} contentContainerStyle={styles.list}
      ListEmptyComponent={<EmptyState title="No students found" message="Try another search or filter." />}
      renderItem={({item}) => <Pressable onPress={onOpen} style={({pressed}) => [styles.row, pressed && styles.pressed]} accessibilityRole="button">
        <Avatar initials={item.initials} size={44} />
        <View style={styles.copy}>
          <Text style={[styles.title, font]}>{item.name}</Text>
          <Text style={[styles.meta, font]}>{item.course}</Text>
        </View>
        {item.note === 'Pending' && <Pill label="Pending" tone="amber" />}
        {item.note === 'Done' && <Pill label="Done" tone="green" />}
        {!item.note && <Icon name="next" size={18} color={colors.muted} />}
      </Pressable>} />
  </View>;
}

export function StudentDetailScreen({onBack, onMessage}: {onBack: () => void; onMessage: () => void}) {
  const d = studentDetail;
  return <View style={styles.screen}>
    <StackHeader title="Student" onBack={onBack} />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.profile}>
        <Avatar initials={d.initials} size={88} />
        <Text style={[styles.name, font]}>{d.name}</Text>
        <Text style={[styles.meta, font]}>Enrolled {d.enrolled}</Text>
      </View>
      <View style={styles.progressCard}>
        <Text style={[styles.meta, font]}>{d.course}</Text>
        <ProgressBar value={d.progress} height={8} />
        <View style={styles.progressFoot}>
          <Text style={[styles.bigPct, font]}>{d.progress}%</Text>
          <Text style={[styles.meta, font]}>{d.lessonsDone} of {d.lessonsTotal} lessons</Text>
        </View>
      </View>
      <SectionTitle title="Grades" />
      {d.grades.map(g => <View key={g.title} style={styles.gradeRow}>
        <Text style={[styles.title, font]}>{g.title}</Text>
        <Text style={[styles.score, font]}>{g.score}</Text>
      </View>)}
    </ScrollView>
    <View style={styles.footer}><PrimaryAction label="Message student" onPress={onMessage} /></View>
  </View>;
}

export function DiscussionScreen({onBack}: {onBack: () => void}) {
  const [reply, setReply] = useState('');
  const q = discussion.question;
  return <View style={styles.screen}>
    <StackHeader title="Discussion" onBack={onBack} />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.question}>
        <View style={styles.qHead}>
          <Avatar initials={q.initials} size={30} />
          <View style={styles.copy}>
            <Text style={[styles.title, font]}>{q.author}</Text>
            <Text style={[styles.meta, font]}>{q.meta}</Text>
          </View>
        </View>
        <Text style={[styles.qText, font]}>{q.text}</Text>
      </View>
      {discussion.replies.map((r, i) => <View key={i} style={styles.reply}>
        <Text style={[styles.replyLabel, font]}>You</Text>
        <Text style={[styles.replyText, font]}>{r.text}</Text>
      </View>)}
    </ScrollView>
    <View style={styles.composer}>
      <TextInput value={reply} onChangeText={setReply} placeholder="Write a reply" placeholderTextColor={colors.muted} style={[styles.input, styles.composerInput, font]} />
      <Pressable onPress={() => setReply('')} disabled={!reply.trim()} style={[styles.send, !reply.trim() && styles.dim]} accessibilityRole="button" accessibilityLabel="Send reply">
        <Icon name="send" size={20} color={colors.onSky} />
      </Pressable>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.cream},
  list: {paddingHorizontal: spacing.screen, paddingBottom: 28, flexGrow: 1},
  content: {padding: spacing.screen, paddingBottom: 28},
  footer: {paddingHorizontal: spacing.screen, paddingVertical: 14, backgroundColor: colors.barBg, borderTopWidth: 1, borderTopColor: colors.line},
  row: {flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.card, padding: 14, marginBottom: 10},
  copy: {flex: 1},
  title: {fontSize: type.label, color: colors.ink, fontWeight: '800'},
  meta: {fontSize: type.caption, color: colors.muted, marginTop: 3},
  pressed: {opacity: 0.85},
  searchWrap: {paddingHorizontal: spacing.screen, marginBottom: 14},
  search: {flexDirection: 'row', alignItems: 'center', gap: 10, height: 52, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.sandLine, backgroundColor: colors.white, paddingHorizontal: 18},
  searchInput: {flex: 1, fontSize: type.body, color: colors.ink, paddingVertical: 0},
  fileCard: {flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.card, padding: 14},
  similarity: {backgroundColor: '#E4F3EB', borderRadius: radius.card, padding: 16, marginTop: 14},
  simLabel: {fontSize: type.small, color: colors.ink, fontWeight: '700'},
  simRow: {flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8},
  simValue: {fontSize: type.heading + 4, color: colors.ink, fontWeight: '800'},
  simBar: {flex: 1},
  simNote: {fontSize: type.caption, color: colors.success, fontWeight: '700'},
  pair: {flexDirection: 'row', gap: 12, marginTop: 16},
  half: {flex: 1},
  label: {fontSize: type.small, color: colors.ink, fontWeight: '700', marginBottom: 8},
  input: {minHeight: 52, borderRadius: radius.field, borderWidth: 1, borderColor: colors.sandLine, backgroundColor: colors.white, paddingHorizontal: 16, justifyContent: 'center', fontSize: type.body, color: colors.ink},
  feedback: {minHeight: 140, paddingTop: 14, textAlignVertical: 'top'},
  link: {fontSize: type.body, color: colors.blue700, fontWeight: '700'},
  gap: {marginTop: 18},
  profile: {alignItems: 'center', gap: 8, paddingVertical: 12},
  name: {fontSize: type.heading, color: colors.ink, fontWeight: '800', marginTop: 8},
  progressCard: {backgroundColor: colors.blue50, borderRadius: radius.card, padding: 16, gap: 10, marginTop: 8},
  progressFoot: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4},
  bigPct: {fontSize: type.title, color: colors.ink, fontWeight: '800'},
  gradeRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 52, borderBottomWidth: 1, borderBottomColor: colors.line},
  score: {fontSize: type.label, color: colors.ink, fontWeight: '800'},
  question: {backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.card, padding: 16},
  qHead: {flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10},
  qText: {fontSize: type.label, color: colors.ink, lineHeight: 22},
  reply: {alignSelf: 'flex-end', maxWidth: '82%', backgroundColor: colors.sky, borderRadius: radius.card, padding: 14, marginTop: 12},
  replyLabel: {fontSize: type.caption, color: colors.onSky, fontWeight: '800', marginBottom: 4},
  replyText: {fontSize: type.label, color: colors.onSky, lineHeight: 21},
  composer: {flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: spacing.screen, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.barBg},
  composerInput: {flex: 1, borderRadius: radius.pill},
  send: {width: 52, height: 52, borderRadius: 26, backgroundColor: colors.sky, alignItems: 'center', justifyContent: 'center'},
  dim: {opacity: 0.5},
});
