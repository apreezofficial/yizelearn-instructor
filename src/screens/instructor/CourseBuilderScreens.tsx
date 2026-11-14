import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View} from 'react-native';
import {instructorApi, type Checklist, type Curriculum, type SetupData} from '../../api/endpoints';
import {ProgressBar} from '../../components/Chalkboard';
import {CourseArt} from '../../components/Catalog';
import {Icon} from '../../components/Icon';
import {assessmentBrief, curriculum, lessonTypes, publishChecks, quizQuestions, setupSteps, videoUploads, type LessonType} from '../../data/instructor';
import {colors, radius, spacing, type, fonts} from '../../theme/tokens';
import {Field, font, Footer, IconBadge, Pill, Reveal, SectionTitle, SelectField, StackHeader} from './shared';

const notConnected = (what: string) => Alert.alert(what, `${what} is not connected yet.`);

function useLoaded<T>(load: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const run = useCallback(() => { setError(''); load().then(setData, e => setError(e instanceof Error ? e.message : 'Could not load this.')); }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(run, [run]);
  return {data, error, reload: run};
}
function Loading({error, reload}: {error: string; reload: () => void}) {
  return error ? <Pressable onPress={reload} accessibilityRole="button"><Text style={[font, styles.note]}>{error} Tap to try again.</Text></Pressable> : <ActivityIndicator color={colors.blue700} style={{marginTop: 24}} />;
}
const stepTitles: Record<string, string> = {basics: 'Course details', curriculum: 'Curriculum', pricing: 'Pricing', publish: 'Publish'};

/** Course setup: the checklist of steps for a draft course. */
export function SetupScreen({courseId, title, onBack, onStep}: {courseId?: string; title: string; onBack: () => void; onStep: (key: string) => void}) {
  const {data, error, reload} = useLoaded<SetupData | null>(() => (courseId ? instructorApi.setup(courseId) : Promise.resolve(null)), [courseId]);
  const steps = data?.steps ?? [];
  const next = steps.find(x => !x.done)?.key ?? 'publish';
  const status = data?.course.status;
  return <View style={styles.screen}>
    <StackHeader title="Course setup" onBack={onBack} />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.courseCard}>
        <CourseArt index={0} size={72} />
        <View style={styles.courseCopy}>
          <Text style={[font, styles.courseTitle]}>{data?.course.title ?? title}</Text>
          <View style={styles.draft}><Pill label={status === 'published' ? 'Published' : status === 'in_review' ? 'In review' : 'Draft'} tone={status === 'published' ? 'green' : status === 'in_review' ? 'amber' : 'grey'} /></View>
          {data && <View style={styles.progressRow}>
            <View style={styles.flex}><ProgressBar value={(data.doneCount / Math.max(1, data.total)) * 100} fill={colors.blue700} track={colors.sand} height={5} /></View>
            <Text style={[font, styles.count]}>{data.doneCount} of {data.total}</Text>
          </View>}
        </View>
      </View>
      {!data && <Loading error={error} reload={reload} />}
      {steps.map((step, i) => <Reveal key={step.key} order={i + 1}><Pressable onPress={() => onStep(step.key)} style={({pressed}) => [styles.card, styles.step, pressed && styles.pressed]} accessibilityRole="button">
        {step.done
          ? <View style={[styles.mark, styles.markDone]}><Icon name="check" size={16} color={colors.white} strokeWidth={2.4} /></View>
          : <View style={styles.mark}><Text style={[font, styles.markNumber]}>{i + 1}</Text></View>}
        <View style={styles.flex}>
          <Text style={[font, styles.cardTitle]}>{stepTitles[step.key] ?? step.key}</Text>
          <Text style={[font, styles.cardMeta]}>{step.summary}</Text>
        </View>
        <Icon name="next" size={18} color={colors.ink} />
      </Pressable></Reveal>)}
    </ScrollView>
    <Footer label={`Continue to ${(stepTitles[next] ?? 'next step').toLowerCase()}`} disabled={!data} onPress={() => onStep(next)} />
  </View>;
}

/** Course details: the title and descriptions learners see in the catalogue. */
export function BasicsScreen({courseId, onBack, onSave}: {courseId: string; onBack: () => void; onSave: () => void}) {
  const {data, error, reload} = useLoaded(() => instructorApi.course(courseId), [courseId]);
  const [edit, setEdit] = useState<{title?: string; subtitle?: string; summary?: string; about?: string}>({});
  const [busy, setBusy] = useState(false);
  const val = (k: 'title' | 'subtitle' | 'summary' | 'about') => edit[k] ?? (data?.[k] as string | null | undefined) ?? '';
  const save = async () => {
    setBusy(true);
    try { await instructorApi.saveCourse(courseId, {title: val('title').trim(), subtitle: val('subtitle').trim() || null, summary: val('summary').trim() || null, about: val('about').trim() || null}); onSave(); }
    catch (e) { Alert.alert('Could not save', e instanceof Error ? e.message : 'Try again.'); }
    finally { setBusy(false); }
  };
  return <View style={styles.screen}>
    <StackHeader title="Course details" onBack={onBack} />
    {!data ? <Loading error={error} reload={reload} /> : <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Field label="Title" value={val('title')} onChangeText={v => setEdit(e => ({...e, title: v}))} />
      <Field label="Subtitle" value={val('subtitle')} onChangeText={v => setEdit(e => ({...e, subtitle: v}))} />
      <Field label="Short summary" value={val('summary')} onChangeText={v => setEdit(e => ({...e, summary: v}))} multiline />
      <Field label="About this course" value={val('about')} onChangeText={v => setEdit(e => ({...e, about: v}))} multiline />
    </ScrollView>}
    <Footer label={busy ? 'Saving…' : 'Save details'} disabled={!data || busy || val('title').trim().length < 3} onPress={save} />
  </View>;
}

/** Curriculum: modules with their lessons, plus the add-lesson sheet. */
export function CurriculumScreen({courseId, onBack, onPick}: {courseId?: string; onBack: () => void; onPick: (type: LessonType) => void}) {
  const [closed, setClosed] = useState<string[]>([]);
  const [sheet, setSheet] = useState(false);
  const [moduleSheet, setModuleSheet] = useState(false);
  const [moduleTitle, setModuleTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [pending, setPending] = useState<LessonType | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [data, setData] = useState<Curriculum | null>(null);
  const [error, setError] = useState('');
  const load = useCallback(() => {
    if (!courseId) return;
    setError('');
    instructorApi.curriculum(courseId).then(setData, e => setError(e instanceof Error ? e.message : 'Could not load the curriculum.'));
  }, [courseId]);
  useEffect(load, [load]);
  const toggle = (id: string) => setClosed(c => (c.includes(id) ? c.filter(x => x !== id) : [...c, id]));
  const addModule = async () => {
    if (!courseId || moduleTitle.trim().length < 2) return;
    setSaving(true);
    try { await instructorApi.addModule(courseId, moduleTitle.trim()); setModuleTitle(''); setModuleSheet(false); load(); }
    catch (e) { Alert.alert('Could not add the module', e instanceof Error ? e.message : 'Try again.'); }
    finally { setSaving(false); }
  };
  const modules = data?.modules ?? [];
  const targetModule = moduleId || modules[0]?.id || '';
  const addLesson = async () => {
    if (!pending || !targetModule || lessonTitle.trim().length < 2) return;
    setSaving(true);
    try { await instructorApi.addLesson(targetModule, pending.toLowerCase() as 'video' | 'document' | 'quiz' | 'assignment', lessonTitle.trim()); setPending(null); setLessonTitle(''); load(); }
    catch (e) { Alert.alert('Could not add the lesson', e instanceof Error ? e.message : 'Try again.'); }
    finally { setSaving(false); }
  };
  return <View style={styles.screen}>
    <StackHeader title="Curriculum" onBack={onBack} right={<Pressable onPress={() => setSheet(true)} hitSlop={10} accessibilityRole="button" accessibilityLabel="Add lesson"><Icon name="plus" size={24} color={colors.ink} /></Pressable>} />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {!courseId && <Text style={[font, styles.note]}>Save the course first, then you can add modules and lessons.</Text>}
      {!!error && <Pressable onPress={load} accessibilityRole="button"><Text style={[font, styles.note]}>{error} Tap to try again.</Text></Pressable>}
      {courseId && !data && !error && <ActivityIndicator color={colors.blue700} style={{marginTop: 24}} />}
      {modules.length === 0 && !!data && <Text style={[font, styles.note]}>No modules yet. Add the first one below.</Text>}
      {modules.map((module, mi) => {
        const expanded = !closed.includes(module.id);
        return <Reveal key={module.id} order={mi} style={styles.module}>
          <Pressable onPress={() => toggle(module.id)} style={styles.moduleHead} accessibilityRole="button" accessibilityState={{expanded}}>
            <Icon name="handle" size={18} color={colors.muted} />
            <Text style={[font, styles.moduleTitle]}>{module.title}</Text>
            <Icon name={expanded ? 'down' : 'next'} size={20} color={colors.ink} />
          </Pressable>
          {expanded && module.lessons.length === 0 && <Text style={[font, styles.lessonType, styles.lessonEmpty]}>No lessons in this module yet.</Text>}
          {expanded && module.lessons.map(lesson => <View key={lesson.id} style={styles.lesson}>
            <Icon name="handle" size={16} color={colors.muted} />
            <Text style={[font, styles.lessonTitle]}>{lesson.title}</Text>
            <Text style={[font, styles.lessonType]}>{lesson.type}</Text>
          </View>)}
        </Reveal>;
      })}
      {courseId && <Pressable onPress={() => setModuleSheet(true)} style={styles.addModule} accessibilityRole="button">
        <Text style={[font, styles.addText]}>+ Add module</Text>
      </Pressable>}
    </ScrollView>
    <Footer label="Add lesson" disabled={!courseId} onPress={() => setSheet(true)} />

    <Modal visible={moduleSheet} transparent animationType="fade" onRequestClose={() => setModuleSheet(false)}>
      <Pressable style={styles.scrim} onPress={() => setModuleSheet(false)} accessibilityLabel="Close" />
      <View style={styles.sheet}>
        <View style={styles.grabber} />
        <Text style={[font, styles.sheetTitle]}>New module</Text>
        <TextInput value={moduleTitle} onChangeText={setModuleTitle} placeholder="Module title" placeholderTextColor={colors.muted} style={[font, styles.moduleInput]} autoFocus />
        <Footer label={saving ? 'Adding…' : 'Add module'} disabled={saving || moduleTitle.trim().length < 2} onPress={addModule} />
      </View>
    </Modal>

    <Modal visible={!!pending} transparent animationType="fade" onRequestClose={() => setPending(null)}>
      <Pressable style={styles.scrim} onPress={() => setPending(null)} accessibilityLabel="Close" />
      <View style={styles.sheet}>
        <View style={styles.grabber} />
        <Text style={[font, styles.sheetTitle]}>New {pending?.toLowerCase()} lesson</Text>
        <Text style={[font, styles.cardMeta]}>Module</Text>
        <View style={styles.chips}>{modules.map(m => <Pressable key={m.id} onPress={() => setModuleId(m.id)} style={[styles.chip, targetModule === m.id && styles.chipOn]} accessibilityRole="button"><Text style={[font, styles.chipText, targetModule === m.id && styles.chipTextOn]}>{m.title}</Text></Pressable>)}</View>
        <TextInput value={lessonTitle} onChangeText={setLessonTitle} placeholder="Lesson title" placeholderTextColor={colors.muted} style={[font, styles.moduleInput]} autoFocus />
        <Footer label={saving ? 'Adding…' : 'Add lesson'} disabled={saving || lessonTitle.trim().length < 2} onPress={addLesson} />
      </View>
    </Modal>

    <Modal visible={sheet} transparent animationType="fade" onRequestClose={() => setSheet(false)}>
      <Pressable style={styles.scrim} onPress={() => setSheet(false)} accessibilityLabel="Close" />
      <View style={styles.sheet}>
        <View style={styles.grabber} />
        <Text style={[font, styles.sheetTitle]}>Add lesson</Text>
        {lessonTypes.map(item => <Pressable key={item.type} onPress={() => { setSheet(false); if (modules.length === 0) { Alert.alert('Add a module first', 'Lessons live inside modules.'); return; } setPending(item.type); }} style={({pressed}) => [styles.choice, pressed && styles.pressed]} accessibilityRole="button">
          <IconBadge name={item.icon} size={40} />
          <View style={styles.flex}>
            <Text style={[font, styles.cardTitle]}>{item.type}</Text>
            <Text style={[font, styles.cardMeta]}>{item.detail}</Text>
          </View>
        </Pressable>)}
      </View>
    </Modal>
  </View>;
}

/** Quiz builder: pass mark, time limit, and the list of questions. */
export function QuizBuilderScreen({onBack, onSave}: {onBack: () => void; onSave: () => void}) {
  return <View style={styles.screen}>
    <StackHeader title="Module 2 quiz" onBack={onBack} />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={styles.two}>
        <View style={styles.flex}><Field label="Pass mark" defaultValue="70%" /></View>
        <View style={styles.flex}><Field label="Time limit" defaultValue="None" /></View>
      </View>
      <SectionTitle title="Questions" note={`${quizQuestions.length} total`} />
      {quizQuestions.map((q, i) => <Reveal key={q.id} order={i}><View style={[styles.card, styles.question]}>
        <View style={styles.flex}>
          <Text style={[font, styles.cardTitle]}>{q.text}</Text>
          <Text style={[font, styles.kind]}>{q.kind}</Text>
        </View>
        <Icon name="handle" size={18} color={colors.muted} />
      </View></Reveal>)}
      <Pressable onPress={() => notConnected('Adding questions')} style={styles.addQuestion} accessibilityRole="button">
        <Text style={[font, styles.addText]}>+ Add question</Text>
      </Pressable>
    </ScrollView>
    <Footer label="Save quiz" onPress={onSave} />
  </View>;
}

/** Assessment builder: title, due date, brief, plagiarism check and attempts. */
export function AssessmentBuilderScreen({onBack, onSave}: {onBack: () => void; onSave: () => void}) {
  const [plagiarism, setPlagiarism] = useState(true);
  const [attempts, setAttempts] = useState(Number(assessmentBrief.attempts));
  return <View style={styles.screen}>
    <StackHeader title="Assessment" onBack={onBack} />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Field label="Title" defaultValue={assessmentBrief.title} />
      <SelectField label="Due date" value={assessmentBrief.dueDate} onPress={() => notConnected('Picking a date')} />
      <Field label="Brief" defaultValue={assessmentBrief.brief} placeholder="Describe what learners should submit" multiline />
      <View style={styles.switchRow}>
        <Text style={[font, styles.switchText]}>Check for plagiarism</Text>
        <Switch value={plagiarism} onValueChange={setPlagiarism} trackColor={{true: colors.blue700, false: colors.sandLine}} />
      </View>
      <View style={styles.switchRow}>
        <Text style={[font, styles.switchText]}>Set number of{'\n'}attempts</Text>
        <Pressable onPress={() => setAttempts(a => (a % 5) + 1)} style={styles.attempts} accessibilityRole="button" accessibilityLabel={`${attempts} attempts, tap to change`}>
          <Text style={[font, styles.attemptsText]}>{attempts}</Text>
          <Icon name="down" size={16} color={colors.ink} />
        </Pressable>
      </View>
    </ScrollView>
    <Footer label="Save assessment" onPress={onSave} />
  </View>;
}

/** Video upload: a picker area and each file's upload state. */
export function UploadVideoScreen({onBack, onDone}: {onBack: () => void; onDone: () => void}) {
  return <View style={styles.screen}>
    <StackHeader title="Upload video" onBack={onBack} />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Pressable onPress={() => notConnected('Choosing video files')} style={styles.drop} accessibilityRole="button">
        <View style={styles.dropIcon}><Icon name="upload" size={22} color={colors.blue700} /></View>
        <Text style={[font, styles.dropTitle]}>Tap to choose a video</Text>
        <Text style={[font, styles.cardMeta]}>MP4 or MOV, up to 2 GB</Text>
      </Pressable>
      {videoUploads.map((v, i) => {
        const failed = v.status === 'failed';
        return <Reveal key={v.id} order={i + 1}><View style={[styles.card, styles.upload, failed && styles.uploadFailed]}>
          <IconBadge name="file" size={40} square />
          <View style={styles.flex}>
            <Text style={[font, styles.cardTitle]}>{v.name}</Text>
            <Text style={[font, styles.cardMeta, failed && styles.danger]}>{v.status === 'uploading' ? `Uploading, ${v.progress}%` : v.status === 'uploaded' ? 'Uploaded' : `Failed: ${v.error?.toLowerCase()}`}</Text>
            {v.status === 'uploading' && <View style={styles.uploadBar}><ProgressBar value={v.progress} fill={colors.blue700} track={colors.sand} height={5} /></View>}
          </View>
          {v.status === 'uploading' && <Pressable hitSlop={10} accessibilityRole="button" accessibilityLabel="Cancel upload"><Icon name="close" size={20} color={colors.ink} /></Pressable>}
          {v.status === 'uploaded' && <View style={[styles.mark, styles.markDone]}><Icon name="check" size={16} color={colors.white} strokeWidth={2.4} /></View>}
          {failed && <Pressable hitSlop={10} accessibilityRole="button"><Text style={[font, styles.link]}>Retry</Text></Pressable>}
        </View></Reveal>;
      })}
    </ScrollView>
    <Footer label="Done" onPress={onDone} />
  </View>;
}

/** Pricing: course price, optional launch discount with promo code and end date. */
export function PricingScreen({courseId, onBack, onSave}: {courseId?: string; onBack: () => void; onSave: () => void}) {
  const {data, error, reload} = useLoaded(() => (courseId ? instructorApi.pricing(courseId) : Promise.resolve(null)), [courseId]);
  const [price, setPrice] = useState<string | null>(null);
  const [discount, setDiscount] = useState<boolean | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [percent, setPercent] = useState<string | null>(null);
  const [until, setUntil] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const shownPrice = price ?? (data?.price ? String(Math.round(data.price.amountMinor / 100)) : '');
  const on = discount ?? data?.discount?.enabled ?? false;
  const shownCode = code ?? data?.discount?.promoCode ?? '';
  const shownPercent = percent ?? (data?.discount?.percent != null ? String(data.discount.percent) : '');
  const shownUntil = until ?? data?.discount?.validUntil?.slice(0, 10) ?? '';
  const naira = Number(shownPrice);
  const pct = Number(shownPercent);
  const valid = !!courseId && Number.isFinite(naira) && naira >= 0 && shownPrice !== '' && (!on || (shownCode.trim().length >= 3 && pct >= 1 && pct <= 100));
  const save = async () => {
    if (!courseId || !valid) return;
    setBusy(true);
    try {
      await instructorApi.savePricing(courseId, {price: {amountMinor: Math.round(naira * 100), currency: 'NGN'}, discount: on ? {enabled: true, promoCode: shownCode.trim().toUpperCase(), percent: pct, ...(shownUntil ? {validUntil: `${shownUntil}T23:59:59Z`} : {})} : null});
      onSave();
    } catch (e) { Alert.alert('Could not save pricing', e instanceof Error ? e.message : 'Try again.'); }
    finally { setBusy(false); }
  };
  return <View style={styles.screen}>
    <StackHeader title="Pricing" onBack={onBack} />
    {!courseId ? <Text style={[font, styles.note, styles.content]}>Create the course first to set its price.</Text> : !data ? <Loading error={error} reload={reload} /> : <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Field label="Price (₦, whole naira, 0 for free)" value={shownPrice} onChangeText={v => setPrice(v.replace(/\D/g, ''))} keyboardType="numeric" />
      <View style={styles.switchRow}>
        <Text style={[font, styles.switchText]}>Offer a discount</Text>
        <Switch value={on} onValueChange={setDiscount} trackColor={{true: colors.blue700, false: colors.sandLine}} />
      </View>
      {on && <>
        <Field label="Promo code" value={shownCode} onChangeText={setCode} autoCapitalize="characters" />
        <Field label="Percent off (1 to 100)" value={shownPercent} onChangeText={v => setPercent(v.replace(/\D/g, ''))} keyboardType="numeric" />
        <Field label="Valid until (YYYY-MM-DD, optional)" value={shownUntil} onChangeText={setUntil} placeholder="2026-12-31" />
      </>}
    </ScrollView>}
    <Footer label={busy ? 'Saving…' : 'Save pricing'} disabled={!valid || busy} onPress={save} />
  </View>;
}

/** Publish checklist: what is ready and what still needs fixing before the course goes live. */
export function PublishChecklistScreen({courseId, onBack, onFix, onPublished}: {courseId?: string; onBack: () => void; onFix: (target: string) => void; onPublished: () => void}) {
  const {data, error, reload} = useLoaded<Checklist | null>(() => (courseId ? instructorApi.checklist(courseId) : Promise.resolve(null)), [courseId]);
  const [busy, setBusy] = useState(false);
  const publish = async () => {
    if (!courseId) return;
    setBusy(true);
    try { await instructorApi.publish(courseId); Alert.alert('Submitted', 'Your course is published or sent for review, depending on your account.', [{text: 'OK', onPress: onPublished}]); }
    catch (e) { Alert.alert('Could not publish', e instanceof Error ? e.message : 'Try again.'); }
    finally { setBusy(false); }
  };
  return <View style={styles.screen}>
    <StackHeader title="Publish checklist" onBack={onBack} />
    {!data ? <Loading error={error} reload={reload} /> : <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.readyCard}>
        <Text style={[font, styles.cardTitle]}>{data.ready} of {data.total} ready</Text>
        <View style={styles.readyBar}><ProgressBar value={(data.ready / Math.max(1, data.total)) * 100} fill={colors.blue700} track={colors.sand} height={6} /></View>
      </View>
      {data.items.map((check, i) => <Reveal key={check.key} order={i + 1}><View style={styles.check}>
        {check.ok
          ? <View style={[styles.mark, styles.markDone]}><Icon name="check" size={16} color={colors.white} strokeWidth={2.4} /></View>
          : <View style={[styles.mark, styles.markWarn]}><Text style={[font, styles.warnText]}>!</Text></View>}
        <Text style={[font, styles.checkText]}>{check.label}</Text>
        {!check.ok && check.fixTarget && <Pressable onPress={() => onFix(check.fixTarget as string)} hitSlop={10} accessibilityRole="button"><Text style={[font, styles.link]}>Fix</Text></Pressable>}
      </View></Reveal>)}
    </ScrollView>}
    <Footer label={busy ? 'Publishing…' : 'Publish course'} disabled={!data || !data.canPublish || busy} onPress={publish} />
  </View>;
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.cream},
  note: {fontSize: 15, color: colors.muted, marginTop: 16, lineHeight: 22},
  lessonEmpty: {paddingVertical: 12},
  chips: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 10},
  chip: {minHeight: 40, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: colors.sandLine, backgroundColor: colors.white, justifyContent: 'center'},
  chipOn: {backgroundColor: colors.blue700, borderColor: colors.blue700},
  chipText: {fontSize: 14, color: colors.ink},
  chipTextOn: {color: colors.white},
  moduleInput: {minHeight: 52, borderRadius: radius.field, borderWidth: 1, borderColor: colors.sandLine, backgroundColor: colors.white, paddingHorizontal: 16, fontSize: type.body, color: colors.ink, marginBottom: 14},
  content: {paddingHorizontal: spacing.screen, paddingBottom: 28},
  flex: {flex: 1},
  pressed: {opacity: 0.8},
  card: {backgroundColor: colors.barBg, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.card},
  cardTitle: {fontSize: type.label, color: colors.ink, fontFamily: fonts.bold},
  cardMeta: {fontSize: type.caption, color: colors.muted, marginTop: 3},
  link: {fontSize: type.small, color: colors.blue700, fontFamily: fonts.bold},
  danger: {color: colors.danger},
  courseCard: {flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.barBg, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.card, padding: 12, marginBottom: 12},
  courseCopy: {flex: 1},
  courseTitle: {fontSize: type.body, color: colors.ink, fontFamily: fonts.bold},
  draft: {alignSelf: 'flex-start', marginTop: 8},
  progressRow: {flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10},
  count: {fontSize: type.caption, color: colors.muted},
  step: {flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, marginBottom: 10},
  mark: {width: 30, height: 30, borderRadius: 15, borderWidth: 1.5, borderColor: colors.sandLine, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center'},
  markDone: {backgroundColor: colors.blue700, borderColor: colors.blue700},
  markWarn: {backgroundColor: colors.marigold, borderColor: colors.marigold},
  markNumber: {fontSize: type.small, color: colors.muted, fontFamily: fonts.bold},
  warnText: {fontSize: type.small, color: colors.ink, fontFamily: fonts.bold},
  module: {marginBottom: 14},
  moduleHead: {flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52, paddingHorizontal: 14, borderRadius: radius.field, backgroundColor: colors.sand, marginBottom: 8},
  moduleTitle: {flex: 1, fontSize: type.label, color: colors.ink, fontFamily: fonts.bold},
  lesson: {flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48, paddingHorizontal: 14, marginLeft: 12, marginBottom: 8, borderRadius: radius.field, borderWidth: 1, borderColor: colors.sandLine, backgroundColor: colors.barBg},
  lessonTitle: {flex: 1, fontSize: type.small, color: colors.ink, fontFamily: fonts.bold},
  lessonType: {fontSize: type.tab, color: colors.blue900, fontFamily: fonts.bold},
  addModule: {height: 52, borderRadius: radius.field, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.blue600, backgroundColor: colors.blue50, alignItems: 'center', justifyContent: 'center', marginTop: 4},
  addQuestion: {height: 52, borderRadius: radius.field, borderWidth: 1.5, borderColor: colors.blue600, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', marginTop: 6},
  addText: {fontSize: type.label, color: colors.blue700, fontFamily: fonts.bold},
  scrim: {flex: 1, backgroundColor: 'rgba(36, 42, 54, 0.35)'},
  sheet: {backgroundColor: colors.barBg, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: spacing.screen, paddingTop: 10, paddingBottom: 40},
  grabber: {alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: colors.sandLine, marginBottom: 16},
  sheetTitle: {fontSize: type.heading, color: colors.ink, fontFamily: fonts.display, marginBottom: 8},
  choice: {flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 64},
  two: {flexDirection: 'row', gap: 12},
  question: {flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, marginTop: 8},
  kind: {fontSize: type.caption, color: colors.blue700, marginTop: 4},
  switchRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 56, marginBottom: 6},
  switchText: {fontSize: type.body, color: colors.ink, flex: 1},
  attempts: {flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F2E3BF', borderRadius: radius.pill, paddingHorizontal: 12, height: 34},
  attemptsText: {fontSize: type.body, color: colors.ink, fontFamily: fonts.bold},
  drop: {alignItems: 'center', borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.sky, borderRadius: radius.card, backgroundColor: colors.blue50, paddingVertical: 26, gap: 6, marginBottom: 14},
  dropIcon: {width: 52, height: 52, borderRadius: 26, backgroundColor: colors.blue100, alignItems: 'center', justifyContent: 'center', marginBottom: 6},
  dropTitle: {fontSize: type.body, color: colors.ink, fontFamily: fonts.bold},
  upload: {flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, marginBottom: 10},
  uploadFailed: {borderColor: colors.danger},
  uploadBar: {marginTop: 8, marginRight: 24},
  readyCard: {backgroundColor: colors.blue50, borderRadius: radius.card, padding: 16, marginBottom: 6},
  readyBar: {marginTop: 12},
  check: {flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 58, borderBottomWidth: 1, borderBottomColor: colors.line},
  checkText: {flex: 1, fontSize: type.body, color: colors.ink},
});
