import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { LIVE, useHustlr } from '../store';
import { A, C, L, bric, card, hk, kicker, mono } from '../theme';
import { LabeledField, Press, PrimaryButton } from '../ui';

type Note = { error?: string | null; info?: string | null };

function NoteLine({ error, info }: Note) {
  if (!error && !info) return null;
  return <Text style={hk(13, { lh: 18, c: error ? C.neg : C.aink })}>{error ?? info}</Text>;
}

const MIN_PASSWORD = 6;

/** Profile details, password and account deletion. */
export function Settings() {
  const { st, updateProfile, setNewPassword, deleteAccount, setDealAlerts } = useHustlr();
  const [name, setName] = useState(st.profile.name);
  const [region, setRegion] = useState(st.profile.region);
  const [profileNote, setProfileNote] = useState<Note>({});
  const [password, setPassword] = useState('');
  const [passNote, setPassNote] = useState<Note>({});
  const [deleteNote, setDeleteNote] = useState<Note>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState<'profile' | 'password' | 'delete' | null>(null);

  const saveProfile = async () => {
    if (busy) return;
    setBusy('profile');
    const err = await updateProfile({ name, region });
    setBusy(null);
    setProfileNote(err ? { error: err } : { info: 'Profile updated.' });
  };

  const savePassword = async () => {
    if (busy) return;
    if (password.length < MIN_PASSWORD) return setPassNote({ error: `Password needs at least ${MIN_PASSWORD} characters.` });
    setBusy('password');
    const err = await setNewPassword(password);
    setBusy(null);
    if (!err) setPassword('');
    setPassNote(err ? { error: err } : { info: 'Password changed.' });
  };

  const remove = async () => {
    if (busy) return;
    if (!confirmDelete) return setConfirmDelete(true);
    setBusy('delete');
    const err = await deleteAccount();
    setBusy(null);
    if (err) setDeleteNote({ error: err });
  };

  return (
    <View style={{ gap: 14, paddingTop: 14, paddingHorizontal: 14, paddingBottom: 110 }}>
      <View style={[card(14), s.section]}>
        <Text style={kicker}>PROFILE</Text>
        <LabeledField label="FULL NAME" value={name} onChangeText={(v) => { setName(v); setProfileNote({}); }} autoComplete="name" />
        <LabeledField label="REGION" value={region} onChangeText={(v) => { setRegion(v); setProfileNote({}); }} placeholder="City, country" />
        <View style={{ gap: 6 }}>
          <Text style={kicker}>EMAIL</Text>
          <Text style={hk(14, { c: C.t3 })}>{st.profile.email || '—'}</Text>
        </View>
        <NoteLine {...profileNote} />
        <Press onPress={saveProfile} style={s.secondary}>
          <Text style={hk(14, { w: 700, c: C.aink })}>{busy === 'profile' ? 'Saving…' : 'Save profile'}</Text>
        </Press>
      </View>

      <View style={[card(14), s.section]}>
        <Text style={kicker}>ALERTS</Text>
        <Press onPress={() => setDealAlerts(!st.profile.dealAlerts)} style={s.toggleRow}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={hk(14, { w: 600, c: C.t1 })}>Steal alerts</Text>
            <Text style={[hk(12.5, { lh: 17, c: C.t3 }), { paddingTop: 4 }]}>
              A notification when a new high-score Steal lands. Up to 3 a day.
            </Text>
          </View>
          <View style={[s.switch, st.profile.dealAlerts && { backgroundColor: C.a, borderColor: C.a }]}>
            <View style={[s.knob, st.profile.dealAlerts && { transform: [{ translateX: 18 }], backgroundColor: C.ona }]} />
          </View>
        </Press>
      </View>

      {LIVE && (
        <View style={[card(14), s.section]}>
          <Text style={kicker}>CHANGE PASSWORD</Text>
          <LabeledField
            label="NEW PASSWORD" value={password} onChangeText={(v) => { setPassword(v); setPassNote({}); }}
            password autoComplete="new-password" textContentType="newPassword" placeholder="At least 6 characters"
          />
          <NoteLine {...passNote} />
          <Press onPress={savePassword} style={s.secondary}>
            <Text style={hk(14, { w: 700, c: C.aink })}>{busy === 'password' ? 'Updating…' : 'Update password'}</Text>
          </Press>
        </View>
      )}

      <View style={[card(14, 'rgba(255,92,92,0.25)'), s.section]}>
        <Text style={mono(10, { ls: 1, c: C.neg })}>DELETE ACCOUNT</Text>
        <Text style={hk(13.5, { lh: 20, c: C.t3 })}>
          Permanently deletes your account, inventory, photos, watchlist, credits and arcade progress. This can't be undone.
        </Text>
        <NoteLine {...deleteNote} />
        <Press onPress={remove} style={[s.delete, confirmDelete && { backgroundColor: C.neg, borderColor: C.neg }]}>
          <Text style={hk(14, { w: 700, c: confirmDelete ? C.white : C.neg })}>
            {busy === 'delete' ? 'Deleting…' : confirmDelete ? 'Tap again to permanently delete' : 'Delete my account'}
          </Text>
        </Press>
      </View>
    </View>
  );
}

/** Opened from a password-reset email link. */
export function NewPassword() {
  const { setNewPassword, goLogin } = useHustlr();
  const [password, setPassword] = useState('');
  const [note, setNote] = useState<Note>({});
  const [busy, setBusy] = useState(false);
  const ok = password.length >= MIN_PASSWORD;

  const submit = async () => {
    if (busy) return;
    if (!ok) return setNote({ error: `Password needs at least ${MIN_PASSWORD} characters.` });
    setBusy(true);
    const err = await setNewPassword(password);
    setBusy(false);
    if (err) setNote({ error: err });
  };

  return (
    <View style={s.auth}>
      <Text style={bric(38, { w: 800, lh: 39.9, ls: -1.4, c: C.t1 })}>{'Set a new\npassword.'}</Text>
      <Text style={[hk(15, { lh: 21, c: C.t3 }), { paddingTop: 12, paddingBottom: 30 }]}>
        Choose a password you haven't used here before.
      </Text>
      <LabeledField
        label="NEW PASSWORD" value={password} onChangeText={(v) => { setPassword(v); setNote({}); }}
        password autoComplete="new-password" textContentType="newPassword" onSubmitEditing={submit}
      />
      <Text style={[mono(10, { c: ok ? C.aink : C.t4 }), { paddingTop: 7 }]}>
        {ok ? '✓ ' : ''}At least {MIN_PASSWORD} characters
      </Text>
      {note.error ? <Text style={[hk(13, { lh: 18, c: C.neg }), { paddingTop: 12 }]}>{note.error}</Text> : null}
      <PrimaryButton label={busy ? 'Saving…' : 'Save password'} onPress={submit} style={{ marginTop: 28 }} />
      <View style={{ flex: 1, minHeight: 40 }} />
      <Press onPress={goLogin} style={{ alignSelf: 'center' }}>
        <Text style={hk(14, { w: 600, c: C.t3 })}>Back to log in</Text>
      </Press>
    </View>
  );
}

const s = StyleSheet.create({
  section: { padding: 16, gap: 14 },
  secondary: {
    height: 48, borderRadius: 12, backgroundColor: A(12), borderWidth: 1,
    borderColor: A(30), alignItems: 'center', justifyContent: 'center',
  },
  delete: {
    height: 48, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,92,92,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  switch: {
    width: 46, height: 28, borderRadius: 14, borderWidth: 1, borderColor: L(14), backgroundColor: C.s2,
    justifyContent: 'center', paddingHorizontal: 3,
  },
  knob: { width: 20, height: 20, borderRadius: 10, backgroundColor: C.t3 },
  auth: { flexGrow: 1, paddingTop: 34, paddingHorizontal: 28, paddingBottom: 48 },
});
