import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {instructorApi, type NotificationRow, type ProfileData, type SecurityData} from '../../api/endpoints';
import {Icon} from '../../components/Icon';
import {colors, radius, spacing, type, fonts} from '../../theme/tokens';
import {Avatar, Field, Footer, IconBadge, Reveal, Row, StackHeader, font} from './shared';

function useApi<T>(load: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const run = useCallback(() => { setError(''); load().then(setData, e => setError(e instanceof Error ? e.message : 'Could not load this.')); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(run, [run]);
  return {data, error, reload: run};
}
function State({error, reload}: {error: string; reload: () => void}) {
  return error ? <Pressable onPress={reload} accessibilityRole="button"><Text style={[font, styles.note]}>{error} Tap to try again.</Text></Pressable> : <ActivityIndicator color={colors.blue700} style={{marginTop: 24}} />;
}
const initialsOf = (n: string) => n.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
const when = (iso: string) => new Date(iso).toLocaleString('en-GB', {day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit'});

export function NotificationsScreen({onBack}: {onBack: () => void}) {
  const {data, error, reload} = useApi(() => instructorApi.notifications());
  const [all, setAll] = useState(false);
  const markAll = async () => { try { await instructorApi.readAll(); setAll(true); } catch (e) { Alert.alert('Could not update', e instanceof Error ? e.message : 'Try again.'); } };
  const rows: NotificationRow[] = data?.data ?? [];
  return <View style={styles.screen}>
    <StackHeader title="Notifications" onBack={onBack} right={rows.some(n => !n.read) && !all ? <Pressable onPress={markAll} hitSlop={10} accessibilityRole="button"><Text style={[font, styles.link]}>Read all</Text></Pressable> : undefined} />
    <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
      {!data && <State error={error} reload={reload} />}
      {data && rows.length === 0 && <Text style={[font, styles.note]}>You are all caught up.</Text>}
      {rows.map((n, i) => <Row key={n.id} order={i} leading={<IconBadge name="bell" />} title={n.title} meta={`${n.body ? `${n.body} · ` : ''}${when(n.createdAt)}`} trailing={!n.read && !all ? <View style={styles.dot} /> : undefined} />)}
    </ScrollView>
  </View>;
}

export function ProfileScreen({onBack, onEdit, onSettings}: {onBack: () => void; onEdit: () => void; onSettings: () => void}) {
  const {data, error, reload} = useApi(() => instructorApi.profile());
  return <View style={styles.screen}>
    <StackHeader title="Profile" onBack={onBack} right={<Pressable onPress={onSettings} hitSlop={10} accessibilityLabel="Settings"><Icon name="settings" size={21} color={colors.ink} /></Pressable>} />
    {!data ? <State error={error} reload={reload} /> : <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
      <Reveal order={0} style={styles.hero}>
        <Avatar initials={initialsOf(data.fullName)} size={62} />
        <Text style={[font, styles.name]}>{data.fullName}</Text>
        <Text style={[font, styles.role]}>{data.headline ?? 'Instructor'} · {data.stats.coursesCount} {data.stats.coursesCount === 1 ? 'course' : 'courses'} · {data.stats.learnersCount} learners</Text>
        {data.stats.ratingAvg != null && <Text style={[font, styles.role]}>★ {data.stats.ratingAvg.toFixed(1)} ({data.stats.ratingCount} ratings)</Text>}
      </Reveal>
      <Reveal order={1} style={styles.card}>
        <Text style={[font, styles.label]}>About</Text>
        <Text style={[font, styles.about]}>{data.bio || 'Add a short bio so learners know who is teaching them.'}</Text>
        {data.website ? <Text style={[font, styles.link, styles.gap]}>{data.website}</Text> : null}
        {data.links.map(l => <Text key={l.url} style={[font, styles.link, styles.gap]}>{l.label}: {l.url}</Text>)}
      </Reveal>
    </ScrollView>}
    <Footer label="Edit profile" disabled={!data} onPress={onEdit} />
  </View>;
}

export function EditProfileScreen({onBack, onSave}: {onBack: () => void; onSave: () => void}) {
  const {data, error, reload} = useApi(() => instructorApi.profile());
  const [edit, setEdit] = useState<Partial<Pick<ProfileData, 'fullName' | 'headline' | 'bio' | 'website'>>>({});
  const [busy, setBusy] = useState(false);
  const v = (k: 'fullName' | 'headline' | 'bio' | 'website') => (edit[k] ?? data?.[k] ?? '') as string;
  const save = async () => {
    if (!data) return;
    setBusy(true);
    try { await instructorApi.saveProfile({fullName: v('fullName').trim(), headline: v('headline').trim() || null, bio: v('bio').trim() || null, website: v('website').trim() || null, links: data.links}); onSave(); }
    catch (e) { Alert.alert('Could not save', e instanceof Error ? e.message : 'Try again.'); }
    finally { setBusy(false); }
  };
  return <View style={styles.screen}>
    <StackHeader title="Edit profile" onBack={onBack} />
    {!data ? <State error={error} reload={reload} /> : <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
      <Field label="Full name" value={v('fullName')} onChangeText={t => setEdit(e => ({...e, fullName: t}))} />
      <Field label="Headline" value={v('headline')} onChangeText={t => setEdit(e => ({...e, headline: t}))} placeholder="e.g. Data analyst and teacher" />
      <Field label="Bio" value={v('bio')} onChangeText={t => setEdit(e => ({...e, bio: t}))} multiline />
      <Field label="Website" value={v('website')} onChangeText={t => setEdit(e => ({...e, website: t}))} placeholder="https://" autoCapitalize="none" />
    </ScrollView>}
    <Footer label={busy ? 'Saving…' : 'Save profile'} disabled={!data || busy || v('fullName').trim().length < 2} onPress={save} />
  </View>;
}

export function SecurityScreen({onBack}: {onBack: () => void}) {
  const {data, error, reload} = useApi<SecurityData>(() => instructorApi.security());
  const revoke = async () => { try { await instructorApi.revokeOthers(); reload(); } catch (e) { Alert.alert('Could not sign out other devices', e instanceof Error ? e.message : 'Try again.'); } };
  return <View style={styles.screen}>
    <StackHeader title="Security" onBack={onBack} />
    {!data ? <State error={error} reload={reload} /> : <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
      <Reveal order={0} style={styles.card}>
        <Text style={[font, styles.label]}>Password</Text>
        <Text style={[font, styles.about]}>{data.passwordChangedAt ? `Last changed ${when(data.passwordChangedAt)}` : 'Never changed'}</Text>
        <Text style={[font, styles.label, styles.gap]}>Two-step sign-in</Text>
        <Text style={[font, styles.about]}>{data.twoStepEnabled ? 'On, with an authenticator app.' : 'Off. You can turn it on from the web dashboard.'}</Text>
      </Reveal>
      <Text style={[font, styles.section]}>Signed-in devices</Text>
      {data.sessions.map((s, i) => <Row key={s.id} order={i + 1} leading={<IconBadge name="laptop" />} title={`${s.deviceName}${s.isCurrent ? ' (this device)' : ''}`} meta={`${[s.city, s.country].filter(Boolean).join(', ') || 'Unknown place'} · ${when(s.lastActiveAt)}`} />)}
      {data.sessions.length > 1 && <Pressable onPress={revoke} style={styles.outline} accessibilityRole="button"><Text style={[font, styles.outlineText]}>Sign out other devices</Text></Pressable>}
    </ScrollView>}
  </View>;
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.cream},
  body: {paddingHorizontal: spacing.screen, paddingBottom: 24},
  note: {fontSize: 15, color: colors.muted, lineHeight: 22, marginTop: 16},
  link: {fontSize: type.small, color: colors.blue700, fontFamily: fonts.bold},
  gap: {marginTop: 12},
  dot: {width: 10, height: 10, borderRadius: 5, backgroundColor: colors.danger},
  hero: {alignItems: 'center', paddingVertical: 20, gap: 6},
  name: {fontSize: type.heading, color: colors.ink, fontFamily: fonts.display},
  role: {fontSize: type.small, color: colors.muted, textAlign: 'center'},
  card: {borderRadius: radius.card, borderWidth: 1, borderColor: colors.sandLine, backgroundColor: colors.white, padding: 16, marginTop: 8},
  label: {fontSize: type.small, color: colors.ink, fontFamily: fonts.bold},
  about: {fontSize: type.body, color: colors.ink, lineHeight: 24, marginTop: 6},
  section: {fontSize: type.subheading, color: colors.ink, fontFamily: fonts.display, marginTop: 24, marginBottom: 4},
  outline: {height: 52, borderRadius: radius.button, borderWidth: 1.5, borderColor: colors.blue700, alignItems: 'center', justifyContent: 'center', marginTop: 20},
  outlineText: {fontSize: type.body, color: colors.blue700, fontFamily: fonts.bold},
});
