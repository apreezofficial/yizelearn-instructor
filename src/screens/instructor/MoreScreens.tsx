import React, {useEffect, useRef, useState} from 'react';
import {Alert, Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {Icon, type IconName} from '../../components/Icon';
import {colors, radius, spacing, type} from '../../theme/tokens';
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
          <Text style={[styles.logoutText, font]}>Log out</Text>
        </Pressable>
        <Text style={[styles.signedIn, font]}>Signed in as {instructorName}</Text>
      </Reveal>
    </View>
  </ScrollView>;
}

const audiences = ['All learners, Excel course', 'All learners, Power BI course', 'Learners behind schedule'];

export function AnnouncementScreen({onBack, onSent}: {onBack: () => void; onSent: () => void}) {
  const [to, setTo] = useState(0);
  const [title, setTitle] = useState('Lesson 10 is live');
  const [message, setMessage] = useState('');
  const ready = title.trim().length > 0 && message.trim().length > 0;
  return <View style={styles.screen}>
    <StackHeader title="New announcement" onBack={onBack} />
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
      <Reveal order={0}><SelectField label="Send to" value={audiences[to]} onPress={() => setTo((to + 1) % audiences.length)} /></Reveal>
      <Reveal order={1}><Field label="Title" value={title} onChangeText={setTitle} /></Reveal>
      <Reveal order={2}><Field label="Message" value={message} onChangeText={setMessage} placeholder="Write your announcement" multiline /></Reveal>
    </ScrollView>
    <Footer label="Send announcement" disabled={!ready} onPress={() => { Alert.alert('Sent', `“${title}” went to ${audiences[to].toLowerCase()}.`); onSent(); }} />
  </View>;
}

const sessions = [
  {id: 's1', title: 'Formulas workshop', when: '29 Oct, 4:00 PM'},
  {id: 's2', title: 'Dashboard clinic', when: '5 Nov, 4:00 PM'},
  {id: 's3', title: 'Ask me anything', when: '12 Nov, 4:00 PM'},
];

export function LiveSessionsScreen({onBack}: {onBack: () => void}) {
  const [copied, setCopied] = useState(false);
  const pop = useRef(new Animated.Value(1)).current;
  const copy = () => {
    setCopied(true);
    Animated.sequence([Animated.timing(pop, {toValue: 0.92, duration: 90, useNativeDriver: true}), Animated.spring(pop, {toValue: 1, friction: 4, useNativeDriver: true})]).start();
    setTimeout(() => setCopied(false), 1800);
  };
  return <View style={styles.screen}>
    <StackHeader title="Live sessions" onBack={onBack} />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Reveal order={0} style={styles.hero}>
        <Drift style={styles.heroBig} range={8} duration={3200} />
        <Drift style={styles.heroDot} range={-6} duration={2400} />
        <Text style={[styles.heroLabel, font]}>Next session</Text>
        <Text style={[styles.heroTitle, font]}>Pivot tables Q&A</Text>
        <Text style={[styles.heroLabel, font]}>Thu 22 Oct, 4:00 PM</Text>
        <Animated.View style={{transform: [{scale: pop}], alignSelf: 'flex-start'}}>
          <Pressable onPress={copy} style={styles.heroButton} accessibilityRole="button">
            {copied && <Icon name="check" size={18} color={colors.white} />}
            <Text style={[styles.heroButtonText, font]}>{copied ? 'Link copied' : 'Copy join link'}</Text>
          </Pressable>
        </Animated.View>
      </Reveal>
      <View style={styles.body}>
        <SectionTitle title="Upcoming" />
        {sessions.map((s, i) => <Row key={s.id} order={i + 1} leading={<IconBadge name="users" />} title={s.title} meta={s.when} trailing={chevron} onPress={() => Alert.alert(s.title, s.when)} />)}
      </View>
    </ScrollView>
    <Footer label="Schedule session" onPress={() => Alert.alert('Schedule session', 'Scheduling is not connected yet.')} />
  </View>;
}

const templates = ['Classic', 'Modern', 'Minimal'] as const;
type Template = typeof templates[number];
const templateLook: Record<Template, {border: string; bg: string; serif?: boolean}> = {
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
          {logo && <View style={styles.logoChip}><Text style={[styles.logoChipText, font]}>{instructorInitials}</Text></View>}
          <Text style={[styles.certTitle, font, look.serif && styles.serif]}>Certificate of completion</Text>
          <Text style={[styles.certName, font, look.serif && styles.serif]}>Learner name</Text>
          <Text style={[styles.certCourse, font]}>Data analysis in Excel</Text>
          <View style={styles.certFoot}>
            <View style={styles.seal}><Icon name="award" size={20} color={colors.blue900} /></View>
            {signature && <Text style={[styles.signature, font]}>{instructorName}</Text>}
          </View>
        </Animated.View>
      </Reveal>
      <Reveal order={1} style={styles.chips}>
        {templates.map(t => <Pressable key={t} onPress={() => setTemplate(t)} style={[styles.chip, template === t && styles.chipOn]} accessibilityRole="tab" accessibilityState={{selected: template === t}}>
          <Text style={[styles.chipText, font, template === t && styles.chipTextOn]}>{t}</Text>
        </Pressable>)}
      </Reveal>
      <Reveal order={2}>
        <SectionTitle title="Logo and signature" />
        <View style={styles.pair}>
          <Pressable onPress={() => setLogo(!logo)} style={[styles.outline, logo && styles.outlineOn]} accessibilityRole="button">
            {logo && <Icon name="check" size={18} color={colors.blue700} />}
            <Text style={[styles.outlineText, font]}>{logo ? 'Logo added' : 'Upload logo'}</Text>
          </Pressable>
          <Pressable onPress={() => setSignature(!signature)} style={[styles.outline, signature && styles.outlineOn]} accessibilityRole="button">
            {signature && <Icon name="check" size={18} color={colors.blue700} />}
            <Text style={[styles.outlineText, font]}>{signature ? 'Signed' : 'Signature'}</Text>
          </Pressable>
        </View>
      </Reveal>
      <Reveal order={3} style={styles.assign}><Field label="Assign to course" defaultValue="Data analysis in Excel" /></Reveal>
    </ScrollView>
    <Footer label="Save certificate" onPress={() => { Alert.alert('Saved', `${template} certificate saved.`); onSave(); }} />
  </View>;
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.cream},
  content: {paddingBottom: 24},
  body: {paddingHorizontal: spacing.screen, paddingBottom: 24},
  pressed: {opacity: 0.75},
  logout: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, marginTop: 28, borderRadius: radius.button, borderWidth: 1, borderColor: '#F1C7C7', backgroundColor: '#FDF3F3'},
  logoutText: {fontSize: type.body, color: colors.danger, fontWeight: '700'},
  signedIn: {fontSize: type.caption, color: colors.muted, textAlign: 'center', marginTop: 10},
  hero: {marginHorizontal: spacing.screen, marginTop: 4, backgroundColor: colors.blue900, borderRadius: 20, padding: 18, overflow: 'hidden'},
  heroBig: {position: 'absolute', right: 12, top: 4, width: 90, height: 90, borderRadius: 45, backgroundColor: colors.navy},
  heroDot: {position: 'absolute', right: 26, top: 96, width: 30, height: 30, borderRadius: 15, backgroundColor: colors.marigold},
  heroLabel: {fontSize: type.caption, color: colors.white, opacity: 0.85},
  heroTitle: {fontSize: 24, color: colors.white, fontWeight: '800', marginVertical: 6},
  heroButton: {flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, backgroundColor: colors.blue700, borderRadius: 10, paddingHorizontal: 18, height: 42},
  heroButtonText: {fontSize: type.body, color: colors.white, fontWeight: '700'},
  certFrame: {padding: 10, borderRadius: 16, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white},
  cert: {borderRadius: 10, alignItems: 'center', paddingVertical: 28, paddingHorizontal: 16, overflow: 'hidden'},
  certBand: {position: 'absolute', left: 0, top: 0, bottom: 0, width: 8, backgroundColor: colors.marigold},
  logoChip: {position: 'absolute', top: 10, left: 14, width: 30, height: 30, borderRadius: 8, backgroundColor: colors.blue900, alignItems: 'center', justifyContent: 'center'},
  logoChipText: {fontSize: 11, color: colors.white, fontWeight: '800'},
  certTitle: {fontSize: type.label, color: colors.ink, fontWeight: '800'},
  certName: {fontSize: type.body, color: colors.ink, fontWeight: '800', marginTop: 14},
  certCourse: {fontSize: type.caption, color: colors.muted, marginTop: 6},
  serif: {fontFamily: 'Georgia'},
  certFoot: {flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 16},
  seal: {width: 38, height: 38, borderRadius: 19, backgroundColor: colors.marigold, alignItems: 'center', justifyContent: 'center'},
  signature: {fontFamily: 'Snell Roundhand', fontSize: 20, color: colors.blue900},
  chips: {flexDirection: 'row', gap: 8, marginTop: 18},
  chip: {height: 36, paddingHorizontal: 16, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.sandLine, backgroundColor: colors.white, justifyContent: 'center'},
  chipOn: {backgroundColor: colors.blue700, borderColor: colors.blue700},
  chipText: {fontSize: type.small, color: colors.ink, fontWeight: '600'},
  chipTextOn: {color: colors.white, fontWeight: '700'},
  pair: {flexDirection: 'row', gap: 12, marginTop: 6},
  outline: {flex: 1, flexDirection: 'row', gap: 6, height: 50, borderRadius: 10, borderWidth: 1.5, borderColor: colors.sky, alignItems: 'center', justifyContent: 'center'},
  outlineOn: {backgroundColor: colors.blue100},
  outlineText: {fontSize: type.body, color: colors.blue700, fontWeight: '700'},
  assign: {marginTop: 18},
});
