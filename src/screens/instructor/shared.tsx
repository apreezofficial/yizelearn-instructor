import React from 'react';
import {Pressable, StyleSheet, Text, TextInput, type TextInputProps, View} from 'react-native';
import {Icon} from '../../components/Icon';
import {colors, fonts, radius, spacing, type} from '../../theme/tokens';
import {instructorInitials} from '../../data/instructor';

export const font = {fontFamily: fonts.family};

/** Top bar for tab screens: title on the left, bell with unread dot and the instructor's avatar on the right. */
export function TabHeader({title, onBell}: {title: string; onBell?: () => void}) {
  return <View style={styles.header}>
    <Text style={[styles.headerTitle, font]}>{title}</Text>
    <View style={styles.headerRight}>
      <Pressable onPress={onBell} hitSlop={8} style={styles.bell} accessibilityRole="button" accessibilityLabel="Notifications">
        <Icon name="bell" size={22} color={colors.ink} />
        <View style={styles.unread} />
      </Pressable>
      <View style={styles.avatar}><Text style={[styles.avatarText, font]}>{instructorInitials}</Text></View>
    </View>
  </View>;
}

/** Top bar for pushed screens: back chevron, centred title, optional action on the right. */
export function StackHeader({title, onBack, right}: {title: string; onBack: () => void; right?: React.ReactNode}) {
  return <View style={styles.stack}>
    <Pressable onPress={onBack} hitSlop={10} style={styles.back} accessibilityRole="button" accessibilityLabel="Back">
      <Icon name="back" size={22} color={colors.ink} />
    </Pressable>
    <Text style={[styles.stackTitle, font]} numberOfLines={1}>{title}</Text>
    <View style={styles.stackRight}>{right}</View>
  </View>;
}

export function Avatar({initials, size = 44}: {initials: string; size?: number}) {
  return <View style={[styles.circle, {width: size, height: size, borderRadius: size / 2}]}>
    <Text style={[styles.circleText, font, {fontSize: size * 0.3}]}>{initials}</Text>
  </View>;
}

export type Tone = 'blue' | 'green' | 'amber' | 'red' | 'grey';
const tones: Record<Tone, {bg: string; text: string}> = {
  blue: {bg: colors.blue100, text: colors.blue900},
  green: {bg: '#D7EEE3', text: colors.ink},
  amber: {bg: '#FBEBC8', text: colors.ink},
  red: {bg: '#F6DADA', text: colors.danger},
  grey: {bg: colors.sand, text: colors.muted},
};
export function Pill({label, tone = 'grey'}: {label: string; tone?: Tone}) {
  return <View style={[styles.pill, {backgroundColor: tones[tone].bg}]}><Text style={[styles.pillText, font, {color: tones[tone].text}]}>{label}</Text></View>;
}

export function Segments<T extends string>({items, active, onSelect}: {items: readonly T[]; active: T; onSelect: (item: T) => void}) {
  return <View style={styles.segments}>{items.map(item => <Pressable key={item} onPress={() => onSelect(item)} style={[styles.segment, active === item && styles.segmentOn]} accessibilityRole="tab" accessibilityState={{selected: active === item}}>
    <Text style={[styles.segmentText, font, active === item && styles.segmentTextOn]}>{item}</Text>
  </Pressable>)}</View>;
}

export function Field({label, ...input}: Pick<TextInputProps, 'value' | 'onChangeText' | 'placeholder' | 'keyboardType' | 'multiline'> & {label: string}) {
  return <View style={styles.field}>
    <Text style={[styles.label, font]}>{label}</Text>
    <TextInput {...input} placeholderTextColor={colors.muted} style={[styles.input, font, input.multiline && styles.multiline]} />
  </View>;
}

export function SectionTitle({title, action, onAction}: {title: string; action?: string; onAction?: () => void}) {
  return <View style={styles.sectionRow}>
    <Text style={[styles.section, font]}>{title}</Text>
    {action && <Pressable onPress={onAction} hitSlop={8}><Text style={[styles.link, font]}>{action}</Text></Pressable>}
  </View>;
}

const styles = StyleSheet.create({
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.screen, paddingTop: 12, paddingBottom: 12},
  headerTitle: {fontSize: type.display, color: colors.ink, fontWeight: '800'},
  headerRight: {flexDirection: 'row', alignItems: 'center', gap: 12},
  bell: {width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine},
  unread: {position: 'absolute', top: 10, right: 11, width: 9, height: 9, borderRadius: 5, backgroundColor: colors.danger, borderWidth: 1.5, borderColor: colors.white},
  avatar: {width: 44, height: 44, borderRadius: 22, backgroundColor: colors.blue100, alignItems: 'center', justifyContent: 'center'},
  avatarText: {fontSize: type.caption, color: colors.blue900, fontWeight: '800'},
  stack: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingTop: 8, paddingBottom: 10},
  back: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center'},
  stackTitle: {flex: 1, fontSize: type.heading, color: colors.ink, fontWeight: '800', textAlign: 'center'},
  stackRight: {minWidth: 44, alignItems: 'flex-end'},
  circle: {backgroundColor: colors.blue100, alignItems: 'center', justifyContent: 'center'},
  circleText: {color: colors.blue900, fontWeight: '800'},
  pill: {alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill},
  pillText: {fontSize: type.caption, fontWeight: '700'},
  segments: {flexDirection: 'row', gap: 10, paddingHorizontal: spacing.screen, marginBottom: 16},
  segment: {height: 40, paddingHorizontal: 18, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.sandLine, backgroundColor: colors.white, justifyContent: 'center'},
  segmentOn: {backgroundColor: colors.sky, borderColor: colors.sky},
  segmentText: {fontSize: type.small, color: colors.ink, fontWeight: '600'},
  segmentTextOn: {color: colors.onSky, fontWeight: '800'},
  field: {marginBottom: 16},
  label: {fontSize: type.small, color: colors.ink, fontWeight: '700', marginBottom: 8},
  input: {minHeight: 52, borderRadius: radius.field, borderWidth: 1, borderColor: colors.sandLine, backgroundColor: colors.white, paddingHorizontal: 16, fontSize: type.body, color: colors.ink},
  multiline: {minHeight: 110, paddingTop: 14, textAlignVertical: 'top'},
  sectionRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 12},
  section: {fontSize: type.heading + 2, color: colors.ink, fontWeight: '800'},
  link: {fontSize: type.label, color: colors.blue700, fontWeight: '700'},
});
