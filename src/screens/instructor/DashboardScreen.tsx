import React, {useEffect, useRef, useState} from 'react';
import {Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {dashboard} from '../../data/instructor';
import {colors, radius, spacing, type} from '../../theme/tokens';
import {Avatar, font, IconBadge, Pill, Reveal, Row, SectionTitle, TabHeader} from './shared';

type Props = {onGrading: () => void; onNotifications: () => void; onGradeItem: () => void};

const outExpo = Easing.bezier(0.16, 1, 0.3, 1);
const BAR_MAX = 72;
const BAR_MIN = 24;

/** Counts up from zero to `value` when it first appears. */
function CountUp({value, style, suffix = ''}: {value: number; style: object; suffix?: string}) {
  const n = useRef(new Animated.Value(0)).current;
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const id = n.addListener(({value: v}) => setShown(Math.round(v)));
    Animated.timing(n, {toValue: value, duration: 1100, delay: 200, easing: outExpo, useNativeDriver: false}).start();
    return () => n.removeListener(id);
  }, [n, value]);
  return <Text style={style}>{shown.toLocaleString('en-US')}{suffix}</Text>;
}

/** A circle on the hero card that drifts up and down on a slow loop. */
export function Drift({style, range, duration}: {style: object; range: number; duration: number}) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(t, {toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true}),
      Animated.timing(t, {toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true}),
    ]));
    loop.start();
    return () => loop.stop();
  }, [duration, t]);
  return <Animated.View style={[style, {transform: [{translateY: t.interpolate({inputRange: [0, 1], outputRange: [0, range]})}]}]} />;
}

/** Engagement chart: bars grow in one after another; tap a bar to see its count. */
function EngagementChart() {
  const data = dashboard.engagement;
  const max = Math.max(...data.map(d => d.value));
  const [selected, setSelected] = useState(data.findIndex(d => d.value === max));
  const grow = useRef(data.map(() => new Animated.Value(0))).current;
  const active = useRef(data.map((_, i) => new Animated.Value(i === selected ? 1 : 0))).current;
  const bubble = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(70, grow.map(g => Animated.spring(g, {toValue: 1, friction: 6, tension: 60, useNativeDriver: false}))).start(() => {
      Animated.spring(bubble, {toValue: 1, friction: 5, tension: 120, useNativeDriver: true}).start();
    });
  }, [bubble, grow]);

  const select = (i: number) => {
    if (i === selected) return;
    setSelected(i);
    active.forEach((a, j) => Animated.timing(a, {toValue: j === i ? 1 : 0, duration: 260, easing: outExpo, useNativeDriver: false}).start());
    bubble.setValue(0);
    Animated.spring(bubble, {toValue: 1, friction: 5, tension: 140, useNativeDriver: true}).start();
  };

  return <View style={styles.bars}>
    {data.map((d, i) => {
      const target = Math.max(BAR_MIN, (d.value / max) * BAR_MAX);
      return <Pressable key={i} onPress={() => select(i)} style={styles.barCol} accessibilityRole="button" accessibilityLabel={`${d.day}: ${d.value} active learners`} accessibilityState={{selected: i === selected}}>
        {i === selected && <Animated.View style={[styles.barBubble, {opacity: bubble, transform: [{scale: bubble.interpolate({inputRange: [0, 1], outputRange: [0.6, 1]})}, {translateY: bubble.interpolate({inputRange: [0, 1], outputRange: [6, 0]})}]}]}>
          <Text style={[styles.barBubbleText, font]}>{d.value}</Text>
        </Animated.View>}
        <Animated.View style={[styles.bar, {
          height: grow[i].interpolate({inputRange: [0, 1], outputRange: [0, target]}),
          backgroundColor: active[i].interpolate({inputRange: [0, 1], outputRange: ['#C6DAF2', colors.blue700]}),
        }]} />
        <Text style={[styles.barDay, font, i === selected && styles.barDayOn]}>{d.day}</Text>
      </Pressable>;
    })}
  </View>;
}

export function DashboardScreen({onGrading, onNotifications, onGradeItem}: Props) {
  return <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <TabHeader title="Home" onBell={onNotifications} />

    <Reveal order={0} style={styles.hero}>
      <Drift style={styles.heroBig} range={8} duration={3200} />
      <Drift style={styles.heroSmall} range={-6} duration={2600} />
      <Drift style={styles.heroDot} range={5} duration={2000} />
      <Text style={[styles.heroLabel, font]}>Active learners</Text>
      <CountUp value={dashboard.activeLearners} style={[styles.heroValue, font]} />
      <View style={styles.heroPill}><Text style={[styles.heroPillText, font]}>{dashboard.activeChange}</Text></View>
    </Reveal>

    <View style={styles.pair}>
      <Reveal order={1} style={styles.stat}>
        <View style={styles.statHead}><IconBadge name="chart" size={34} /><Text style={[styles.statLabel, font]}>Completion</Text></View>
        <View style={styles.statFoot}>
          <CountUp value={dashboard.completion} suffix="%" style={[styles.statValue, font]} />
          <Text style={[styles.statNote, font]}>{dashboard.completionChange}</Text>
        </View>
      </Reveal>
      <Reveal order={2} style={styles.stat}>
        <View style={styles.statHead}><IconBadge name="award" size={34} /><Text style={[styles.statLabel, font]}>To grade</Text></View>
        <View style={styles.statFoot}>
          <CountUp value={dashboard.toGrade} style={[styles.statValue, font]} />
          <Text style={[styles.statNote, font]}>{dashboard.overdue} overdue</Text>
        </View>
      </Reveal>
    </View>

    <Reveal order={3} style={styles.chart}>
      <View style={styles.chartHead}>
        <Text style={[styles.chartTitle, font]}>Engagement</Text>
        <Text style={[styles.chartRange, font]}>7 days</Text>
      </View>
      <EngagementChart />
    </Reveal>

    <View style={styles.list}>
      <SectionTitle title="To grade" action="See all" onAction={onGrading} />
      {dashboard.pendingGrades.map((g, i) => <Row key={g.id} order={4 + i} onPress={onGradeItem}
        leading={<Avatar initials="A1" size={44} />} title={g.title} meta={`${g.learner}, ${g.time}`}
        trailing={<Pill label="Pending" tone="amber" />} />)}
    </View>
  </ScrollView>;
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.cream},
  content: {paddingBottom: 28},
  hero: {marginHorizontal: spacing.screen, backgroundColor: colors.blue900, borderRadius: 20, padding: 20, marginBottom: 12, overflow: 'hidden'},
  heroBig: {position: 'absolute', right: 24, top: 6, width: 104, height: 104, borderRadius: 52, backgroundColor: colors.navy},
  heroSmall: {position: 'absolute', right: 14, top: 84, width: 44, height: 44, borderRadius: 22, backgroundColor: colors.blue700},
  heroDot: {position: 'absolute', right: 94, top: 112, width: 18, height: 18, borderRadius: 9, backgroundColor: colors.marigold},
  heroLabel: {fontSize: type.small, color: colors.white, opacity: 0.85},
  heroValue: {fontSize: 40, color: colors.white, fontWeight: '800', marginVertical: 8, fontVariant: ['tabular-nums']},
  heroPill: {alignSelf: 'flex-start', backgroundColor: colors.sand, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 6},
  heroPillText: {fontSize: type.caption, color: colors.ink, fontWeight: '700'},
  pair: {flexDirection: 'row', gap: 10, paddingHorizontal: spacing.screen, marginBottom: 12},
  stat: {flex: 1, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.card, padding: 14},
  statHead: {flexDirection: 'row', alignItems: 'center', gap: 10},
  statLabel: {fontSize: type.small, color: colors.muted},
  statFoot: {flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 12},
  statValue: {fontSize: type.title, color: colors.ink, fontWeight: '800', fontVariant: ['tabular-nums']},
  statNote: {fontSize: type.caption, color: colors.success, fontWeight: '700', marginBottom: 4},
  chart: {marginHorizontal: spacing.screen, backgroundColor: colors.barBg, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.card, padding: 16},
  chartHead: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  chartTitle: {fontSize: type.label, color: colors.ink, fontWeight: '800'},
  chartRange: {fontSize: type.caption, color: colors.muted},
  bars: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 130, marginTop: 6},
  barCol: {alignItems: 'center', flex: 1, gap: 6, justifyContent: 'flex-end', height: '100%'},
  bar: {width: 30, borderRadius: 5},
  barBubble: {backgroundColor: colors.ink, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 3},
  barBubbleText: {fontSize: type.tab, color: colors.white, fontWeight: '700'},
  barDay: {fontSize: type.tab, color: colors.muted},
  barDayOn: {color: colors.ink, fontWeight: '800'},
  list: {paddingHorizontal: spacing.screen},
});
