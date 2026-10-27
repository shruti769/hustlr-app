import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import { ART } from '../data';
import { LIVE, useHustlr } from '../store';
import { A, C, L, bgImage, bric, hk, mono } from '../theme';
import { LabeledField, Press, PrimaryButton } from '../ui';

const GRID = 58;

/** Tap anywhere to enter — and it moves on by itself after a short beat. */
export function Splash() {
  const { enter } = useHustlr();
  const [size, setSize] = useState({ w: 430, h: 860 });
  useEffect(() => {
    const id = setTimeout(enter, 2600);
    return () => clearTimeout(id);
  }, [enter]);

  const { w, h } = size;
  const cols = Math.ceil(w / GRID) + 1;
  const rows = Math.ceil(h / GRID) + 1;

  return (
    <Press
      onPress={enter}
      pressed={{}}
      style={[s.splash, bgImage(`radial-gradient(559px 946px at 50% 35%, ${A(13)} 0%, rgba(32,197,101,0) 60%)`)]}>
      <View style={StyleSheet.absoluteFill} onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
        <Svg width={w} height={h} style={{ opacity: 0.22 }}>
          {Array.from({ length: rows }, (_, i) => (
            <Line key={`r${i}`} x1={0} x2={w} y1={i * GRID + 0.5} y2={i * GRID + 0.5} stroke={L(4.3)} strokeWidth={1} />
          ))}
          {Array.from({ length: cols }, (_, i) => (
            <Line key={`c${i}`} y1={0} y2={h} x1={i * GRID + 0.5} x2={i * GRID + 0.5} stroke={L(4.3)} strokeWidth={1} />
          ))}
        </Svg>
      </View>
      <View style={[s.ring, { left: w / 2 - 181, top: h / 2 - 181, width: 362, height: 362, borderRadius: 181, borderColor: A(14) }]} />
      <View style={[s.ring, { left: w / 2 - 131, top: h / 2 - 131, width: 262, height: 262, borderRadius: 131, borderColor: A(10) }]} />
      <View style={[s.center, { left: w / 2 - 150, top: h / 2 - 61 }]}>
        <View style={s.logoGlow}><Image source={ART.logo} contentFit="contain" style={s.logo} /></View>
        <Text style={[mono(10, { ls: 4, lh: 1, c: C.t4 }), { textAlign: 'center' }]}>STOP BROWSING. START STACKING.</Text>
        <View style={[s.bar, bgImage(`linear-gradient(90deg, rgba(32,197,101,0) 0%, ${C.a} 50%, rgba(32,197,101,0) 100%)`)]} />
      </View>
      <View style={[s.footer, { left: w / 2 - 105, top: h - 65 }]}>
        <View style={s.dot} />
        <Text style={mono(10, { ls: 3, lh: 1, c: C.t5 })}>AI RESALE INTELLIGENCE</Text>
      </View>
    </Press>
  );
}

const title = bric(38, { w: 800, lh: 39.9, ls: -1.4, c: C.t1 });
const sub = hk(15, { lh: 1, c: C.t3 });

function AuthFooter({ prompt, link, onPress }: { prompt: string; link: string; onPress: () => void }) {
  return (
    <View style={s.authFooter}>
      <Text style={hk(14, { c: C.t3 })}>{prompt}</Text>
      <Press onPress={onPress}>
        <Text style={hk(14, { w: 600, c: C.aink })}>{link}</Text>
      </Press>
    </View>
  );
}

type Note = { error?: string; info?: string };

/** Error (red) or confirmation (green) line under an auth form. */
function FormNote({ error, info }: Note) {
  if (!error && !info) return null;
  return <Text style={[hk(13, { lh: 18, c: error ? C.neg : C.aink }), { paddingTop: 12 }]}>{error ?? info}</Text>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PASSWORD = 6;

/** Live helper line under a field: grey while typing, green once satisfied, red after a failed submit. */
function Hint({ text, ok, show, error }: { text: string; ok: boolean; show: boolean; error?: boolean }) {
  if (!show) return null;
  const c = ok ? C.aink : error ? C.neg : C.t4;
  return <Text style={[mono(10, { c }), { paddingTop: 7 }]}>{ok ? '✓ ' : ''}{text}</Text>;
}

export function Login() {
  const { st, set, go, signIn } = useHustlr();
  const [email, setEmail] = useState(st.authEmail || (LIVE ? '' : 'mason@hustlr.app'));
  const [password, setPassword] = useState(LIVE ? '' : 'hustlrhustlr');
  const [note, setNote] = useState<Note>({});
  const [busy, setBusy] = useState(false);
  const emailOk = EMAIL_RE.test(email.trim());

  const toSignup = () => { set({ authEmail: email.trim() }); go('signup'); };
  const edit = (fn: (v: string) => void) => (v: string) => { fn(v); if (note.error) setNote({}); };

  const submit = async () => {
    if (busy) return;
    if (LIVE && !emailOk) return setNote({ error: 'Enter a valid email address.' });
    if (LIVE && !password) return setNote({ error: 'Enter your password.' });
    setBusy(true);
    setNote({});
    const res = await signIn(email, password);
    setBusy(false);
    if (res.error) setNote({ error: res.error });
  };

  return (
    <View style={s.auth}>
      <Image source={ART.logo} contentFit="contain" contentPosition="left center" style={s.authLogo} />
      <Text style={title}>{'Welcome\nback.'}</Text>
      <Text style={[sub, s.subPad]}>Your deals are waiting.</Text>
      <View style={{ gap: 14 }}>
        <LabeledField
          label="EMAIL" value={email} onChangeText={edit(setEmail)} placeholder="you@email.com"
          keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress"
        />
        <LabeledField
          label="PASSWORD" value={password} onChangeText={edit(setPassword)} placeholder="Your password"
          password autoComplete="password" textContentType="password" onSubmitEditing={submit}
        />
      </View>
      <FormNote {...note} />
      <Press onPress={() => { set({ authEmail: email.trim() }); go('reset'); }} style={{ alignSelf: 'flex-end', paddingTop: 14 }}>
        {({ hovered }) => <Text style={hk(13, { w: 600, c: hovered ? C.aink : C.t4 })}>Forgot password?</Text>}
      </Press>
      <PrimaryButton label={busy ? 'Logging in…' : 'Log in'} onPress={submit} style={{ marginTop: 20 }} />
      <View style={s.spacer} />
      <AuthFooter prompt="New here?" link="Create account" onPress={toSignup} />
    </View>
  );
}

export function Signup() {
  const { st, set, signUp, goLogin } = useHustlr();
  const [name, setName] = useState('');
  const [email, setEmail] = useState(st.authEmail);
  const [password, setPassword] = useState('');
  const [note, setNote] = useState<Note>({});
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const emailOk = EMAIL_RE.test(email.trim());
  const passOk = password.length >= MIN_PASSWORD;

  const toLogin = () => { set({ authEmail: email.trim() }); goLogin(); };
  const edit = (fn: (v: string) => void) => (v: string) => { fn(v); if (note.error) setNote({}); };

  const submit = async () => {
    if (busy) return;
    setTried(true);
    if (LIVE && !name.trim()) return setNote({ error: 'Add your full name.' });
    if (LIVE && !emailOk) return setNote({ error: 'Enter a valid email address.' });
    if (LIVE && !passOk) return setNote({ error: `Password needs at least ${MIN_PASSWORD} characters.` });
    setBusy(true);
    setNote({});
    const res = await signUp(name, email, password);
    setBusy(false);
    setNote(res);
  };

  return (
    <View style={s.auth}>
      <Text style={title}>{'Create your\naccount.'}</Text>
      <Text style={[sub, s.subPad]}>Free to start. Stack from day one.</Text>
      <View style={{ gap: 14 }}>
        <LabeledField label="FULL NAME" value={name} onChangeText={edit(setName)} placeholder="Mason Reid" autoComplete="name" />
        <LabeledField
          label="EMAIL" value={email} onChangeText={edit(setEmail)} placeholder="you@email.com"
          keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress"
        />
        <View>
          <LabeledField
            label="PASSWORD" value={password} onChangeText={edit(setPassword)} placeholder="Create a password"
            password autoComplete="new-password" textContentType="newPassword" onSubmitEditing={submit}
          />
          <Hint text={`At least ${MIN_PASSWORD} characters`} ok={passOk} show={LIVE && (password.length > 0 || tried)} error={tried} />
        </View>
      </View>
      <FormNote {...note} />
      <PrimaryButton label={busy ? 'Creating…' : 'Create account'} onPress={submit} style={{ marginTop: 28 }} />
      <View style={s.spacer} />
      <AuthFooter prompt="Already hustling?" link="Log in" onPress={toLogin} />
    </View>
  );
}

export function Reset() {
  const { st, resetPassword, goLogin } = useHustlr();
  const [email, setEmail] = useState(st.authEmail);
  const [note, setNote] = useState<Note>({});
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (busy) return;
    if (note.info) return goLogin();
    if (LIVE && !EMAIL_RE.test(email.trim())) return setNote({ error: 'Enter the email you signed up with.' });
    setBusy(true);
    setNote(await resetPassword(email));
    setBusy(false);
  };
  return (
    <View style={s.auth}>
      <Text style={title}>Reset password</Text>
      <Text style={[hk(15, { lh: 21, c: C.t3 }), s.subPad]}>We will send a reset link to your inbox.</Text>
      <LabeledField
        label="EMAIL" value={email} onChangeText={(v) => { setEmail(v); if (note.error) setNote({}); }} placeholder="you@email.com"
        keyboardType="email-address" autoCapitalize="none" autoComplete="email" onSubmitEditing={submit}
      />
      <FormNote {...note} />
      <PrimaryButton
        label={busy ? 'Sending…' : note.info ? 'Back to log in' : 'Send reset link'}
        onPress={submit}
        style={{ marginTop: 28 }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  splash: { flex: 1, overflow: 'hidden', backgroundColor: C.bg },
  ring: { position: 'absolute', borderWidth: 1 },
  center: { position: 'absolute', width: 296, gap: 26, alignItems: 'center' },
  logoGlow: { filter: `drop-shadow(0 6px 24px ${A(45)})` },
  logo: { width: 185, height: 55 },
  bar: { width: 180, height: 3, borderRadius: 2 },
  footer: { position: 'absolute', flexDirection: 'row', gap: 7, alignItems: 'center' },
  dot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: C.aink, opacity: 0.573 },
  auth: { flexGrow: 1, paddingTop: 34, paddingHorizontal: 28, paddingBottom: 48 },
  authLogo: { width: 227, height: 66, marginBottom: 30 },
  subPad: { paddingTop: 12, paddingBottom: 30 },
  spacer: { flex: 1, minHeight: 40 },
  authFooter: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
});
