import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Animated, Easing, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {SearchField} from '../../components/Catalog';
import {Icon} from '../../components/Icon';
import {colors, radius, spacing, type} from '../../theme/tokens';
import {Avatar, Reveal, StackHeader, TabHeader, font} from './shared';

const doodles = require('../../assets/patterns/chat-doodles.png');

export type Thread = {id: string; name: string; initials: string; last: string; time: string; unread: boolean};
type Message = {from: 'them' | 'me'; text: string};

export const threads: Thread[] = [
  {id: 't1', name: 'Sunday Nwachukwu', initials: 'SN', last: 'Yes, thank you. I will submit my dashboard tonight.', time: '9:41', unread: true},
  {id: 't2', name: 'Mercy Ibe', initials: 'MI', last: 'Is the VLOOKUP quiz timed?', time: '8:15', unread: true},
  {id: 't3', name: 'Chidi Okafor', initials: 'CO', last: 'Thanks for the feedback on my pivot table.', time: 'Yesterday', unread: false},
  {id: 't4', name: 'Amaka Eze', initials: 'AE', last: 'Can I get an extension on assignment 2?', time: 'Mon', unread: false},
  {id: 't5', name: 'Bola Adeyemi', initials: 'BA', last: 'See you at the live session.', time: 'Sun', unread: false},
];

const history: Record<string, Message[]> = {
  t1: [
    {from: 'me', text: 'Hi! Did the sample file open correctly for you?'},
    {from: 'them', text: 'Yes, thank you. I will submit my dashboard tonight.'},
    {from: 'me', text: 'Great, good luck!'},
  ],
  t2: [{from: 'them', text: 'Is the VLOOKUP quiz timed?'}],
};

export function MessagesScreen({onOpen, onNotifications}: {onOpen: (t: Thread) => void; onNotifications: () => void}) {
  const [query, setQuery] = useState('');
  const rows = useMemo(() => threads.filter(t => t.name.toLowerCase().includes(query.trim().toLowerCase())), [query]);
  return <View style={styles.screen}>
    <TabHeader title="Messages" onBell={onNotifications} />
    <Reveal style={styles.search}><SearchField value={query} onChangeText={setQuery} placeholder="Search messages" /></Reveal>
    <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {rows.map((t, i) => <Reveal key={t.id} order={i + 1}>
        <Pressable onPress={() => onOpen(t)} style={({pressed}) => [styles.row, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel={`${t.name}${t.unread ? ', unread' : ''}`}>
          <Avatar initials={t.initials} size={48} />
          <View style={styles.copy}>
            <Text style={[styles.name, font, t.unread && styles.bold]} numberOfLines={1}>{t.name}</Text>
            <Text style={[styles.last, font, t.unread && styles.lastUnread]} numberOfLines={1}>{t.last}</Text>
          </View>
          <View style={styles.meta}>
            <Text style={[styles.time, font]}>{t.time}</Text>
            {t.unread && <View style={styles.dot} />}
          </View>
        </Pressable>
      </Reveal>)}
      {rows.length === 0 && <Text style={[styles.empty, font]}>No conversations match “{query}”.</Text>}
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
      <Text style={[styles.bubbleText, font, me && styles.bubbleTextMe]}>{message.text}</Text>
    </View>
  </Animated.View>;
}

export function ConversationScreen({thread, onBack}: {thread: Thread; onBack: () => void}) {
  const [messages, setMessages] = useState<Message[]>(history[thread.id] ?? []);
  const [draft, setDraft] = useState('');
  const initial = useRef(messages.length).current;
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages(list => [...list, {from: 'me', text}]);
    setDraft('');
  };
  return <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Image source={doodles} resizeMode="cover" blurRadius={0.6} style={styles.doodles} />
    </View>
    <StackHeader title={thread.name} onBack={onBack} right={<Icon name="more" size={22} color={colors.ink} />} />
    <ScrollView ref={scroll} contentContainerStyle={styles.thread} showsVerticalScrollIndicator={false} onContentSizeChange={() => scroll.current?.scrollToEnd({animated: true})}>
      {messages.length === 0 && <Text style={[styles.empty, font]}>No messages yet. Say hello.</Text>}
      {messages.map((m, i) => <Bubble key={i} message={m} delay={i < initial ? 100 + i * 90 : 0} />)}
    </ScrollView>
    <View style={styles.composer}>
      <TextInput value={draft} onChangeText={setDraft} placeholder="Write a message" placeholderTextColor={colors.muted} onSubmitEditing={send} returnKeyType="send" style={[styles.input, font]} />
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
  name: {fontSize: type.label, color: colors.ink, fontWeight: '600'},
  bold: {fontWeight: '800'},
  last: {fontSize: type.small, color: colors.muted, marginTop: 4},
  lastUnread: {color: colors.ink, fontWeight: '600'},
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
