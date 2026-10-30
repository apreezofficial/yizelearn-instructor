import React, {useEffect, useRef} from 'react';
import {Animated, Easing, Pressable, StyleSheet, Text, TextInput, type TextInputProps, View, type ViewStyle} from 'react-native';
import {Icon, type IconName} from '../../components/Icon';
import {colors, fonts, radius, spacing, type} from '../../theme/tokens';
import {instructorInitials} from '../../data/instructor';

export const font = {fontFamily: fonts.family};

/** Top bar for tab screens, as in the Figma: title with a marigold underline, plain bell with an unread dot, and the avatar. */
export function TabHeader({title, onBell}: {title: string; onBell?: () => void}) {
  return <View style={styles.header}>
    <View>
      <Text style={[styles.headerTitle, font]}>{title}</Text>
      <View style={styles.underline} />
    </View>
    <View style={styles.headerRight}>
      <Pressable onPress={onBell} hitSlop={10} style={styles.bell} accessibilityRole="button" accessibilityLabel="Notifications">
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

/** Light blue icon badge used on list rows, stat cards and file cards. */
export function IconBadge({name, size = 44, square}: {name: IconName; size?: number; square?: boolean}) {
  return <View style={[styles.badge, {width: size, height: size, borderRadius: square ? 10 : size / 2}]}><Icon name={name} size={size * 0.45} color={colors.blue700} /></View>;
}

export type Tone = 'blue' | 'green' | 'amber' | 'red' | 'grey';
const tones: Record<Tone, {bg: string; text: string}> = {
  blue: {bg: colors.blue100, text: colors.blue900},
  green: {bg: '#E2F2EA', text: '#2E7D5B'},
  amber: {bg: '#FBEFD6', text: '#93650F'},
  red: {bg: '#FBE1E1', text: colors.danger},
  grey: {bg: colors.sand, text: colors.ink},
};
export function Pill({label, tone = 'grey'}: {label: string; tone?: Tone}) {
  return <View style={[styles.pill, {backgroundColor: tones[tone].bg}]}><Text style={[styles.pillText, font, {color: tones[tone].text}]}>{label}</Text></View>;
}

export function Segments<T extends string>({items, active, onSelect}: {items: readonly T[]; active: T; onSelect: (item: T) => void}) {
  return <View style={styles.segments}>{items.map(item => <Pressable key={item} onPress={() => onSelect(item)} style={[styles.segment, active === item && styles.segmentOn]} accessibilityRole="tab" accessibilityState={{selected: active === item}}>
    <Text style={[styles.segmentText, font, active === item && styles.segmentTextOn]}>{item}</Text>
  </Pressable>)}</View>;
}

export function Field({label, ...input}: Pick<TextInputProps, 'value' | 'onChangeText' | 'placeholder' | 'keyboardType' | 'multiline' | 'defaultValue'> & {label: string}) {
  return <View style={styles.field}>
    <Text style={[styles.label, font]}>{label}</Text>
    <TextInput {...input} placeholderTextColor={colors.muted} style={[styles.input, font, input.multiline && styles.multiline]} />
  </View>;
}

/** A field that opens a picker: value on the left, chevron on the right. */
export function SelectField({label, value, onPress}: {label: string; value: string; onPress?: () => void}) {
  return <View style={styles.field}>
    <Text style={[styles.label, font]}>{label}</Text>
    <Pressable onPress={onPress} style={[styles.input, styles.select]} accessibilityRole="button" accessibilityLabel={`${label}, ${value}`}>
      <Text style={[styles.selectText, font]}>{value}</Text>
      <Icon name="down" size={20} color={colors.ink} />
    </Pressable>
  </View>;
}

/** Fades and lifts its content in, `order` steps of 60ms after mount, so lists and cards arrive in sequence. */
export function Reveal({children, order = 0, style}: {children: React.ReactNode; order?: number; style?: ViewStyle}) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(t, {toValue: 1, duration: 520, delay: 80 + order * 60, easing: Easing.bezier(0.16, 1, 0.3, 1), useNativeDriver: true}).start(); }, [order, t]);
  return <Animated.View style={[style, {opacity: t, transform: [{translateY: t.interpolate({inputRange: [0, 1], outputRange: [14, 0]})}]}]}>{children}</Animated.View>;
}

/** Flat list row with a divider, the list style used across the instructor designs. */
export function Row({leading, title, meta, trailing, onPress, order = 0}: {leading: React.ReactNode; title: string; meta: string; trailing?: React.ReactNode; onPress?: () => void; order?: number}) {
  return <Reveal order={order}><Pressable onPress={onPress} disabled={!onPress} style={({pressed}) => [styles.row, pressed && styles.pressed]} accessibilityRole={onPress ? 'button' : undefined}>
    {leading}
    <View style={styles.rowCopy}>
      <Text style={[styles.rowTitle, font]}>{title}</Text>
      <Text style={[styles.rowMeta, font]}>{meta}</Text>
    </View>
    {trailing}
  </Pressable></Reveal>;
}

export function SectionTitle({title, action, onAction, note}: {title: string; action?: string; onAction?: () => void; note?: string}) {
  return <View style={styles.sectionRow}>
    <Text style={[styles.section, font]}>{title}</Text>
    {action && <Pressable onPress={onAction} hitSlop={8}><Text style={[styles.link, font]}>{action}</Text></Pressable>}
    {note && <Text style={[styles.note, font]}>{note}</Text>}
  </View>;
}

/** Full-width action at the bottom of a pushed screen. */
export function Footer({label, onPress, disabled}: {label: string; onPress: () => void; disabled?: boolean}) {
  return <View style={styles.footer}>
    <Pressable onPress={onPress} disabled={disabled} style={({pressed}) => [styles.button, disabled && styles.disabled, pressed && styles.pressed]} accessibilityRole="button" accessibilityState={{disabled}}>
      <Text style={[styles.buttonText, font]}>{label}</Text>
    </Pressable>
  </View>;
}

const styles = StyleSheet.create({
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.screen, paddingTop: 16, paddingBottom: 18},
  headerTitle: {fontSize: type.title + 2, color: colors.ink, fontWeight: '800'},
  underline: {width: 34, height: 4, borderRadius: 2, backgroundColor: colors.marigold, marginTop: 6},
  headerRight: {flexDirection: 'row', alignItems: 'center', gap: 14},
  bell: {width: 32, height: 32, alignItems: 'center', justifyContent: 'center'},
  unread: {position: 'absolute', top: 2, right: 2, width: 9, height: 9, borderRadius: 5, backgroundColor: colors.danger},
  avatar: {width: 38, height: 38, borderRadius: 19, backgroundColor: colors.blue100, alignItems: 'center', justifyContent: 'center'},
  avatarText: {fontSize: type.tab, color: colors.blue900, fontWeight: '800'},
  stack: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingTop: 8, paddingBottom: 12},
  back: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center'},
  stackTitle: {flex: 1, fontSize: type.subheading, color: colors.ink, fontWeight: '800', textAlign: 'center'},
  stackRight: {minWidth: 44, alignItems: 'center'},
  circle: {backgroundColor: colors.blue100, alignItems: 'center', justifyContent: 'center'},
  circleText: {color: colors.blue900, fontWeight: '800'},
  badge: {backgroundColor: colors.blue100, alignItems: 'center', justifyContent: 'center'},
  pill: {alignSelf: 'center', paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.pill},
  pillText: {fontSize: type.tab, fontWeight: '700'},
  segments: {flexDirection: 'row', gap: 8, paddingHorizontal: spacing.screen, marginBottom: 8},
  segment: {height: 36, paddingHorizontal: 16, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.sandLine, backgroundColor: colors.white, justifyContent: 'center'},
  segmentOn: {backgroundColor: colors.blue700, borderColor: colors.blue700},
  segmentText: {fontSize: type.small, color: colors.ink, fontWeight: '600'},
  segmentTextOn: {color: colors.white, fontWeight: '700'},
  field: {marginBottom: 14},
  label: {fontSize: type.caption, color: colors.ink, fontWeight: '700', marginBottom: 6},
  input: {minHeight: 52, borderRadius: radius.field, borderWidth: 1, borderColor: colors.sandLine, backgroundColor: colors.white, paddingHorizontal: 16, fontSize: type.body, color: colors.ink},
  multiline: {minHeight: 110, paddingTop: 14, textAlignVertical: 'top'},
  select: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  selectText: {fontSize: type.body, color: colors.ink},
  row: {flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 72, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.line},
  rowCopy: {flex: 1},
  rowTitle: {fontSize: type.label, color: colors.ink, fontWeight: '800'},
  rowMeta: {fontSize: type.caption, color: colors.muted, marginTop: 3},
  pressed: {opacity: 0.75},
  sectionRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 22, marginBottom: 6},
  section: {fontSize: type.heading, color: colors.ink, fontWeight: '800'},
  link: {fontSize: type.label, color: colors.blue700, fontWeight: '700'},
  note: {fontSize: type.caption, color: colors.muted},
  footer: {paddingHorizontal: spacing.screen, paddingTop: 10, paddingBottom: 12, backgroundColor: colors.cream},
  button: {height: spacing.button, borderRadius: radius.button, backgroundColor: colors.sky, alignItems: 'center', justifyContent: 'center'},
  disabled: {opacity: 0.6},
  buttonText: {fontSize: type.body, color: colors.white, fontWeight: '700'},
});
