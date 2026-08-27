import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Screen } from '@/components/ui/screen';
import { Colors } from '@/constants/theme';
import { archivo, bricolageExtraBold } from '@/constants/type';
import { useApp } from '@/store/app-store';

export default function SignupScreen() {
  const { email, setEmail, password, setPassword, fullName, setFullName, setTab } = useApp();

  const createAccount = () => {
    setTab('home');
    router.replace('/home');
  };

  return (
    <Screen withNav={false} fill contentStyle={styles.content}>
      <Text style={[bricolageExtraBold(38, { lh: 1.05, ls: -1.4 / 38, color: Colors.text }), styles.title]}>
        Create your{'\n'}account.
      </Text>
      <Text style={[archivo(13.5, 400, { color: Colors.sub }), styles.sub]}>
        Free to start. Stack from day one.
      </Text>

      <View style={styles.form}>
        <Field
          label="FULL NAME"
          value={fullName}
          onChangeText={setFullName}
          placeholder="Mason Reid"
          autoComplete="name"
          textContentType="name"
        />
        <Field
          label="EMAIL"
          value={email}
          onChangeText={setEmail}
          placeholder="you@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <Field
          label="PASSWORD"
          value={password}
          onChangeText={setPassword}
          placeholder="Create a password"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
        />
        <Button label="Create account" onPress={createAccount} style={styles.cta} />
      </View>

      <View style={styles.footer}>
        <Text style={archivo(13, 400, { color: Colors.muted })}>
          Already hustling?{' '}
          <Text style={archivo(13, 700, { color: Colors.green })} onPress={() => router.replace('/login')}>
            Log in
          </Text>
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 34, paddingHorizontal: 26 },
  title: { marginTop: 22 },
  sub: { marginTop: 9 },
  form: { gap: 15, marginTop: 30 },
  cta: { marginTop: 8 },
  footer: { marginTop: 'auto', paddingTop: 32, alignItems: 'center' },
});
