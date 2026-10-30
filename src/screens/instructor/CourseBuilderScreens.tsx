import React, {useState} from 'react';
import {Alert, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View} from 'react-native';
import {ProgressBar} from '../../components/Chalkboard';
import {CourseArt} from '../../components/Catalog';
import {Icon} from '../../components/Icon';
import {assessmentBrief, curriculum, lessonTypes, publishChecks, quizQuestions, setupSteps, videoUploads, type LessonType} from '../../data/instructor';
import {colors, radius, spacing, type} from '../../theme/tokens';
import {Field, font, Footer, IconBadge, Pill, Reveal, SectionTitle, SelectField, StackHeader} from './shared';

const notConnected = (what: string) => Alert.alert(what, `${what} is not connected yet.`);

/** Course setup: the checklist of steps for a draft course. */
export function SetupScreen({title, onBack, onStep}: {title: string; onBack: () => void; onStep: (key: string) => void}) {
  const done = setupSteps.filter(s => s.done).length;
  return <View style={styles.screen}>
    <StackHeader title="Course setup" onBack={onBack} />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.courseCard}>
        <CourseArt index={0} size={72} />
        <View style={styles.courseCopy}>
          <Text style={[styles.courseTitle, font]}>{title}</Text>
          <View style={styles.draft}><Pill label="Draft" tone="grey" /></View>
          <View style={styles.progressRow}>
            <View style={styles.flex}><ProgressBar value={(done / setupSteps.length) * 100} fill={colors.blue700} track={colors.sand} height={5} /></View>
            <Text style={[styles.count, font]}>{done} of {setupSteps.length}</Text>
          </View>
        </View>
      </View>
      {setupSteps.map((step, i) => <Reveal key={step.key} order={i + 1}><Pressable onPress={() => onStep(step.key)} style={({pressed}) => [styles.card, styles.step, pressed && styles.pressed]} accessibilityRole="button">
        {step.done
          ? <View style={[styles.mark, styles.markDone]}><Icon name="check" size={16} color={colors.white} strokeWidth={2.4} /></View>
          : <View style={styles.mark}><Text style={[styles.markNumber, font]}>{i + 1}</Text></View>}
        <View style={styles.flex}>
          <Text style={[styles.cardTitle, font]}>{step.title}</Text>
          <Text style={[styles.cardMeta, font]}>{step.detail}</Text>
        </View>
        <Icon name="next" size={18} color={colors.ink} />
      </Pressable></Reveal>)}
    </ScrollView>
    <Footer label="Continue to pricing" onPress={() => onStep('pricing')} />
  </View>;
}

/** Curriculum: modules with their lessons, plus the add-lesson sheet. */
export function CurriculumScreen({onBack, onPick}: {onBack: () => void; onPick: (type: LessonType) => void}) {
  const [closed, setClosed] = useState<string[]>([]);
  const [sheet, setSheet] = useState(false);
  const toggle = (id: string) => setClosed(c => (c.includes(id) ? c.filter(x => x !== id) : [...c, id]));
  return <View style={styles.screen}>
    <StackHeader title="Curriculum" onBack={onBack} right={<Pressable onPress={() => setSheet(true)} hitSlop={10} accessibilityRole="button" accessibilityLabel="Add lesson"><Icon name="plus" size={24} color={colors.ink} /></Pressable>} />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {curriculum.map((module, mi) => {
        const expanded = !closed.includes(module.id);
        return <Reveal key={module.id} order={mi} style={styles.module}>
          <Pressable onPress={() => toggle(module.id)} style={styles.moduleHead} accessibilityRole="button" accessibilityState={{expanded}}>
            <Icon name="handle" size={18} color={colors.muted} />
            <Text style={[styles.moduleTitle, font]}>{module.title}</Text>
            <Icon name={expanded ? 'down' : 'next'} size={20} color={colors.ink} />
          </Pressable>
          {expanded && module.lessons.map(lesson => <View key={lesson.id} style={styles.lesson}>
            <Icon name="handle" size={16} color={colors.muted} />
            <Text style={[styles.lessonTitle, font]}>{lesson.title}</Text>
            <Text style={[styles.lessonType, font]}>{lesson.type}</Text>
          </View>)}
        </Reveal>;
      })}
      <Pressable onPress={() => notConnected('Adding modules')} style={styles.addModule} accessibilityRole="button">
        <Text style={[styles.addText, font]}>+ Add module</Text>
      </Pressable>
    </ScrollView>
    <Footer label="Add lesson" onPress={() => setSheet(true)} />

    <Modal visible={sheet} transparent animationType="fade" onRequestClose={() => setSheet(false)}>
      <Pressable style={styles.scrim} onPress={() => setSheet(false)} accessibilityLabel="Close" />
      <View style={styles.sheet}>
        <View style={styles.grabber} />
        <Text style={[styles.sheetTitle, font]}>Add lesson</Text>
        {lessonTypes.map(item => <Pressable key={item.type} onPress={() => { setSheet(false); onPick(item.type); }} style={({pressed}) => [styles.choice, pressed && styles.pressed]} accessibilityRole="button">
          <IconBadge name={item.icon} size={40} />
          <View style={styles.flex}>
            <Text style={[styles.cardTitle, font]}>{item.type}</Text>
            <Text style={[styles.cardMeta, font]}>{item.detail}</Text>
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
          <Text style={[styles.cardTitle, font]}>{q.text}</Text>
          <Text style={[styles.kind, font]}>{q.kind}</Text>
        </View>
        <Icon name="handle" size={18} color={colors.muted} />
      </View></Reveal>)}
      <Pressable onPress={() => notConnected('Adding questions')} style={styles.addQuestion} accessibilityRole="button">
        <Text style={[styles.addText, font]}>+ Add question</Text>
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
        <Text style={[styles.switchText, font]}>Check for plagiarism</Text>
        <Switch value={plagiarism} onValueChange={setPlagiarism} trackColor={{true: colors.blue700, false: colors.sandLine}} />
      </View>
      <View style={styles.switchRow}>
        <Text style={[styles.switchText, font]}>Set number of{'\n'}attempts</Text>
        <Pressable onPress={() => setAttempts(a => (a % 5) + 1)} style={styles.attempts} accessibilityRole="button" accessibilityLabel={`${attempts} attempts, tap to change`}>
          <Text style={[styles.attemptsText, font]}>{attempts}</Text>
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
        <Text style={[styles.dropTitle, font]}>Tap to choose a video</Text>
        <Text style={[styles.cardMeta, font]}>MP4 or MOV, up to 2 GB</Text>
      </Pressable>
      {videoUploads.map((v, i) => {
        const failed = v.status === 'failed';
        return <Reveal key={v.id} order={i + 1}><View style={[styles.card, styles.upload, failed && styles.uploadFailed]}>
          <IconBadge name="file" size={40} square />
          <View style={styles.flex}>
            <Text style={[styles.cardTitle, font]}>{v.name}</Text>
            <Text style={[styles.cardMeta, font, failed && styles.danger]}>{v.status === 'uploading' ? `Uploading, ${v.progress}%` : v.status === 'uploaded' ? 'Uploaded' : `Failed: ${v.error?.toLowerCase()}`}</Text>
            {v.status === 'uploading' && <View style={styles.uploadBar}><ProgressBar value={v.progress} fill={colors.blue700} track={colors.sand} height={5} /></View>}
          </View>
          {v.status === 'uploading' && <Pressable hitSlop={10} accessibilityRole="button" accessibilityLabel="Cancel upload"><Icon name="close" size={20} color={colors.ink} /></Pressable>}
          {v.status === 'uploaded' && <View style={[styles.mark, styles.markDone]}><Icon name="check" size={16} color={colors.white} strokeWidth={2.4} /></View>}
          {failed && <Pressable hitSlop={10} accessibilityRole="button"><Text style={[styles.link, font]}>Retry</Text></Pressable>}
        </View></Reveal>;
      })}
    </ScrollView>
    <Footer label="Done" onPress={onDone} />
  </View>;
}

/** Pricing: course price, optional launch discount with promo code and end date. */
export function PricingScreen({onBack, onSave}: {onBack: () => void; onSave: () => void}) {
  const [discount, setDiscount] = useState(true);
  return <View style={styles.screen}>
    <StackHeader title="Pricing" onBack={onBack} />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Field label="Price" defaultValue="₦15,000" keyboardType="numeric" />
      <View style={styles.switchRow}>
        <Text style={[styles.switchText, font]}>Offer a discount</Text>
        <Switch value={discount} onValueChange={setDiscount} trackColor={{true: colors.blue700, false: colors.sandLine}} />
      </View>
      {discount && <>
        <Field label="Promo code" defaultValue="LAUNCH20" />
        <SelectField label="Valid until" value="30 Nov 2026" onPress={() => notConnected('Picking a date')} />
      </>}
    </ScrollView>
    <Footer label="Save pricing" onPress={onSave} />
  </View>;
}

/** Publish checklist: what is ready and what still needs fixing before the course goes live. */
export function PublishChecklistScreen({onBack, onFix, onPublish}: {onBack: () => void; onFix: (key: string) => void; onPublish: () => void}) {
  const ready = publishChecks.filter(c => c.done).length;
  return <View style={styles.screen}>
    <StackHeader title="Publish checklist" onBack={onBack} />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.readyCard}>
        <Text style={[styles.cardTitle, font]}>{ready} of {publishChecks.length} ready</Text>
        <View style={styles.readyBar}><ProgressBar value={(ready / publishChecks.length) * 100} fill={colors.blue700} track={colors.sand} height={6} /></View>
      </View>
      {publishChecks.map((check, i) => <Reveal key={check.id} order={i + 1}><View style={styles.check}>
        {check.done
          ? <View style={[styles.mark, styles.markDone]}><Icon name="check" size={16} color={colors.white} strokeWidth={2.4} /></View>
          : <View style={[styles.mark, styles.markWarn]}><Text style={[styles.warnText, font]}>!</Text></View>}
        <Text style={[styles.checkText, font]}>{check.title}</Text>
        {check.fix && <Pressable onPress={() => onFix(check.id)} hitSlop={10} accessibilityRole="button"><Text style={[styles.link, font]}>{check.fix}</Text></Pressable>}
      </View></Reveal>)}
    </ScrollView>
    <Footer label="Publish course" onPress={onPublish} />
  </View>;
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.cream},
  content: {paddingHorizontal: spacing.screen, paddingBottom: 28},
  flex: {flex: 1},
  pressed: {opacity: 0.8},
  card: {backgroundColor: colors.barBg, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.card},
  cardTitle: {fontSize: type.label, color: colors.ink, fontWeight: '800'},
  cardMeta: {fontSize: type.caption, color: colors.muted, marginTop: 3},
  link: {fontSize: type.small, color: colors.blue700, fontWeight: '700'},
  danger: {color: colors.danger},
  courseCard: {flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.barBg, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.card, padding: 12, marginBottom: 12},
  courseCopy: {flex: 1},
  courseTitle: {fontSize: type.body, color: colors.ink, fontWeight: '800'},
  draft: {alignSelf: 'flex-start', marginTop: 8},
  progressRow: {flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10},
  count: {fontSize: type.caption, color: colors.muted},
  step: {flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, marginBottom: 10},
  mark: {width: 30, height: 30, borderRadius: 15, borderWidth: 1.5, borderColor: colors.sandLine, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center'},
  markDone: {backgroundColor: colors.blue700, borderColor: colors.blue700},
  markWarn: {backgroundColor: colors.marigold, borderColor: colors.marigold},
  markNumber: {fontSize: type.small, color: colors.muted, fontWeight: '700'},
  warnText: {fontSize: type.small, color: colors.ink, fontWeight: '800'},
  module: {marginBottom: 14},
  moduleHead: {flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52, paddingHorizontal: 14, borderRadius: radius.field, backgroundColor: colors.sand, marginBottom: 8},
  moduleTitle: {flex: 1, fontSize: type.label, color: colors.ink, fontWeight: '800'},
  lesson: {flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48, paddingHorizontal: 14, marginLeft: 12, marginBottom: 8, borderRadius: radius.field, borderWidth: 1, borderColor: colors.sandLine, backgroundColor: colors.barBg},
  lessonTitle: {flex: 1, fontSize: type.small, color: colors.ink, fontWeight: '700'},
  lessonType: {fontSize: type.tab, color: colors.blue900, fontWeight: '700'},
  addModule: {height: 52, borderRadius: radius.field, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.blue600, backgroundColor: colors.blue50, alignItems: 'center', justifyContent: 'center', marginTop: 4},
  addQuestion: {height: 52, borderRadius: radius.field, borderWidth: 1.5, borderColor: colors.blue600, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', marginTop: 6},
  addText: {fontSize: type.label, color: colors.blue700, fontWeight: '700'},
  scrim: {flex: 1, backgroundColor: 'rgba(36, 42, 54, 0.35)'},
  sheet: {backgroundColor: colors.barBg, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: spacing.screen, paddingTop: 10, paddingBottom: 40},
  grabber: {alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: colors.sandLine, marginBottom: 16},
  sheetTitle: {fontSize: type.heading, color: colors.ink, fontWeight: '800', marginBottom: 8},
  choice: {flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 64},
  two: {flexDirection: 'row', gap: 12},
  question: {flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, marginTop: 8},
  kind: {fontSize: type.caption, color: colors.blue700, marginTop: 4},
  switchRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 56, marginBottom: 6},
  switchText: {fontSize: type.body, color: colors.ink, flex: 1},
  attempts: {flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F2E3BF', borderRadius: radius.pill, paddingHorizontal: 12, height: 34},
  attemptsText: {fontSize: type.body, color: colors.ink, fontWeight: '700'},
  drop: {alignItems: 'center', borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.sky, borderRadius: radius.card, backgroundColor: colors.blue50, paddingVertical: 26, gap: 6, marginBottom: 14},
  dropIcon: {width: 52, height: 52, borderRadius: 26, backgroundColor: colors.blue100, alignItems: 'center', justifyContent: 'center', marginBottom: 6},
  dropTitle: {fontSize: type.body, color: colors.ink, fontWeight: '800'},
  upload: {flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, marginBottom: 10},
  uploadFailed: {borderColor: colors.danger},
  uploadBar: {marginTop: 8, marginRight: 24},
  readyCard: {backgroundColor: colors.blue50, borderRadius: radius.card, padding: 16, marginBottom: 6},
  readyBar: {marginTop: 12},
  check: {flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 58, borderBottomWidth: 1, borderBottomColor: colors.line},
  checkText: {flex: 1, fontSize: type.body, color: colors.ink},
});
