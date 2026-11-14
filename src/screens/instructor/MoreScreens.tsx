import type {ColorValue} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ActivityIndicator, Alert, Animated, Easing, Modal, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View} from 'react-native';
import {instructorApi, type CourseRow, type LiveRow} from '../../api/endpoints';
import {Icon, type IconName} from '../../components/Icon';
import {colors, radius, spacing, type, fonts} from '../../theme/tokens';
import {instructorInitials, instructorName} from '../../data/instructor';
import {Drift} from './DashboardScreen';
import {Field, Footer, IconBadge, Reveal, Row, SectionTitle, SelectField, StackHeader, TabHeader, font} from './shared';

export type MoreLink = 'Discussions' | 'Announcements' | 'Live' | 'Certificate' | 'Profile' | 'Help';

const links: {key: MoreLink; title: string; meta: string; icon: IconName}[] = [
  {key: 'Discussions', title: 'Discussions', meta: 'Questions from learners', icon: 'chat'},
  {key: 'Announcements', title: 'Announcements', meta: 'Message your learners', icon: 'bell'},
  {key: 'Live', title: 'Live sessions', meta: 'Schedule and join', icon: 'users'},
  {key: 'Certificate', title: 'Certificate designer', meta: 'Templates and logo', icon: 'award'},
  {key: 'Profile', title: 'Profile', meta: 'Public instructor page', icon: 'user'},
  {key: 'Help', title: 'Help centre', meta: 'Guides and support', icon: 'laptop'},
];

const chevron = <Icon name="next" size={20} color={colors.ink} />;

export function MoreScreen({onOpen, onNotifications, onLogout}: {onOpen: (link: MoreLink) => void; onNotifications: () => void; onLogout: () => void}) {
  const confirm = () => Alert.alert('Log out?', 'You will need a new code to log back in.', [
    {text: 'Cancel', style: 'cancel'},
    {text: 'Log out', style: 'destructive', onPress: onLogout},
  ]);
  return <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <TabHeader title="More" onBell={onNotifications} />
    <View style={styles.body}>
      {links.map((l, i) => <Row key={l.key} order={i} leading={<IconBadge name={l.icon} />} title={l.title} meta={l.meta} trailing={chevron} onPress={() => onOpen(l.key)} />)}
      <Reveal order={links.length + 1}>
        <Pressable onPress={confirm} style={({pressed}) => [styles.logout, pressed && styles.pressed]} accessibilityRole="button">
          <Icon name="logout" size={20} color={colors.danger} />
          <Text style={[font, styles.logoutText]}>Log out</Text>
        </Pressable>
        <Text style={[font, styles.signedIn]}>Signed in as {instructorName}</Text>
      </Reveal>
    </View>
  </ScrollView>;
}

export function AnnouncementScreen({onBack, onSent}: {onBack: () => void; onSent: () => void}) {
  const [courses, setCourses] = useState<CourseRow[] | null>(null);
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { instructorApi.courses().then(p => { setCourses(p.data); setCourseId(p.data[0]?.id ?? ''); }, () => setCourses([])); }, []);
  const ready = !!courseId && title.trim().length >= 3 && message.trim().length >= 3 && !busy;
  const send = async () => {
    setBusy(true);
    try { const a = await instructorApi.announce(courseId, title.trim(), message.trim()); Alert.alert('Announcement sent', a.recipientCount != null ? `It went to ${a.recipientCount} learners.` : 'It is on its way to your learners.', [{text: 'OK', onPress: onSent}]); }
    catch (e) { Alert.alert('Could not send', e instanceof Error ? e.message : 'Try again.'); }
    finally { setBusy(false); }
  };
  return <View style={styles.screen}>
    <StackHeader title="New announcement" onBack={onBack} />
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
      {!courses && <ActivityIndicator color={colors.blue700} style={{marginTop: 24}} />}
      {courses && courses.length === 0 && <Text style={[font, styles.empty]}>Create a course first. Announcements go to the learners of one of your courses.</Text>}
      {courses && courses.length > 0 && <Reveal order={0}><Text style={[font, styles.annLabel]}>Send to learners of</Text><View style={styles.annRow}>{courses.map(c => <Pressable key={c.id} onPress={() => setCourseId(c.id)} style={[styles.annChip, courseId === c.id && styles.annChipOn]} accessibilityRole="button"><Text style={[font, styles.annText, courseId === c.id && styles.annTextOn]}>{c.title}</Text></Pressable>)}</View></Reveal>}
      <Reveal order={1}><Field label="Title" value={title} onChangeText={setTitle} placeholder="What is this about?" /></Reveal>
      <Reveal order={2}><Field label="Message" value={message} onChangeText={setMessage} placeholder="Write your announcement" multiline /></Reveal>
    </ScrollView>
    <Footer label={busy ? 'Sending…' : 'Send announcement'} disabled={!ready} onPress={send} />
  </View>;
}

const when = (iso: string) => new Date(iso).toLocaleString('en-GB', {weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit'});

export function LiveSessionsScreen({onBack}: {onBack: () => void}) {
  const [sessions, setSessions] = useState<LiveRow[] | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState(false);
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [minutes, setMinutes] = useState('60');
  const [seats, setSeats] = useState('50');
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => { setError(''); instructorApi.liveSessions().then(p => setSessions(p.data), e => setError(e instanceof Error ? e.message : 'Could not load your sessions.')); }, []);
  useEffect(load, [load]);
  const startsAt = new Date(start.trim().replace(' ', 'T'));
  const valid = title.trim().length >= 3 && !Number.isNaN(startsAt.getTime()) && startsAt.getTime() > Date.now() && Number(minutes) >= 15 && Number(seats) >= 1;
  const schedule = async () => {
    setBusy(true);
    try { await instructorApi.scheduleLive({title: title.trim(), startsAt: startsAt.toISOString(), durationMin: Number(minutes), capacity: Number(seats)}); setForm(false); setTitle(''); setStart(''); load(); }
    catch (e) { Alert.alert('Could not schedule', e instanceof Error ? e.message : 'Try again.'); }
    finally { setBusy(false); }
  };
  const share = async (s: LiveRow) => {
    try { const l = await instructorApi.liveJoinLink(s.id); const url = l.url ?? l.joinUrl; if (url) await Share.share({message: `${s.title}: ${url}`}); else Alert.alert(s.title, when(s.startsAt)); }
    catch (e) { Alert.alert(s.title, e instanceof Error ? e.message : when(s.startsAt)); }
  };
  const upcoming = (sessions ?? []).filter(s => s.status !== 'cancelled' && new Date(s.startsAt).getTime() > Date.now() - 3600000);
  const next = upcoming[0];
  return <View style={styles.screen}>
    <StackHeader title="Live sessions" onBack={onBack} />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {!sessions && (error ? <Pressable onPress={load} accessibilityRole="button"><Text style={[font, styles.empty, styles.body]}>{error} Tap to try again.</Text></Pressable> : <ActivityIndicator color={colors.blue700} style={{marginTop: 24}} />)}
      {next && <Reveal order={0} style={styles.hero}>
        <Drift style={styles.heroBig} range={8} duration={3200} />
        <Drift style={styles.heroDot} range={-6} duration={2400} />
        <Text style={[font, styles.heroLabel]}>Next session</Text>
        <Text style={[font, styles.heroTitle]}>{next.title}</Text>
        <Text style={[font, styles.heroLabel]}>{when(next.startsAt)}</Text>
        <Pressable onPress={() => share(next)} style={styles.heroButton} accessibilityRole="button"><Text style={[font, styles.heroButtonText]}>Share join link</Text></Pressable>
      </Reveal>}
      <View style={styles.body}>
        {sessions && upcoming.length === 0 && <Text style={[font, styles.empty]}>No upcoming sessions. Schedule one below.</Text>}
        {upcoming.length > 0 && <SectionTitle title="Upcoming" />}
        {upcoming.map((s, i) => <Row key={s.id} order={i + 1} leading={<IconBadge name="users" />} title={s.title} meta={`${when(s.startsAt)}, ${s.bookedCount}/${s.capacity} booked`} trailing={chevron} onPress={() => share(s)} />)}
      </View>
    </ScrollView>
    <Footer label="Schedule session" onPress={() => setForm(true)} />
    <Modal visible={form} transparent animationType="fade" onRequestClose={() => setForm(false)}>
      <Pressable style={styles.scrim} onPress={() => setForm(false)} accessibilityLabel="Close" />
      <View style={styles.sheet}>
        <Text style={[font, styles.sheetTitle]}>Schedule a session</Text>
        <Field label="Title" value={title} onChangeText={setTitle} />
        <Field label="Starts (YYYY-MM-DD HH:mm, your time)" value={start} onChangeText={setStart} placeholder="2026-12-01 16:00" />
        <View style={styles.pair}><View style={styles.flexOne}><Field label="Minutes" value={minutes} onChangeText={setMinutes} keyboardType="numeric" /></View><View style={styles.flexOne}><Field label="Seats" value={seats} onChangeText={setSeats} keyboardType="numeric" /></View></View>
        <Footer label={busy ? 'Scheduling…' : 'Schedule'} disabled={!valid || busy} onPress={schedule} />
      </View>
    </Modal>
  </View>;
}

const templates = ['Classic', 'Modern', 'Minimal'] as const;
type Template = typeof templates[number];
const templateLook: Record<Template, {border: ColorValue; bg: ColorValue; serif?: boolean}> = {
  Classic: {border: colors.sky, bg: colors.white, serif: true},
  Modern: {border: colors.blue900, bg: '#F3F7FD'},
  Minimal: {border: colors.sandLine, bg: colors.white},
};

export function CertificateScreen({onBack, onSave}: {onBack: () => void; onSave: () => void}) {
  const [template, setTemplate] = useState<Template>('Classic');
  const [logo, setLogo] = useState(false);
  const [signature, setSignature] = useState(false);
  const flip = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    flip.setValue(0);
    Animated.timing(flip, {toValue: 1, duration: 420, easing: Easing.bezier(0.16, 1, 0.3, 1), useNativeDriver: true}).start();
  }, [template, flip]);
  const look = templateLook[template];
  return <View style={styles.screen}>
    <StackHeader title="Certificate" onBack={onBack} />
    <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
      <Reveal order={0} style={styles.certFrame}>
        <Animated.View style={[styles.cert, {borderColor: look.border, backgroundColor: look.bg, borderWidth: template === 'Modern' ? 2 : 1.5},
          {opacity: flip, transform: [{scale: flip.interpolate({inputRange: [0, 1], outputRange: [0.94, 1]})}]}]}>
          {template === 'Modern' && <View style={styles.certBand} />}
          {logo && <View style={styles.logoChip}><Text style={[font, styles.logoChipText]}>{instructorInitials}</Text></View>}
          <Text style={[font, styles.certTitle, look.serif && styles.serif]}>Certificate of completion</Text>
          <Text style={[font, styles.certName, look.serif && styles.serif]}>Learner name</Text>
          <Text style={[font, styles.certCourse]}>Data analysis in Excel</Text>
          <View style={styles.certFoot}>
            <View style={styles.seal}><Icon name="award" size={20} color={colors.blue900} /></View>
            {signature && <Text style={[font, styles.signature]}>{instructorName}</Text>}
          </View>
        </Animated.View>
      </Reveal>
      <Reveal order={1} style={styles.chips}>
        {templates.map(t => <Pressable key={t} onPress={() => setTemplate(t)} style={[styles.chip, template === t && styles.chipOn]} accessibilityRole="tab" accessibilityState={{selected: template === t}}>
          <Text style={[font, styles.chipText, template === t && styles.chipTextOn]}>{t}</Text>
        </Pressable>)}
      </Reveal>
      <Reveal order={2}>
        <SectionTitle title="Logo and signature" />
        <View style={styles.pair}>
          <Pressable onPress={() => setLogo(!logo)} style={[styles.outline, logo && styles.outlineOn]} accessibilityRole="button">
            {logo && <Icon name="check" size={18} color={colors.blue700} />}
            <Text style={[font, styles.outlineText]}>{logo ? 'Logo added' : 'Upload logo'}</Text>
          </Pressable>
          <Pressable onPress={() => setSignature(!signature)} style={[styles.outline, signature && styles.outlineOn]} accessibilityRole="button">
            {signature && <Icon name="check" size={18} color={colors.blue700} />}
            <Text style={[font, styles.outlineText]}>{signature ? 'Signed' : 'Signature'}</Text>
          </Pressable>
        </View>
      </Reveal>
      <Reveal order={3} style={styles.assign}><Field label="Assign to course" defaultValue="Data analysis in Excel" /></Reveal>
    </ScrollView>
    <Footer label="Save certificate" onPress={() => Alert.alert('Not connected yet', 'Certificate templates are not saved to the server yet, so nothing was changed.')} />
  </View>;
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.cream},
  empty: {fontSize: 15, color: colors.muted, lineHeight: 22, marginTop: 16},
  annLabel: {fontSize: 13, color: colors.ink, fontFamily: fonts.bold, marginTop: 8, marginBottom: 8},
  annRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14},
  annChip: {minHeight: 40, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: colors.sandLine, backgroundColor: colors.white, justifyContent: 'center'},
  annChipOn: {backgroundColor: colors.blue700, borderColor: colors.blue700},
  annText: {fontSize: 14, color: colors.ink},
  annTextOn: {color: colors.white},
  scrim: {flex: 1, backgroundColor: 'rgba(0,0,0,0.45)'},
  sheet: {backgroundColor: colors.cream, padding: spacing.screen, paddingBottom: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24},
  sheetTitle: {fontSize: 20, color: colors.ink, fontFamily: fonts.display, marginBottom: 14},
  pair: {flexDirection: 'row', gap: 12},
  flexOne: {flex: 1},
  content: {paddingBottom: 24},
  body: {paddingHorizontal: spacing.screen, paddingBottom: 24},
  pressed: {opacity: 0.75},
  logout: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, marginTop: 28, borderRadius: radius.button, borderWidth: 1, borderColor: '#F1C7C7', backgroundColor: '#FDF3F3'},
  logoutText: {fontSize: type.body, color: colors.danger, fontFamily: fonts.bold},
  signedIn: {fontSize: type.caption, color: colors.muted, textAlign: 'center', marginTop: 10},
  hero: {marginHorizontal: spacing.screen, marginTop: 4, backgroundColor: colors.blue900, borderRadius: 20, padding: 18, overflow: 'hidden'},
  heroBig: {position: 'absolute', right: 12, top: 4, width: 90, height: 90, borderRadius: 45, backgroundColor: colors.navy},
  heroDot: {position: 'absolute', right: 26, top: 96, width: 30, height: 30, borderRadius: 15, backgroundColor: colors.marigold},
  heroLabel: {fontSize: type.caption, color: colors.white, opacity: 0.85},
  heroTitle: {fontSize: 24, color: colors.white, fontFamily: fonts.display, marginVertical: 6},
  heroButton: {flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, backgroundColor: colors.blue700, borderRadius: 10, paddingHorizontal: 18, height: 42},
  heroButtonText: {fontSize: type.body, color: colors.white, fontFamily: fonts.bold},
  certFrame: {padding: 10, borderRadius: 16, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white},
  cert: {borderRadius: 10, alignItems: 'center', paddingVertical: 28, paddingHorizontal: 16, overflow: 'hidden'},
  certBand: {position: 'absolute', left: 0, top: 0, bottom: 0, width: 8, backgroundColor: colors.marigold},
  logoChip: {position: 'absolute', top: 10, left: 14, width: 30, height: 30, borderRadius: 8, backgroundColor: colors.blue900, alignItems: 'center', justifyContent: 'center'},
  logoChipText: {fontSize: 11, color: colors.white, fontFamily: fonts.bold},
  certTitle: {fontSize: type.label, color: colors.ink, fontFamily: fonts.bold},
  certName: {fontSize: type.body, color: colors.ink, fontFamily: fonts.display, marginTop: 14},
  certCourse: {fontSize: type.caption, color: colors.muted, marginTop: 6},
  serif: {fontFamily: 'Georgia'},
  certFoot: {flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 16},
  seal: {width: 38, height: 38, borderRadius: 19, backgroundColor: colors.marigold, alignItems: 'center', justifyContent: 'center'},
  signature: {fontFamily: 'Snell Roundhand', fontSize: 20, color: colors.blue900},
  chips: {flexDirection: 'row', gap: 8, marginTop: 18},
  chip: {height: 36, paddingHorizontal: 16, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.sandLine, backgroundColor: colors.white, justifyContent: 'center'},
  chipOn: {backgroundColor: colors.blue700, borderColor: colors.blue700},
  chipText: {fontSize: type.small, color: colors.ink, fontFamily: fonts.semibold},
  chipTextOn: {color: colors.white, fontFamily: fonts.bold},
  outline: {flex: 1, flexDirection: 'row', gap: 6, height: 50, borderRadius: 10, borderWidth: 1.5, borderColor: colors.sky, alignItems: 'center', justifyContent: 'center'},
  outlineOn: {backgroundColor: colors.blue100},
  outlineText: {fontSize: type.body, color: colors.blue700, fontFamily: fonts.bold},
  assign: {marginTop: 18},
});
