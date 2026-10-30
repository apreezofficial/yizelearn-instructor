import React, {useMemo, useState} from 'react';
import {FlatList, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {ProgressBar} from '../../components/Chalkboard';
import {Icon} from '../../components/Icon';
import {EmptyState} from '../../components/States';
import {discussion, gradingQueue, students, studentDetail, submission, type GradeStatus, type StudentFilter} from '../../data/instructor';
import {colors, radius, spacing, type} from '../../theme/tokens';
import {Avatar, font, Footer, IconBadge, Pill, Row, Segments, SectionTitle, StackHeader, TabHeader, type Tone} from './shared';

const gradeTone: Record<GradeStatus, Tone> = {Pending: 'amber', Overdue: 'red', Graded: 'green'};

export function GradingScreen({onBack, onOpen}: {onBack: () => void; onOpen: () => void; onNotifications?: () => void}) {
  const [filter, setFilter] = useState<'Pending' | 'Graded'>('Pending');
  const rows = useMemo(() => gradingQueue.filter(g => (filter === 'Graded' ? g.status === 'Graded' : true)), [filter]);
  return <View style={styles.screen}>
    <StackHeader title="Grading" onBack={onBack} />
    <Segments items={['Pending', 'Graded'] as const} active={filter} onSelect={setFilter} />
    <FlatList data={rows} keyExtractor={g => g.id} contentContainerStyle={styles.list}
      ListEmptyComponent={<EmptyState title={filter === 'Pending' ? 'Nothing to grade' : 'No graded work yet'} message="Submissions will appear here." />}
      renderItem={({item, index}) => <Row order={index} onPress={onOpen} leading={<Avatar initials={item.initials} />} title={item.learner}
        meta={`${item.title}, ${item.time}`} trailing={<Pill label={item.status} tone={gradeTone[item.status]} />} />} />
  </View>;
}

export function GradeSubmissionScreen({onBack, onSave, onRubric}: {onBack: () => void; onSave: () => void; onRubric: () => void}) {
  const [score, setScore] = useState(submission.score);
  const [feedback, setFeedback] = useState(submission.feedback);
  return <View style={styles.screen}>
    <StackHeader title="Grade submission" onBack={onBack} />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={styles.fileCard}>
        <IconBadge name="file" size={40} square />
        <View style={styles.flex}>
          <Text style={[styles.title, font]}>{submission.file}</Text>
          <Text style={[styles.meta, font]}>{submission.learner}, {submission.size}</Text>
        </View>
      </View>

      <View style={styles.similarity}>
        <Text style={[styles.simLabel, font]}>Similarity report</Text>
        <View style={styles.simRow}>
          <Text style={[styles.simValue, font]}>{submission.similarity}%</Text>
          <View style={styles.flex}><ProgressBar value={submission.similarity} fill={colors.success} track="rgba(46, 139, 103, 0.15)" height={6} /></View>
        </View>
        <Text style={[styles.simNote, font]}>Low</Text>
      </View>

      <View style={styles.pair}>
        <View style={styles.flex}>
          <Text style={[styles.label, font]}>Score</Text>
          <TextInput value={score} onChangeText={setScore} style={[styles.input, font]} />
        </View>
        <View style={styles.flex}>
          <Text style={[styles.label, font]}>Rubric</Text>
          <Pressable onPress={onRubric} style={styles.input} accessibilityRole="button"><Text style={[styles.rubric, font]}>Open rubric</Text></Pressable>
        </View>
      </View>

      <Text style={[styles.label, font, styles.gap]}>Feedback</Text>
      <TextInput value={feedback} onChangeText={setFeedback} placeholder="Clear dashboard. Add a title to chart 2." placeholderTextColor={colors.muted} multiline style={[styles.input, styles.feedback, font]} />
    </ScrollView>
    <Footer label="Save grade" onPress={onSave} />
  </View>;
}

export function StudentsScreen({onOpen, onNotifications}: {onOpen: () => void; onNotifications: () => void}) {
  const [filter, setFilter] = useState<StudentFilter>('All');
  const [query, setQuery] = useState('');
  const rows = useMemo(() => students.filter(s =>
    (filter === 'All' || (filter === 'Behind' ? s.behind : s.progress === 100)) &&
    s.name.toLowerCase().includes(query.trim().toLowerCase())), [filter, query]);
  return <View style={styles.screen}>
    <TabHeader title="Students" onBell={onNotifications} />
    <View style={styles.search}>
      <Icon name="search" size={18} color={colors.ink} />
      <TextInput value={query} onChangeText={setQuery} placeholder="Search students" placeholderTextColor={colors.muted} style={[styles.searchInput, font]} />
    </View>
    <Segments items={['All', 'Behind', 'Done'] as const} active={filter} onSelect={setFilter} />
    <FlatList data={rows} keyExtractor={s => s.id} contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled"
      ListEmptyComponent={<EmptyState title="No students found" message="Try another search or filter." />}
      renderItem={({item, index}) => <Row order={index} onPress={onOpen} leading={<Avatar initials={item.initials} />} title={item.name} meta={item.course}
        trailing={item.note === 'Pending' ? <Pill label="Pending" tone="amber" /> : item.note === 'Done' ? <Pill label="Done" tone="green" /> : <Icon name="next" size={18} color={colors.ink} />} />} />
  </View>;
}

export function StudentDetailScreen({onBack, onMessage}: {onBack: () => void; onMessage: () => void}) {
  const d = studentDetail;
  return <View style={styles.screen}>
    <StackHeader title="Student" onBack={onBack} />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.profile}>
        <Avatar initials={d.initials} size={84} />
        <Text style={[styles.name, font]}>{d.name}</Text>
        <Text style={[styles.meta, font]}>Enrolled {d.enrolled}</Text>
      </View>
      <View style={styles.progressCard}>
        <Text style={[styles.meta, font]}>{d.course}</Text>
        <View style={styles.progressBar}><ProgressBar value={d.progress} fill={colors.blue700} track={colors.sand} height={6} /></View>
        <View style={styles.progressFoot}>
          <Text style={[styles.bigPct, font]}>{d.progress}%</Text>
          <Text style={[styles.meta, font]}>{d.lessonsDone} of {d.lessonsTotal} lessons</Text>
        </View>
      </View>
      <SectionTitle title="Grades" />
      {d.grades.map(g => <View key={g.title} style={styles.gradeRow}>
        <Text style={[styles.gradeLabel, font]}>{g.title}</Text>
        <Text style={[styles.score, font]}>{g.score}</Text>
      </View>)}
    </ScrollView>
    <Footer label="Message student" onPress={onMessage} />
  </View>;
}

export function DiscussionScreen({onBack}: {onBack: () => void}) {
  const [reply, setReply] = useState('');
  const [sent, setSent] = useState<string[]>(discussion.replies.map(r => r.text));
  const q = discussion.question;
  const send = () => { if (!reply.trim()) return; setSent(s => [...s, reply.trim()]); setReply(''); };
  return <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <StackHeader title="Discussion" onBack={onBack} />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.question}>
        <View style={styles.qHead}>
          <Avatar initials={q.initials} size={32} />
          <View style={styles.flex}>
            <Text style={[styles.title, font]}>{q.author}</Text>
            <Text style={[styles.meta, font]}>{q.meta}</Text>
          </View>
        </View>
        <Text style={[styles.qText, font]}>{q.text}</Text>
      </View>
      {sent.map((text, i) => <View key={i} style={styles.reply}>
        <Text style={[styles.replyLabel, font]}>You</Text>
        <Text style={[styles.replyText, font]}>{text}</Text>
      </View>)}
    </ScrollView>
    <View style={styles.composer}>
      <TextInput value={reply} onChangeText={setReply} onSubmitEditing={send} placeholder="Write a reply" placeholderTextColor={colors.muted} style={[styles.composerInput, font]} />
      <Pressable onPress={send} style={styles.send} accessibilityRole="button" accessibilityLabel="Send reply">
        <Icon name="send" size={20} color={colors.white} />
      </Pressable>
    </View>
  </KeyboardAvoidingView>;
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.cream},
  list: {paddingHorizontal: spacing.screen, paddingBottom: 28, flexGrow: 1},
  content: {paddingHorizontal: spacing.screen, paddingBottom: 28},
  flex: {flex: 1},
  title: {fontSize: type.label, color: colors.ink, fontWeight: '800'},
  meta: {fontSize: type.caption, color: colors.muted, marginTop: 3},
  search: {flexDirection: 'row', alignItems: 'center', gap: 10, height: 50, marginHorizontal: spacing.screen, marginBottom: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.sandLine, backgroundColor: colors.barBg, paddingHorizontal: 18},
  searchInput: {flex: 1, fontSize: type.body, color: colors.ink, paddingVertical: 0},
  fileCard: {flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.barBg, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.card, padding: 14},
  similarity: {backgroundColor: '#E4F1EA', borderRadius: radius.card, padding: 16, marginTop: 14},
  simLabel: {fontSize: type.small, color: colors.ink, fontWeight: '700'},
  simRow: {flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 8, marginRight: 60},
  simValue: {fontSize: type.title, color: '#2E7D5B', fontWeight: '800'},
  simNote: {alignSelf: 'flex-end', fontSize: type.caption, color: '#2E7D5B', fontWeight: '700', marginTop: 4},
  pair: {flexDirection: 'row', gap: 12, marginTop: 16},
  label: {fontSize: type.caption, color: colors.ink, fontWeight: '700', marginBottom: 6},
  input: {minHeight: 52, borderRadius: radius.field, borderWidth: 1, borderColor: colors.sandLine, backgroundColor: colors.barBg, paddingHorizontal: 16, justifyContent: 'center', fontSize: type.body, color: colors.ink},
  rubric: {fontSize: type.body, color: colors.blue700},
  feedback: {minHeight: 130, paddingTop: 14, textAlignVertical: 'top'},
  gap: {marginTop: 18},
  profile: {alignItems: 'center', gap: 6, paddingBottom: 18},
  name: {fontSize: type.heading, color: colors.ink, fontWeight: '800', marginTop: 10},
  progressCard: {backgroundColor: colors.blue50, borderRadius: radius.card, padding: 16},
  progressBar: {marginTop: 12},
  progressFoot: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10},
  bigPct: {fontSize: type.heading + 2, color: colors.ink, fontWeight: '800'},
  gradeRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 48, borderBottomWidth: 1, borderBottomColor: colors.line},
  gradeLabel: {fontSize: type.small, color: colors.muted},
  score: {fontSize: type.small, color: colors.ink, fontWeight: '800'},
  question: {backgroundColor: colors.barBg, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.card, padding: 16},
  qHead: {flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12},
  qText: {fontSize: type.label, color: colors.ink, lineHeight: 22},
  reply: {alignSelf: 'flex-end', maxWidth: '84%', backgroundColor: colors.sky, borderRadius: radius.card, padding: 14, marginTop: 12},
  replyLabel: {fontSize: type.caption, color: colors.white, fontWeight: '800', marginBottom: 4},
  replyText: {fontSize: type.label, color: colors.white, lineHeight: 21},
  composer: {flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: spacing.screen, paddingVertical: 12},
  composerInput: {flex: 1, height: 52, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.sandLine, backgroundColor: colors.barBg, paddingHorizontal: 18, fontSize: type.body, color: colors.ink},
  send: {width: 52, height: 52, borderRadius: 26, backgroundColor: colors.sky, alignItems: 'center', justifyContent: 'center'},
});
