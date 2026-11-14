import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ActivityIndicator, Animated, Easing, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {SearchField} from '../../components/Catalog';
import {messagesApi} from '../../api/endpoints';
import {Icon} from '../../components/Icon';
import {colors, radius, spacing, type, fonts} from '../../theme/tokens';
import {Avatar, Reveal, StackHeader, TabHeader, font} from './shared';

const doodles = require('../../assets/patterns/chat-doodles.png');

export type Thread = {id: string; name: string; initials: string; last: string; time: string; unread: boolean};
type Message = {from: 'them' | 'me'; text: string};

const clock = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay ? d.toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'}) : d.toLocaleDateString('en-GB', {day: 'numeric', month: 'short'});
};

export function MessagesScreen({onOpen, onNotifications}: {onOpen: (t: Thread) => void; onNotifications: () => void}) {
  const [query, setQuery] = useState('');
  const [threads, setThreads] = useState<Thread[] | null>(null);
  const [error, setError] = useState('');
  const load = useCallback(() => {
    setError('');
    messagesApi.conversations().then(p => setThreads(p.data.map(c => ({id: c.id, name: c.counterpart.fullName, initials: c.counterpart.initials, last: c.lastMessage?.text ?? 'No messages yet', time: clock(c.lastMessage?.sentAt ?? c.updatedAt), unread: c.unread}))), e => setError(e instanceof Error ? e.message : 'Could not load your messages.'));
  }, []);
  useEffect(load, [load]);
  const rows = useMemo(() => (threads ?? []).filter(t => t.name.toLowerCase().includes(query.trim().toLowerCase())), [threads, query]);
  return <View style={styles.screen}>
    <TabHeader title="Messages" onBell={onNotifications} />
    <Reveal style={styles.search}><SearchField value={query} onChangeText={setQuery} placeholder="Search messages" /></Reveal>
    <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {!threads && (error ? <Pressable onPress={load} accessibilityRole="button"><Text style={[font, styles.empty]}>{error} Tap to try again.</Text></Pressable> : <ActivityIndicator color={colors.blue700} style={{marginTop: 24}} />)}
      {rows.map((t, i) => <Reveal key={t.id} order={i + 1}>
        <Pressable onPress={() => onOpen(t)} style={({pressed}) => [styles.row, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel={`${t.name}${t.unread ? ', unread' : ''}`}>
          <Avatar initials={t.initials} size={48} />
          <View style={styles.copy}>
            <Text style={[font, styles.name, t.unread && styles.bold]} numberOfLines={1}>{t.name}</Text>
            <Text style={[font, styles.last, t.unread && styles.lastUnread]} numberOfLines={1}>{t.last}</Text>
          </View>
          <View style={styles.meta}>
            <Text style={[font, styles.time]}>{t.time}</Text>
            {t.unread && <View style={styles.dot} />}
          </View>
        </Pressable>
      </Reveal>)}
      {threads && rows.length === 0 && <Text style={[font, styles.empty]}>{query ? `No conversations match “${query}”.` : 'No messages yet. Learners can message you from your courses.'}</Text>}
    </ScrollView>
  </View>;
}

/** A bubble that springs up from its own side as it arrives. */
function Bubble({message, delay}: {message: Message; delay: number}) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(t, {toValue: 1, duration: 380, delay, easing: Easing.bezier(0.16, 1, 0.3, 1), useNativeDriver: true}).start(); }, [delay, t]);
  const me = message.from === 'me';
  return <Animated.View style={[styles.bubbleRow, me && styles.bubbleRowMe, {opacity: t, transform: [
    {translateY: t.interpolate({inputRange: [0, 1], outputRange: [12, 0]})},
    {scale: t.interpolate({inputRange: [0, 1], outputRange: [0.92, 1]})},
  ]}]}>
    <View style={[styles.bubble, me ? styles.bubbleMe : styles.bubbleThem]}>
      <Text style={[font, styles.bubbleText, me && styles.bubbleTextMe]}>{message.text}</Text>
    </View>
  </Animated.View>;
}

export function ConversationScreen({thread, onBack}: {thread: Thread; onBack: () => void}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [ready, setReady] = useState(false);
  const [draft, setDraft] = useState('');
  const initial = useRef(0).current;
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
  useEffect(() => {
    messagesApi.messages(thread.id).then(p => { setMessages([...p.data].reverse().map(m => ({from: m.isMine ? 'me' : 'them', text: m.text}))); setReady(true); messagesApi.markRead(thread.id).catch(() => undefined); }, () => setReady(true));
  }, [thread.id]);
  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages(list => [...list, {from: 'me', text}]);
    setDraft('');
    messagesApi.send(thread.id, text).catch(() => { setMessages(list => list.slice(0, -1)); setDraft(text); });
  };
  return <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Image source={doodles} resizeMode="cover" blurRadius={0.6} style={styles.doodles} />
    </View>
    <StackHeader title={thread.name} onBack={onBack} right={<Icon name="more" size={22} color={colors.ink} />} />
    <ScrollView ref={scroll} contentContainerStyle={styles.thread} showsVerticalScrollIndicator={false} onContentSizeChange={() => scroll.current?.scrollToEnd({animated: true})}>
      {!ready && <ActivityIndicator color={colors.blue700} style={{marginTop: 24}} />}
      {ready && messages.length === 0 && <Text style={[font, styles.empty]}>No messages yet. Say hello.</Text>}
      {messages.map((m, i) => <Bubble key={i} message={m} delay={i < initial ? 100 + i * 90 : 0} />)}
    </ScrollView>
    <View style={styles.composer}>
      <TextInput value={draft} onChangeText={setDraft} placeholder="Write a message" placeholderTextColor={colors.muted} onSubmitEditing={send} returnKeyType="send" style={[font, styles.input]} />
      <Pressable onPress={send} disabled={!draft.trim()} style={({pressed}) => [styles.send, !draft.trim() && styles.dim, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel="Send message">
        <Icon name="send" size={20} color={colors.white} />
      </Pressable>
    </View>
  </KeyboardAvoidingView>;
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.cream},
  search: {paddingHorizontal: spacing.screen, marginBottom: 8},
  list: {paddingHorizontal: spacing.screen, paddingBottom: 24},
  row: {flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 76, borderBottomWidth: 1, borderBottomColor: colors.line},
  pressed: {opacity: 0.7},
  copy: {flex: 1},
  name: {fontSize: type.label, color: colors.ink, fontFamily: fonts.semibold},
  bold: {fontFamily: fonts.bold},
  last: {fontSize: type.small, color: colors.muted, marginTop: 4},
  lastUnread: {color: colors.ink, fontFamily: fonts.semibold},
  meta: {alignItems: 'flex-end', gap: 8},
  time: {fontSize: type.caption, color: colors.muted},
  dot: {width: 10, height: 10, borderRadius: 5, backgroundColor: colors.blue700},
  empty: {fontSize: type.small, color: colors.muted, textAlign: 'center', marginTop: 32},
  // One tile drawn large, as in the design: about two and a half bubbles across the screen.
  doodles: {position: 'absolute', top: -60, left: -150, width: 920, height: 920, opacity: 0.22, mixBlendMode: 'multiply'},
  thread: {paddingHorizontal: spacing.screen, paddingTop: 4, paddingBottom: 16, gap: 14},
  bubbleRow: {flexDirection: 'row'},
  bubbleRowMe: {justifyContent: 'flex-end'},
  bubble: {maxWidth: '76%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16},
  bubbleThem: {backgroundColor: colors.sand},
  bubbleMe: {backgroundColor: colors.blue700},
  bubbleText: {fontSize: type.small, lineHeight: 21, color: colors.ink},
  bubbleTextMe: {color: colors.white},
  composer: {flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: spacing.screen, paddingTop: 14, paddingBottom: 18, backgroundColor: colors.sand},
  input: {flex: 1, height: 50, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.sandLine, backgroundColor: colors.cream, paddingHorizontal: 22, fontSize: type.body, color: colors.ink},
  send: {width: 50, height: 50, borderRadius: 25, backgroundColor: colors.blue700, alignItems: 'center', justifyContent: 'center'},
  dim: {backgroundColor: colors.sky},
});
