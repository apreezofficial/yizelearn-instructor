import React, {useState} from 'react';
import {BrandMark} from '../../components/BrandLogo';
import {ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, type TextInputProps, View} from 'react-native';
import {ApiError} from '../../api/client';
import {authApi} from '../../api/endpoints';
import type {User} from '../../api/types';
import {toUser} from '../../api/mappers';
import {RoundButton} from '../../components/Catalog';
import {AppleLogo, GoogleLogo} from '../../components/BrandLogos';
import {colors, fonts, radius, spacing, type} from '../../theme/tokens';

const font = {fontFamily: fonts.family};
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function describe(error: unknown) {
  return error instanceof ApiError ? error.message : 'Can\'t reach yizelearn right now. Check your connection and try again.';
}

// Google and Apple sign-in need provider keys from the developer accounts. Until those are set up, the buttons say so.
function notConnected(provider: string) {
  Alert.alert(provider, `${provider} sign-in is not connected yet. Use your email and password for now.`);
}

type LoginProps = {onBack?: () => void; onSignUp: () => void; onSignedIn: (user: User) => void};
export function LoginScreen({onBack, onSignUp, onSignedIn}: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [challenge, setChallenge] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const valid = EMAIL.test(email.trim()) && password.length >= 1;
  const ready = challenge ? code.length === 6 : valid;

  const submit = async () => {
    if (!ready || busy) return;
    setBusy(true);
    setError('');
    try {
      const result = challenge
        ? await authApi.mfaVerify(challenge, code.trim())
        : await authApi.logIn(email.trim(), password);
      if (result.status === 'two-step') { setChallenge(result.challengeToken); setCode(''); return; }
      const role = result.user.role;
      if (role !== 'instructor' && role !== 'administrator') {
        await authApi.logout();
        setError('This account is not an instructor account. Use the student app, or ask your admin for instructor access.');
        return;
      }
      onSignedIn(result.user);
    } catch (e) {
      setError(describe(e));
    } finally {
      setBusy(false);
    }
  };

  const forgot = async () => {
    if (!EMAIL.test(email.trim())) { setError('Enter your email above, then tap Forgot password.'); return; }
    try { await authApi.forgotPassword(email.trim()); Alert.alert('Check your email', 'If an account exists for that address, we have sent a link to reset your password.'); }
    catch (e) { setError(describe(e)); }
  };

  return <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
    {onBack && <View style={styles.backRow}><RoundButton icon="back" onPress={onBack} label="Back" /></View>}
    <BrandMark style={styles.logoImage} />
    <Text style={[font, styles.title]}>{challenge ? 'Enter your code' : 'Welcome back'}</Text>
    <Text style={[font, styles.subtitle]}>{challenge ? 'Open your authenticator app and enter the 6-digit code.' : 'Log in to manage your courses and students'}</Text>

    {!challenge && <>
      <Field label="Email" value={email} onChangeText={setEmail} placeholder="name@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" />
      <Field label="Password" value={password} onChangeText={setPassword} placeholder="Your password" secureTextEntry autoComplete="password" textContentType="password" />
      <Pressable onPress={forgot} hitSlop={8} accessibilityRole="button"><Text style={[font, styles.forgot]}>Forgot password?</Text></Pressable>
    </>}
    {challenge && <Field label="Code" value={code} onChangeText={v => setCode(v.replace(/\D/g, '').slice(0, 6))} placeholder="123456" keyboardType="number-pad" textContentType="oneTimeCode" />}
    {!!error && <Text style={[font, styles.error]}>{error}</Text>}
    <Primary label={challenge ? 'Verify' : 'Log in'} disabled={!ready} busy={busy} onPress={submit} />

    {!challenge && <>
      <Divider label="or continue with" />
      <View style={styles.social}>
        <SocialButton label="Google" logo={<GoogleLogo />} onPress={() => notConnected('Google')} />
        {Platform.OS === 'ios' && <SocialButton label="Apple" logo={<AppleLogo color={colors.ink} />} onPress={() => notConnected('Apple')} />}
      </View>
      <Text style={[font, styles.footer]}>New here? <Text onPress={onSignUp} style={styles.link}>How to get access</Text></Text>
    </>}
  </ScrollView>;
}

type FieldProps = Pick<TextInputProps, 'value' | 'onChangeText' | 'placeholder' | 'keyboardType' | 'autoCapitalize' | 'autoComplete' | 'textContentType' | 'secureTextEntry'> & {label: string};
function Field({label, ...input}: FieldProps) {
  return <View style={styles.field}>
    <Text style={[font, styles.label]}>{label}</Text>
    <TextInput {...input} placeholderTextColor={colors.muted} style={[font, styles.input]} />
  </View>;
}

function Primary({label, onPress, disabled, busy}: {label: string; onPress: () => void; disabled?: boolean; busy?: boolean}) {
  return <Pressable onPress={onPress} disabled={disabled || busy} accessibilityRole="button" accessibilityState={{disabled: disabled || busy, busy}}
    style={({pressed}) => [styles.primary, (disabled && !busy) && styles.dim, pressed && styles.pressed]}>
    {busy ? <ActivityIndicator color={colors.white} /> : <Text style={[font, styles.primaryText]}>{label}</Text>}
  </Pressable>;
}

function SocialButton({label, logo, onPress}: {label: string; logo: React.ReactNode; onPress: () => void}) {
  return <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Continue with ${label}`} style={({pressed}) => [styles.socialButton, pressed && styles.pressed]}>
    {logo}
    <Text style={[font, styles.socialText]}>{label}</Text>
  </Pressable>;
}

function Divider({label}: {label: string}) {
  return <View style={styles.divider}><View style={styles.rule} /><Text style={[font, styles.dividerText]}>{label}</Text><View style={styles.rule} /></View>;
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.cream},
  content: {flexGrow: 1, paddingHorizontal: spacing.screen, paddingTop: 8, paddingBottom: 32},
  backRow: {alignItems: 'flex-start', marginBottom: 4},
  logoImage: {width: 154, height: 48, alignSelf: 'center'},
  title: {fontSize: type.display - 2, color: colors.ink, fontFamily: fonts.display, textAlign: 'center'},
  subtitle: {fontSize: type.label, color: colors.muted, textAlign: 'center', marginTop: 8, marginBottom: 28, lineHeight: 22},
  field: {marginBottom: 18},
  label: {fontSize: type.small, color: colors.ink, fontFamily: fonts.bold, marginBottom: 8},
  input: {height: 58, borderRadius: radius.field, borderWidth: 1, borderColor: colors.sandLine, backgroundColor: colors.white, paddingHorizontal: 18, fontSize: type.body, color: colors.ink},
  error: {fontSize: type.caption, color: colors.danger, marginBottom: 10, textAlign: 'center'},
  primary: {height: spacing.button, borderRadius: radius.button, backgroundColor: colors.sky, alignItems: 'center', justifyContent: 'center', marginTop: 4},
  primaryText: {fontSize: type.subheading, color: colors.onSky, fontFamily: fonts.bold},
  dim: {opacity: 0.5},
  forgot: {fontSize: type.small, color: colors.blue700, fontFamily: fonts.bold, alignSelf: 'flex-end', marginTop: 4, marginBottom: 6},
  pressed: {opacity: 0.8},
  divider: {flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 26},
  rule: {flex: 1, height: 1, backgroundColor: colors.sandLine},
  dividerText: {fontSize: type.caption, color: colors.muted},
  social: {flexDirection: 'row', gap: 12},
  socialButton: {flex: 1, height: spacing.button, borderRadius: radius.button, borderWidth: 1, borderColor: colors.sandLine, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10},
  socialText: {fontSize: type.label, color: colors.ink, fontFamily: fonts.bold},
  sso: {height: spacing.button, borderRadius: radius.button, borderWidth: 1, borderColor: colors.sandLine, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', marginTop: 12},
  ssoText: {fontSize: type.label, color: colors.ink, fontFamily: fonts.bold},
  footer: {fontSize: type.label, color: colors.muted, textAlign: 'center', marginTop: 26},
  link: {color: colors.blue700, fontFamily: fonts.bold},
  check: {flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48, marginBottom: 8},
  box: {width: 26, height: 26, borderRadius: 7, borderWidth: 1.5, borderColor: colors.muted, alignItems: 'center', justifyContent: 'center'},
  boxOn: {backgroundColor: colors.sky, borderColor: colors.sky},
  checkText: {flex: 1, fontSize: type.label, color: colors.ink},
  codeWrap: {flex: 1, paddingHorizontal: spacing.screen, paddingTop: 24},
  emailText: {color: colors.ink, fontFamily: fonts.bold},
  codeRow: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, marginBottom: 24},
  codeBox: {width: 46, height: 58, borderRadius: radius.field, borderWidth: 1, borderColor: colors.sandLine, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center'},
  codeBoxActive: {borderColor: colors.sky, borderWidth: 2},
  codeDigit: {fontSize: type.heading, color: colors.ink, fontFamily: fonts.bold},
  hiddenInput: {position: 'absolute', width: 1, height: 1, opacity: 0},
  resend: {alignSelf: 'center', marginTop: 22, padding: 8},
  resendText: {fontSize: type.label, color: colors.blue700, fontFamily: fonts.bold},
  muted: {color: colors.muted},
  ssoArt: {width: 140, height: 130, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginTop: 8, marginBottom: 18},
  ssoOuter: {width: 108, height: 108, borderRadius: 54, backgroundColor: colors.blue50, alignItems: 'center', justifyContent: 'center'},
  ssoInner: {width: 74, height: 74, borderRadius: 37, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center'},
  ssoWave: {position: 'absolute', width: 108, height: 108, borderRadius: 54, backgroundColor: colors.blue100},
  ssoDotGold: {position: 'absolute', top: 10, right: 18, width: 14, height: 14, borderRadius: 7, backgroundColor: colors.marigold},
  ssoDotBlue: {position: 'absolute', top: 14, left: 22, width: 7, height: 7, borderRadius: 4, backgroundColor: colors.blue700},
  ssoRing: {position: 'absolute', bottom: 16, right: 10, width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: colors.blue700},
  orgCard: {flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: radius.card, borderWidth: 1.5, borderColor: colors.sky, backgroundColor: colors.white},
  orgBadge: {width: 48, height: 48, borderRadius: 12, backgroundColor: colors.blue900, alignItems: 'center', justifyContent: 'center'},
  orgInitials: {fontSize: type.label, color: colors.white, fontFamily: fonts.bold},
  orgCopy: {flex: 1},
  orgName: {fontSize: type.body, color: colors.ink, fontFamily: fonts.bold},
  orgMeta: {fontSize: type.caption, color: colors.muted, marginTop: 3},
  orgNote: {flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14, marginBottom: 22, paddingHorizontal: 4},
  orgNoteText: {flex: 1, fontSize: type.caption, color: colors.muted, lineHeight: 18},
  signing: {paddingTop: 48},
  steps: {alignSelf: 'center', gap: 16, marginTop: 4},
  stepRow: {flexDirection: 'row', alignItems: 'center', gap: 12},
  stepDot: {width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: colors.sandLine, alignItems: 'center', justifyContent: 'center'},
  stepDotDone: {backgroundColor: colors.blue700, borderColor: colors.blue700},
  stepText: {fontSize: type.label, color: colors.ink},
});
