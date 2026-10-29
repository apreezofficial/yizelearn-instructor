# yizelearn Instructor

Instructor app for yizelearn. Same stack as the learner app: React Native 0.88, TypeScript, Hugeicons,
react-native-safe-area-context, react-native-svg, and the Android release APK workflow in `.github/workflows`.

Structure:
- `src/theme` colours, type and spacing tokens (same palette as the learner app)
- `src/components` shared UI (buttons, cards, icons, brand logos, progress bar)
- `src/api` API client and endpoints
- `src/screens/auth` sign-in with email code
- `src/screens/instructor` instructor screens, added as designs arrive

Run: `npm install` then `npm run android`.
