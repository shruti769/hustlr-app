import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { ArrowLeftIcon, LockIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Screen } from '@/components/ui/screen';
import { Touch } from '@/components/ui/touch';
import { Colors } from '@/constants/theme';
import { archivo, bricolageExtraBold } from '@/constants/type';
import { useApp } from '@/store/app-store';

export default function ForgotScreen() {
  const { email, setEmail, flash } = useApp();

  const back = () => (router.canGoBack() ? router.back() : router.replace('/login'));

  const sendReset = () => {
    flash(`Reset link sent to ${email || 'your email'}`);
    back();
  };

  return (
    <Screen withNav={false} fill contentStyle={styles.content}>
      <Touch style={styles.back} onPress={back} hitSlop={10} accessibilityRole="button">
        <ArrowLeftIcon size={16} width={1.6} color={Colors.sub} />
        <Text style={archivo(13, 400, { color: Colors.sub })}>Back to login</Text>
      </Touch>

      <View style={styles.lockTile}>
        <LockIcon size={25} />
      </View>

      <Text style={[bricolageExtraBold(30, { lh: 1.06, ls: -1.1 / 30, color: Colors.text }), styles.title]}>
        Reset password
      </Text>
      <Text style={[archivo(14, 400, { lh: 1.5, color: Colors.sub }), styles.sub]}>
        Enter your email and we’ll send you a link to get back in.
      </Text>

      <Field
        label="EMAIL"
        variant="auth"
        value={email}
        onChangeText={setEmail}
        placeholder="you@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        style={styles.field}
      />

      <Button label="Send reset link" tone="green" radius={13} padding={16} onPress={sendReset} style={styles.cta} />

      {/* Keeps the reset toast visible above the keyboard-free area. */}
      <View style={styles.spacer} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 40, paddingHorizontal: 28 },
  back: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 7 },
  lockTile: {
    width: 53,
    height: 53,
    marginTop: 41,
    borderWidth: 1,
    borderColor: Colors.greenBorder35,
    borderRadius: 13,
    backgroundColor: Colors.greenGlass07,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { marginTop: 25 },
  sub: { marginTop: 10, maxWidth: 370 },
  field: { marginTop: 39 },
  cta: { marginTop: 22 },
  spacer: { flex: 1 },
});
