import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {ProgressBar} from '../../components/Chalkboard';
import {Icon} from '../../components/Icon';
import {EmptyState} from '../../components/States';
import {instructorApi, type GradingItem} from '../../api/endpoints';
import {discussion, studentDetail, type GradeStatus, type StudentFilter} from '../../data/instructor';
import {colors, radius, spacing, type, fonts} from '../../theme/tokens';
import {Avatar, font, Footer, IconBadge, Pill, Row, Segments, SectionTitle, StackHeader, TabHeader, type Tone} from './shared';

const initialsOf = (name: string) => name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
const ago = (iso: string) => { const h = Math.round((Date.now() - new Date(iso).getTime()) / 3600000); return h < 1 ? 'just now' : h < 24 ? `${h}h ago` : `${Math.round(h / 24)}d ago`; };
const toStatus = (s: GradingItem['status']): GradeStatus => (s === 'graded' ? 'Graded' : s === 'overdue' ? 'Overdue' : 'Pending');

function useLoad<T>(load: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const run = useCallback(() => { setError(''); load().then(setData, e => setError(e instanceof Error ? e.message : 'Could not load this.')); }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(run, [run]);
  return {data, error, reload: run};
}
function LoadState({error, reload}: {error: string; reload: () => void}) {
  return error ? <Pressable onPress={reload} accessibilityRole="button" style={{margin: spacing.screen}}><Text style={[font, {fontSize: 15, color: colors.blue700, fontFamily: fonts.bold}]}>{error} Tap to try again.</Text></Pressable> : <ActivityIndicator color={colors.blue700} style={{marginTop: 24}} />;
}

const gradeTone: Record<GradeStatus, Tone> = {Pending: 'amber', Overdue: 'red', Graded: 'green'};

export function GradingScreen({onBack, onOpen}: {onBack: () => void; onOpen: (id: string) => void; onNotifications?: () => void}) {
  const [filter, setFilter] = useState<'Pending' | 'Graded'>('Pending');
  const {data, error, reload} = useLoad(() => instructorApi.grading(), []);
  const rows = useMemo(() => (data?.data ?? []).filter(g => (filter === 'Graded' ? g.status === 'graded' : g.status !== 'graded')), [data, filter]);
  return <View style={styles.screen}>
    <StackHeader title="Grading" onBack={onBack} />
    <Segments items={['Pending', 'Graded'] as const} active={filter} onSelect={setFilter} />
    {!data ? <LoadState error={error} reload={reload} /> : <FlatList data={rows} keyExtractor={g => g.id} contentContainerStyle={styles.list}
      ListEmptyComponent={<EmptyState title={filter === 'Pending' ? 'Nothing to grade' : 'No graded work yet'} message="Submissions will appear here." />}
      renderItem={({item, index}) => <Row order={index} onPress={() => onOpen(item.id)} leading={<Avatar initials={initialsOf(item.learner.fullName)} />} title={item.learner.fullName}
        meta={`${item.title}, ${ago(item.submittedAt)}`} trailing={<Pill label={toStatus(item.status)} tone={gradeTone[toStatus(item.status)]} />} />} />}
  </View>;
}

export function GradeSubmissionScreen({id, onBack, onSave}: {id: string; onBack: () => void; onSave: () => void}) {
  const {data, error, reload} = useLoad(() => instructorApi.submission(id), [id]);
  const [score, setScore] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const shown = score ?? (data?.score != null ? String(data.score) : '');
  const note = feedback ?? data?.feedback ?? '';
  const value = Number(shown);
  const valid = shown.trim() !== '' && Number.isFinite(value) && value >= 0 && (!data || value <= data.maxScore);
  const save = async () => {
    if (!valid || busy) return;
    setBusy(true);
    try { await instructorApi.grade(id, value, note); onSave(); }
    catch (e) { Alert.alert('Could not save the grade', e instanceof Error ? e.message : 'Try again.'); }
    finally { setBusy(false); }
  };
  const file = data?.files[0];
  const sim = data?.similarity?.percent ?? data?.similarity?.score;
  return <View style={styles.screen}>
    <StackHeader title="Grade submission" onBack={onBack} />
    {!data ? <LoadState error={error} reload={reload} /> : <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={styles.fileCard}>
        <IconBadge name="file" size={40} square />
        <View style={styles.flex}>
          <Text style={[font, styles.title]}>{file?.fileName ?? 'No file attached'}</Text>
          <Text style={[font, styles.meta]}>{data.learner.fullName}{file ? `, ${Math.max(1, Math.round(file.sizeBytes / 1024))} KB` : ''}</Text>
        </View>
      </View>
      {data.note ? <Text style={[font, styles.meta, styles.gap]}>“{data.note}”</Text> : null}
      {sim != null && <View style={styles.similarity}>
        <Text style={[font, styles.simLabel]}>Similarity report</Text>
        <View style={styles.simRow}>
          <Text style={[font, styles.simValue]}>{Math.round(sim)}%</Text>
          <View style={styles.flex}><ProgressBar value={sim > 1 ? sim / 100 : sim} fill={colors.success} track="rgba(46, 139, 103, 0.15)" height={6} /></View>
        </View>
      </View>}
      <Text style={[font, styles.label, styles.gap]}>Score (out of {data.maxScore})</Text>
      <TextInput value={shown} onChangeText={setScore} keyboardType="decimal-pad" style={[font, styles.input]} />
      <Text style={[font, styles.label, styles.gap]}>Feedback</Text>
      <TextInput value={note} onChangeText={setFeedback} placeholder="What went well, and what to improve" placeholderTextColor={colors.muted} multiline style={[styles.input, styles.feedback, font]} />
    </ScrollView>}
    <Footer label={busy ? 'Saving…' : 'Save grade'} disabled={!data || !valid || busy} onPress={save} />
  </View>;
}

export function StudentsScreen({onOpen, onNotifications}: {onOpen: () => void; onNotifications: () => void}) {
  const [filter, setFilter] = useState<StudentFilter>('All');
  const [query, setQuery] = useState('');
  const {data, error, reload} = useLoad(() => instructorApi.students(), []);
  const rows = useMemo(() => (data?.data ?? []).filter(s =>
    (filter === 'All' || (filter === 'Behind' ? s.progressPct < 30 && s.progressPct < 100 : s.progressPct === 100)) &&
    s.learner.fullName.toLowerCase().includes(query.trim().toLowerCase())), [data, filter, query]);
  return <View style={styles.screen}>
    <TabHeader title="Students" onBell={onNotifications} />
    <View style={styles.search}>
      <Icon name="search" size={18} color={colors.ink} />
      <TextInput value={query} onChangeText={setQuery} placeholder="Search students" placeholderTextColor={colors.muted} style={[font, styles.searchInput]} />
    </View>
    <Segments items={['All', 'Behind', 'Done'] as const} active={filter} onSelect={setFilter} />
    {!data ? <LoadState error={error} reload={reload} /> : <FlatList data={rows} keyExtractor={(s, i) => `${s.learner.id}-${s.course.id}-${i}`} contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled"
      ListEmptyComponent={<EmptyState title={data.data.length ? 'No students found' : 'No students yet'} message={data.data.length ? 'Try another search or filter.' : 'Learners who enrol in your courses will appear here.'} />}
      renderItem={({item, index}) => <Row order={index} onPress={onOpen} leading={<Avatar initials={item.learner.initials || initialsOf(item.learner.fullName)} />} title={item.learner.fullName} meta={`${item.course.title}, ${item.progressPct}%`}
        trailing={item.progressPct === 100 ? <Pill label="Done" tone="green" /> : <Icon name="next" size={18} color={colors.ink} />} />} />}
  </View>;
}

export function StudentDetailScreen({onBack, onMessage}: {onBack: () => void; onMessage: () => void}) {
  const d = studentDetail;
  return <View style={styles.screen}>
    <StackHeader title="Student" onBack={onBack} />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.profile}>
        <Avatar initials={d.initials} size={84} />
        <Text style={[font, styles.name]}>{d.name}</Text>
        <Text style={[font, styles.meta]}>Enrolled {d.enrolled}</Text>
      </View>
      <View style={styles.progressCard}>
        <Text style={[font, styles.meta]}>{d.course}</Text>
        <View style={styles.progressBar}><ProgressBar value={d.progress} fill={colors.blue700} track={colors.sand} height={6} /></View>
        <View style={styles.progressFoot}>
          <Text style={[font, styles.bigPct]}>{d.progress}%</Text>
          <Text style={[font, styles.meta]}>{d.lessonsDone} of {d.lessonsTotal} lessons</Text>
        </View>
      </View>
      <SectionTitle title="Grades" />
      {d.grades.map(g => <View key={g.title} style={styles.gradeRow}>
        <Text style={[font, styles.gradeLabel]}>{g.title}</Text>
        <Text style={[font, styles.score]}>{g.score}</Text>
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
            <Text style={[font, styles.title]}>{q.author}</Text>
            <Text style={[font, styles.meta]}>{q.meta}</Text>
          </View>
        </View>
        <Text style={[font, styles.qText]}>{q.text}</Text>
      </View>
      {sent.map((text, i) => <View key={i} style={styles.reply}>
        <Text style={[font, styles.replyLabel]}>You</Text>
        <Text style={[font, styles.replyText]}>{text}</Text>
      </View>)}
    </ScrollView>
    <View style={styles.composer}>
      <TextInput value={reply} onChangeText={setReply} onSubmitEditing={send} placeholder="Write a reply" placeholderTextColor={colors.muted} style={[font, styles.composerInput]} />
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
  title: {fontSize: type.label, color: colors.ink, fontFamily: fonts.display},
  meta: {fontSize: type.caption, color: colors.muted, marginTop: 3},
  search: {flexDirection: 'row', alignItems: 'center', gap: 10, height: 50, marginHorizontal: spacing.screen, marginBottom: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.sandLine, backgroundColor: colors.barBg, paddingHorizontal: 18},
  searchInput: {flex: 1, fontSize: type.body, color: colors.ink, paddingVertical: 0},
  fileCard: {flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.barBg, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.card, padding: 14},
  similarity: {backgroundColor: '#E4F1EA', borderRadius: radius.card, padding: 16, marginTop: 14},
  simLabel: {fontSize: type.small, color: colors.ink, fontFamily: fonts.bold},
  simRow: {flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 8, marginRight: 60},
  simValue: {fontSize: type.title, color: '#2E7D5B', fontFamily: fonts.bold},
  simNote: {alignSelf: 'flex-end', fontSize: type.caption, color: '#2E7D5B', fontFamily: fonts.bold, marginTop: 4},
  pair: {flexDirection: 'row', gap: 12, marginTop: 16},
  label: {fontSize: type.caption, color: colors.ink, fontFamily: fonts.bold, marginBottom: 6},
  input: {minHeight: 52, borderRadius: radius.field, borderWidth: 1, borderColor: colors.sandLine, backgroundColor: colors.barBg, paddingHorizontal: 16, justifyContent: 'center', fontSize: type.body, color: colors.ink},
  rubric: {fontSize: type.body, color: colors.blue700},
  feedback: {minHeight: 130, paddingTop: 14, textAlignVertical: 'top'},
  gap: {marginTop: 18},
  profile: {alignItems: 'center', gap: 6, paddingBottom: 18},
  name: {fontSize: type.heading, color: colors.ink, fontFamily: fonts.bold, marginTop: 10},
  progressCard: {backgroundColor: colors.blue50, borderRadius: radius.card, padding: 16},
  progressBar: {marginTop: 12},
  progressFoot: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10},
  bigPct: {fontSize: type.heading + 2, color: colors.ink, fontFamily: fonts.bold},
  gradeRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 48, borderBottomWidth: 1, borderBottomColor: colors.line},
  gradeLabel: {fontSize: type.small, color: colors.muted},
  score: {fontSize: type.small, color: colors.ink, fontFamily: fonts.bold},
  question: {backgroundColor: colors.barBg, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.card, padding: 16},
  qHead: {flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12},
  qText: {fontSize: type.label, color: colors.ink, lineHeight: 22},
  reply: {alignSelf: 'flex-end', maxWidth: '84%', backgroundColor: colors.sky, borderRadius: radius.card, padding: 14, marginTop: 12},
  replyLabel: {fontSize: type.caption, color: colors.white, fontFamily: fonts.bold, marginBottom: 4},
  replyText: {fontSize: type.label, color: colors.white, lineHeight: 21},
  composer: {flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: spacing.screen, paddingVertical: 12},
  composerInput: {flex: 1, height: 52, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.sandLine, backgroundColor: colors.barBg, paddingHorizontal: 18, fontSize: type.body, color: colors.ink},
  send: {width: 52, height: 52, borderRadius: 26, backgroundColor: colors.sky, alignItems: 'center', justifyContent: 'center'},
});
