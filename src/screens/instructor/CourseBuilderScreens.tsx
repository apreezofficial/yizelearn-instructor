import React, {useState} from 'react';
import {Alert, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View} from 'react-native';
import {ProgressBar} from '../../components/Chalkboard';
import {CourseArt} from '../../components/Catalog';
import {Icon} from '../../components/Icon';
import {PrimaryAction} from '../../components/Layout';
import {assessmentBrief, curriculum, lessonTypes, publishChecks, quizQuestions, setupSteps, videoUploads, type LessonType} from '../../data/instructor';
import {colors, radius, spacing, type} from '../../theme/tokens';
import {Field, font, Pill, SectionTitle, StackHeader} from './shared';

/** Course setup: the checklist of steps for a draft course. */
export function SetupScreen({title, onBack, onStep}: {title: string; onBack: () => void; onStep: (key: string) => void}) {
  const done = setupSteps.filter(s => s.done).length;
  return <View style={styles.screen}>
    <StackHeader title="Course setup" onBack={onBack} />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.courseCard}>
        <CourseArt index={0} size={64} />
        <View style={styles.courseCopy}>
          <Text style={[styles.courseTitle, font]}>{title}</Text>
          <Pill label="Draft" tone="grey" />
          <View style={styles.progressRow}><ProgressBar value={(done / setupSteps.length) * 100} height={6} /></View>
        </View>
        <Text style={[styles.count, font]}>{done} of {setupSteps.length}</Text>
      </View>
      {setupSteps.map((step, i) => <Pressable key={step.key} onPress={() => onStep(step.key)} style={styles.step} accessibilityRole="button">
        <View style={[styles.stepMark, step.done && styles.stepDone]}>
          {step.done ? <Icon name="check" size={16} color={colors.onSky} /> : <Text style={[styles.stepNumber, font]}>{i + 1}</Text>}
        </View>
        <View style={styles.stepCopy}>
          <Text style={[styles.stepTitle, font]}>{step.title}</Text>
          <Text style={[styles.stepDetail, font]}>{step.detail}</Text>
        </View>
        <Icon name="next" size={18} color={colors.muted} />
      </Pressable>)}
    </ScrollView>
    <View style={styles.footer}><PrimaryAction label="Continue to pricing" onPress={() => onStep('pricing')} /></View>
  </View>;
}

/** Curriculum: modules with their lessons, plus an add button that opens the lesson-type sheet. */
export function CurriculumScreen({onBack, onPick}: {onBack: () => void; onPick: (type: LessonType) => void}) {
  const [open, setOpen] = useState<string>(curriculum[0].id);
  const [sheet, setSheet] = useState(false);
  return <View style={styles.screen}>
    <StackHeader title="Curriculum" onBack={onBack} right={<Pressable onPress={() => setSheet(true)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Add lesson"><Icon name="plus" size={24} color={colors.ink} /></Pressable>} />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {curriculum.map(module => {
        const expanded = open === module.id;
        return <View key={module.id} style={styles.module}>
          <Pressable onPress={() => setOpen(expanded ? '' : module.id)} style={styles.moduleHead} accessibilityRole="button" accessibilityState={{expanded}}>
            <Text style={[styles.moduleTitle, font]}>{module.title}</Text>
            <Text style={[styles.moduleCount, font]}>{module.lessons.length}</Text>
            <Icon name={expanded ? 'up' : 'down'} size={18} color={colors.ink} />
          </Pressable>
          {expanded && module.lessons.map(lesson => <View key={lesson.id} style={styles.lesson}>
            <Icon name="drag" size={18} color={colors.muted} />
            <Text style={[styles.lessonTitle, font]}>{lesson.title}</Text>
            <Text style={[styles.lessonType, font]}>{lesson.type}</Text>
          </View>)}
        </View>;
      })}
      <Pressable onPress={() => Alert.alert('Modules', 'Adding modules is not connected yet.')} style={styles.addModule} accessibilityRole="button">
        <Text style={[styles.addModuleText, font]}>+ Add module</Text>
      </Pressable>
    </ScrollView>
    <View style={styles.footer}><PrimaryAction label="Add lesson" onPress={() => setSheet(true)} /></View>

    <Modal visible={sheet} transparent animationType="slide" onRequestClose={() => setSheet(false)}>
      <Pressable style={styles.scrim} onPress={() => setSheet(false)} accessibilityLabel="Close" />
      <View style={styles.sheetBody}>
        <View style={styles.grabber} />
        <Text style={[styles.sheetTitle, font]}>Add lesson</Text>
        {lessonTypes.map(item => <Pressable key={item.type} onPress={() => { setSheet(false); onPick(item.type); }} style={styles.choice} accessibilityRole="button">
          <View style={styles.choiceIcon}><Icon name={item.icon} size={20} color={colors.blue700} /></View>
          <View style={styles.choiceCopy}>
            <Text style={[styles.choiceTitle, font]}>{item.type}</Text>
            <Text style={[styles.choiceDetail, font]}>{item.detail}</Text>
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
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.two}>
        <View style={styles.half}><Field label="Pass mark" value="70%" /></View>
        <View style={styles.half}><Field label="Time limit" value="None" /></View>
      </View>
      <SectionTitle title="Questions" action={`${quizQuestions.length} total`} />
      {quizQuestions.map(q => <View key={q.id} style={styles.question}>
        <View style={styles.questionCopy}>
          <Text style={[styles.questionText, font]}>{q.text}</Text>
          <Text style={[styles.questionKind, font]}>{q.kind}</Text>
        </View>
        <Icon name="drag" size={18} color={colors.muted} />
      </View>)}
      <Pressable onPress={() => Alert.alert('Questions', 'Adding questions is not connected yet.')} style={styles.addQuestion} accessibilityRole="button">
        <Text style={[styles.addModuleText, font]}>+ Add question</Text>
      </Pressable>
    </ScrollView>
    <View style={styles.footer}><PrimaryAction label="Save quiz" onPress={onSave} /></View>
  </View>;
}

/** Assessment builder: title, due date, brief, plagiarism check and attempts. */
export function AssessmentBuilderScreen({onBack, onSave}: {onBack: () => void; onSave: () => void}) {
  const [plagiarism, setPlagiarism] = useState(true);
  const [attempts, setAttempts] = useState(assessmentBrief.attempts);
  return <View style={styles.screen}>
    <StackHeader title="Assessment" onBack={onBack} />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Field label="Title" value={assessmentBrief.title} />
      <Field label="Due date" value={assessmentBrief.dueDate} />
      <Field label="Brief" value={assessmentBrief.brief} placeholder="Describe what learners should submit" multiline />
      <View style={styles.switchRow}>
        <Text style={[styles.switchText, font]}>Check for plagiarism</Text>
        <Switch value={plagiarism} onValueChange={setPlagiarism} trackColor={{true: colors.blue700, false: colors.sandLine}} />
      </View>
      <View style={styles.switchRow}>
        <Text style={[styles.switchText, font]}>Attempts allowed</Text>
        <View style={styles.stepper}>
          <Pressable onPress={() => setAttempts(String(Math.max(1, Number(attempts) - 1)))} style={styles.stepBtn} accessibilityRole="button" accessibilityLabel="Fewer attempts"><Text style={[styles.stepSign, font]}>−</Text></Pressable>
          <Text style={[styles.stepValue, font]}>{attempts}</Text>
          <Pressable onPress={() => setAttempts(String(Math.min(10, Number(attempts) + 1)))} style={styles.stepBtn} accessibilityRole="button" accessibilityLabel="More attempts"><Text style={[styles.stepSign, font]}>+</Text></Pressable>
        </View>
      </View>
    </ScrollView>
    <View style={styles.footer}><PrimaryAction label="Save assessment" onPress={onSave} /></View>
  </View>;
}

/** Video upload: a picker area and each file's upload state. */
export function UploadVideoScreen({onBack, onDone}: {onBack: () => void; onDone: () => void}) {
  return <View style={styles.screen}>
    <StackHeader title="Upload video" onBack={onBack} />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Pressable onPress={() => Alert.alert('Upload', 'Choosing video files is not connected yet.')} style={styles.drop} accessibilityRole="button">
        <View style={styles.dropIcon}><Icon name="upload" size={24} color={colors.blue700} /></View>
        <Text style={[styles.dropTitle, font]}>Tap to choose a video</Text>
        <Text style={[styles.dropHint, font]}>MP4 or MOV, up to 2 GB</Text>
      </Pressable>
      {videoUploads.map(v => {
        const failed = v.status === 'failed';
        return <View key={v.id} style={[styles.upload, failed && styles.uploadFailed]}>
          <Icon name="video" size={22} color={failed ? colors.danger : colors.blue700} />
          <View style={styles.uploadCopy}>
            <Text style={[styles.uploadName, font]}>{v.name}</Text>
            {v.status === 'uploading' && <View style={styles.uploadBar}><ProgressBar value={v.progress} height={5} /></View>}
            <Text style={[styles.uploadMeta, font, failed && styles.danger]}>{v.status === 'uploading' ? `Uploading, ${v.progress}%` : v.status === 'uploaded' ? 'Uploaded' : v.error}</Text>
          </View>
          {v.status === 'uploaded' && <Icon name="check" size={20} color={colors.blue700} />}
          {failed && <Pressable hitSlop={8} accessibilityRole="button"><Text style={[styles.retry, font]}>Retry</Text></Pressable>}
        </View>;
      })}
    </ScrollView>
    <View style={styles.footer}><PrimaryAction label="Done" onPress={onDone} /></View>
  </View>;
}

/** Pricing: course price, optional launch discount with promo code and end date. */
export function PricingScreen({onBack, onSave}: {onBack: () => void; onSave: () => void}) {
  const [discount, setDiscount] = useState(true);
  return <View style={styles.screen}>
    <StackHeader title="Pricing" onBack={onBack} />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Field label="Price" value="₦15,000" keyboardType="numeric" />
      <View style={styles.switchRow}>
        <Text style={[styles.switchText, font]}>Offer a discount</Text>
        <Switch value={discount} onValueChange={setDiscount} trackColor={{true: colors.blue700, false: colors.sandLine}} />
      </View>
      {discount && <>
        <Field label="Promo code" value="LAUNCH20" />
        <Field label="Valid until" value="30 Nov 2026" />
      </>}
    </ScrollView>
    <View style={styles.footer}><PrimaryAction label="Save pricing" onPress={onSave} /></View>
  </View>;
}

/** Publish checklist: what is ready and what still needs fixing before the course goes live. */
export function PublishChecklistScreen({onBack, onFix, onPublish}: {onBack: () => void; onFix: (key: string) => void; onPublish: () => void}) {
  const ready = publishChecks.filter(c => c.done).length;
  const allReady = ready === publishChecks.length;
  return <View style={styles.screen}>
    <StackHeader title="Publish checklist" onBack={onBack} />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.readyCard}>
        <Text style={[styles.readyText, font]}>{ready} of {publishChecks.length} ready</Text>
        <View style={styles.readyBar}><ProgressBar value={(ready / publishChecks.length) * 100} height={6} /></View>
      </View>
      {publishChecks.map(check => <View key={check.id} style={styles.check}>
        <Icon name={check.done ? 'check' : 'alert'} size={20} color={check.done ? colors.blue700 : colors.star} />
        <Text style={[styles.checkText, font]}>{check.title}</Text>
        {check.fix && <Pressable onPress={() => onFix(check.id)} hitSlop={8} accessibilityRole="button"><Text style={[styles.fix, font]}>{check.fix}</Text></Pressable>}
      </View>)}
    </ScrollView>
    <View style={styles.footer}><PrimaryAction label="Publish course" disabled={!allReady} onPress={onPublish} /></View>
  </View>;
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.cream},
  content: {padding: spacing.screen, paddingBottom: 28},
  footer: {paddingHorizontal: spacing.screen, paddingVertical: 14, backgroundColor: colors.barBg, borderTopWidth: 1, borderTopColor: colors.line},
  courseCard: {flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.card, padding: 14, marginBottom: 14},
  courseCopy: {flex: 1, gap: 6},
  courseTitle: {fontSize: type.label, color: colors.ink, fontWeight: '800'},
  progressRow: {marginTop: 6},
  count: {fontSize: type.small, color: colors.muted, fontWeight: '700'},
  step: {flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.card, padding: 16, marginBottom: 10},
  stepMark: {width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderColor: colors.muted, alignItems: 'center', justifyContent: 'center'},
  stepDone: {backgroundColor: colors.sky, borderColor: colors.sky},
  stepNumber: {fontSize: type.small, color: colors.muted, fontWeight: '700'},
  stepCopy: {flex: 1},
  stepTitle: {fontSize: type.label, color: colors.ink, fontWeight: '800'},
  stepDetail: {fontSize: type.caption, color: colors.muted, marginTop: 3},
  module: {backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.card, marginBottom: 12, overflow: 'hidden'},
  moduleHead: {flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 56, paddingHorizontal: 16, backgroundColor: colors.sand},
  moduleTitle: {flex: 1, fontSize: type.label, color: colors.ink, fontWeight: '800'},
  moduleCount: {fontSize: type.caption, color: colors.muted},
  lesson: {flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: colors.line},
  lessonTitle: {flex: 1, fontSize: type.small, color: colors.ink, fontWeight: '600'},
  lessonType: {fontSize: type.caption, color: colors.blue700, fontWeight: '700'},
  addModule: {height: 52, borderRadius: radius.card, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.blue600, alignItems: 'center', justifyContent: 'center', marginTop: 4},
  addModuleText: {fontSize: type.label, color: colors.blue700, fontWeight: '700'},
  addQuestion: {height: 52, borderRadius: radius.card, borderWidth: 1.5, borderColor: colors.blue600, alignItems: 'center', justifyContent: 'center', marginTop: 8},
  scrim: {flex: 1, backgroundColor: 'rgba(23, 51, 90, 0.45)'},
  sheetBody: {backgroundColor: colors.cream, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.screen, paddingBottom: 32},
  grabber: {alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: colors.sandLine, marginBottom: 14},
  sheetTitle: {fontSize: type.heading, color: colors.ink, fontWeight: '800', marginBottom: 12},
  choice: {flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 64, borderBottomWidth: 1, borderBottomColor: colors.line},
  choiceIcon: {width: 42, height: 42, borderRadius: 21, backgroundColor: colors.blue100, alignItems: 'center', justifyContent: 'center'},
  choiceCopy: {flex: 1},
  choiceTitle: {fontSize: type.label, color: colors.ink, fontWeight: '700'},
  choiceDetail: {fontSize: type.caption, color: colors.muted, marginTop: 3},
  two: {flexDirection: 'row', gap: 12},
  half: {flex: 1},
  question: {flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.card, padding: 14, marginBottom: 10},
  questionCopy: {flex: 1},
  questionText: {fontSize: type.label, color: colors.ink, fontWeight: '700'},
  questionKind: {fontSize: type.caption, color: colors.blue700, marginTop: 3},
  switchRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 56, marginBottom: 6},
  switchText: {fontSize: type.label, color: colors.ink, fontWeight: '600', flex: 1},
  stepper: {flexDirection: 'row', alignItems: 'center', gap: 12},
  stepBtn: {width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.sandLine, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center'},
  stepSign: {fontSize: type.heading, color: colors.ink, fontWeight: '700'},
  stepValue: {fontSize: type.heading, color: colors.ink, fontWeight: '800', minWidth: 24, textAlign: 'center'},
  drop: {alignItems: 'center', borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.blue600, borderRadius: radius.card, backgroundColor: colors.white, paddingVertical: 28, gap: 8, marginBottom: 16},
  dropIcon: {width: 52, height: 52, borderRadius: 26, backgroundColor: colors.blue100, alignItems: 'center', justifyContent: 'center'},
  dropTitle: {fontSize: type.label, color: colors.ink, fontWeight: '700'},
  dropHint: {fontSize: type.caption, color: colors.muted},
  upload: {flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.card, padding: 14, marginBottom: 10},
  uploadFailed: {borderColor: colors.danger, backgroundColor: '#FBF0F0'},
  uploadCopy: {flex: 1},
  uploadName: {fontSize: type.small, color: colors.ink, fontWeight: '700'},
  uploadBar: {marginTop: 8},
  uploadMeta: {fontSize: type.caption, color: colors.muted, marginTop: 4},
  danger: {color: colors.danger},
  retry: {fontSize: type.small, color: colors.blue700, fontWeight: '700'},
  stepsNote: {fontSize: type.caption, color: colors.muted},
  readyCard: {backgroundColor: colors.blue50, borderRadius: radius.card, padding: 16, marginBottom: 14},
  readyText: {fontSize: type.label, color: colors.ink, fontWeight: '800'},
  readyBar: {marginTop: 10},
  check: {flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, borderBottomWidth: 1, borderBottomColor: colors.line},
  checkText: {flex: 1, fontSize: type.label, color: colors.ink},
  fix: {fontSize: type.small, color: colors.blue700, fontWeight: '700'},
});

