import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {SafeAreaProvider, SafeAreaView, initialWindowMetrics} from 'react-native-safe-area-context';
import {colors, fonts, type} from './src/theme/tokens';

// Instructor app shell. Screens are added here as designs arrive, following the same
// structure as the learner app: theme, components, api and screens/<area>.
export default function App() {
  return <SafeAreaProvider initialMetrics={initialWindowMetrics}>
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Text style={[styles.title, {fontFamily: fonts.family}]}>yizelearn Instructor</Text>
        <Text style={[styles.body, {fontFamily: fonts.family}]}>Screens are coming soon.</Text>
      </View>
    </SafeAreaView>
  </SafeAreaProvider>;
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.cream},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24},
  title: {fontSize: type.title, color: colors.ink, fontWeight: '800'},
  body: {fontSize: type.body, color: colors.muted, marginTop: 8},
});
