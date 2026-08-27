import { router } from 'expo-router';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Screen } from '@/components/ui/screen';
import { Touch } from '@/components/ui/touch';
import { Colors } from '@/constants/theme';
import { HUSTLR_LOGO_DATA_URI } from '@/constants/hustlr-logo';
import { archivo, bricolageExtraBold } from '@/constants/type';
import { useApp } from '@/store/app-store';

export default function LoginScreen() {
  const { email, setEmail, password, setPassword, setTab } = useApp();

  const logIn = () => {
    setTab('home');
    router.replace('/home');
  };

  return (
    <Screen withNav={false} fill contentStyle={styles.content}>
      <Image
        source={{ uri: HUSTLR_LOGO_DATA_URI }}
        style={styles.logo}
        contentFit="contain"
        accessibilityLabel="HUSTLR"
      />

      <Text style={[bricolageExtraBold(38, { lh: 1.05, ls: -1.4 / 38, color: Colors.text }), styles.title]}>
        Welcome{'\n'}back.
      </Text>
      <Text style={[archivo(14, 400, { color: Colors.sub }), styles.sub]}>Your deals are waiting.</Text>

      <View style={styles.form}>
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

        <View>
          <Field
            label="PASSWORD"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••••"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="current-password"
            textContentType="password"
          />
          <Touch style={styles.forgot} onPress={() => router.push('/forgot')} hitSlop={8}>
            <Text style={archivo(12, 600, { color: Colors.link })}>Forgot password?</Text>
          </Touch>
        </View>

        <Button label="Log in" onPress={logIn} tone="green" style={styles.cta} />
      </View>

      <View style={styles.footer}>
        <Text style={archivo(13, 400, { color: Colors.muted })}>
          New here?{' '}
          <Text style={archivo(13, 700, { color: Colors.green })} onPress={() => router.push('/signup')}>
            Create account
          </Text>
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 24, paddingHorizontal: 28 },
  logo: { width: 227, height: 66 },
  title: { marginTop: 20 },
  sub: { marginTop: 8 },
  form: { gap: 16, marginTop: 32 },
  forgot: { alignSelf: 'flex-end', marginTop: 10 },
  cta: { marginTop: 2 },
  footer: { marginTop: 'auto', paddingTop: 32, alignItems: 'center' },
});
