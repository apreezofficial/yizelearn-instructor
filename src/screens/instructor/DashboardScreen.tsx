import React from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {ProgressBar} from '../../components/Chalkboard';
import {Icon} from '../../components/Icon';
import {dashboard} from '../../data/instructor';
import {colors, radius, spacing, type} from '../../theme/tokens';
import {Avatar, font, Pill, SectionTitle, TabHeader} from './shared';

type Props = {onGrading: () => void; onNotifications: () => void; onGradeItem: () => void};

export function DashboardScreen({onGrading, onNotifications, onGradeItem}: Props) {
  const max = Math.max(...dashboard.engagement.map(d => d.value));
  return <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <TabHeader title="Dashboard" onBell={onNotifications} />

    <View style={styles.hero}>
      <Text style={[styles.heroLabel, font]}>Active learners</Text>
      <Text style={[styles.heroValue, font]}>{dashboard.activeLearners.toLocaleString('en-US')}</Text>
      <View style={styles.heroPill}><Text style={[styles.heroPillText, font]}>{dashboard.activeChange}</Text></View>
    </View>

    <View style={styles.pair}>
      <View style={styles.stat}>
        <View style={styles.statHead}><Icon name="bank" size={18} color={colors.blue700} /><Text style={[styles.statLabel, font]}>Completion</Text></View>
        <Text style={[styles.statValue, font]}>{dashboard.completion}%</Text>
        <Text style={[styles.statNote, font]}>{dashboard.completionChange}</Text>
      </View>
      <View style={styles.stat}>
        <View style={styles.statHead}><Icon name="award" size={18} color={colors.blue700} /><Text style={[styles.statLabel, font]}>To grade</Text></View>
        <Text style={[styles.statValue, font]}>{dashboard.toGrade}</Text>
        <Text style={[styles.statNote, styles.overdue, font]}>{dashboard.overdue} overdue</Text>
      </View>
    </View>

    <View style={styles.chart}>
      <View style={styles.chartHead}>
        <Text style={[styles.statLabel, font]}>Engagement</Text>
        <Text style={[styles.statNote, font]}>7 days</Text>
      </View>
      <View style={styles.bars}>
        {dashboard.engagement.map((d, i) => {
          const top = d.value === max;
          return <View key={i} style={styles.barCol}>
            {top && <View style={styles.barBubble}><Text style={[styles.barBubbleText, font]}>{d.value}</Text></View>}
            <View style={[styles.bar, {height: (d.value / max) * 96}, top && styles.barTop]} />
            <Text style={[styles.barDay, font]}>{d.day}</Text>
          </View>;
        })}
      </View>
    </View>

    <SectionTitle title="To grade" action="See all" onAction={onGrading} />
    {dashboard.pendingGrades.map(g => <Pressable key={g.id} onPress={onGradeItem} style={({pressed}) => [styles.row, pressed && styles.pressed]} accessibilityRole="button">
      <Avatar initials={g.learner.split(' ').map(p => p[0]).join('')} size={44} />
      <View style={styles.rowCopy}>
        <Text style={[styles.rowTitle, font]}>{g.title}</Text>
        <Text style={[styles.rowMeta, font]}>{g.learner}, {g.time}</Text>
      </View>
      <Pill label="Pending" tone="amber" />
    </Pressable>)}
  </ScrollView>;
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.cream},
  content: {paddingBottom: 28},
  hero: {marginHorizontal: spacing.screen, backgroundColor: colors.blue900, borderRadius: 22, padding: 22, marginBottom: 14},
  heroLabel: {fontSize: type.small, color: colors.white, opacity: 0.85},
  heroValue: {fontSize: 44, color: colors.white, fontWeight: '800', marginVertical: 6},
  heroPill: {alignSelf: 'flex-start', backgroundColor: colors.star, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6},
  heroPillText: {fontSize: type.caption, color: colors.ink, fontWeight: '700'},
  pair: {flexDirection: 'row', gap: 12, paddingHorizontal: spacing.screen, marginBottom: 14},
  stat: {flex: 1, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.card, padding: 16},
  statHead: {flexDirection: 'row', alignItems: 'center', gap: 8},
  statLabel: {fontSize: type.small, color: colors.ink, fontWeight: '700'},
  statValue: {fontSize: type.display, color: colors.ink, fontWeight: '800', marginTop: 10},
  statNote: {fontSize: type.caption, color: colors.muted, marginTop: 4},
  overdue: {color: colors.danger, fontWeight: '700'},
  chart: {marginHorizontal: spacing.screen, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.card, padding: 16},
  chartHead: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  bars: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 150, marginTop: 14},
  barCol: {alignItems: 'center', flex: 1, gap: 6, justifyContent: 'flex-end'},
  bar: {width: 18, borderRadius: 6, backgroundColor: colors.blue100},
  barTop: {backgroundColor: colors.blue700},
  barBubble: {backgroundColor: colors.blue900, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 2},
  barBubbleText: {fontSize: type.tab, color: colors.white, fontWeight: '700'},
  barDay: {fontSize: type.caption, color: colors.muted},
  row: {flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: spacing.screen, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.card, padding: 14, marginBottom: 10},
  rowCopy: {flex: 1},
  rowTitle: {fontSize: type.label, color: colors.ink, fontWeight: '800'},
  rowMeta: {fontSize: type.caption, color: colors.muted, marginTop: 3},
  pressed: {opacity: 0.8},
});
