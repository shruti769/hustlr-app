import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { invProfit, money, roi, signed, type InvStatus } from '../model';
import { pickPhoto } from '../photos';
import { LIVE, useHustlr } from '../store';
import { A, C, L, bgImage, card, hk, kicker, label9, mono } from '../theme';
import { EmptyNote, Field, LabeledField, Photo, Press, PrimaryButton } from '../ui';
import { STATUS } from './main';

const STATUSES: InvStatus[] = ['Sourcing', 'Listed', 'Sold'];

const toNumber = (v: string) => {
  const n = parseFloat(v.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

/** One inventory item: move it through Sourcing → Listed → Sold, edit it, or delete it. */
export function Item() {
  const { st, item, updateInventory, deleteInventory, setInventoryPhoto, back, acceptFlipRules, postFlip } = useHustlr();
  const [name, setName] = useState(item?.name ?? '');
  const [category, setCategory] = useState(item?.category ?? '');
  const [condition, setCondition] = useState(item?.condition ?? '');
  const [size, setSize] = useState(item?.sizeSpec ?? '');
  const [notes, setNotes] = useState(item?.notes ?? '');
  const [buy, setBuy] = useState(item ? String(item.buy) : '');
  const [list, setList] = useState(item ? String(item.list) : '');
  const [sold, setSold] = useState(item?.soldPrice != null ? String(item.soldPrice) : item ? String(item.list) : '');
  const [note, setNote] = useState<{ error?: string; info?: string }>({});
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [story, setStory] = useState('');
  const [agree, setAgree] = useState(false);
  const [shareNote, setShareNote] = useState<{ error?: string; info?: string }>({});

  if (!item) return <View style={pad}><EmptyNote text="This item is no longer in your inventory." /></View>;

  const edited = (fn: (v: string) => void) => (v: string) => { fn(v); setNote({}); };

  const setStatus = async (status: InvStatus) => {
    if (status === item.status || busy) return;
    if (status === 'Sold') setSold(list);
    setBusy(true);
    const err = await updateInventory(item.id, { status, soldPrice: status === 'Sold' ? toNumber(list) : null });
    setBusy(false);
    setNote(err ? { error: err } : { info: status === 'Sold' ? 'Marked as sold — profit saved.' : `Moved to ${status}.` });
  };

  const save = async () => {
    if (busy) return;
    if (!name.trim()) return setNote({ error: 'Give the item a name.' });
    setBusy(true);
    const err = await updateInventory(item.id, {
      name: name.trim(), category, condition, sizeSpec: size, notes,
      buy: toNumber(buy), list: toNumber(list),
      ...(item.status === 'Sold' ? { soldPrice: toNumber(sold) } : {}),
    });
    setBusy(false);
    setNote(err ? { error: err } : { info: 'Changes saved.' });
  };

  const changePhoto = async () => {
    const uri = await pickPhoto();
    if (!uri) return;
    setBusy(true);
    const err = await setInventoryPhoto(item.id, uri);
    setBusy(false);
    if (err) setNote({ error: err });
  };

  const remove = async () => {
    if (!confirmDelete) return setConfirmDelete(true);
    setBusy(true);
    const err = await deleteInventory(item.id);
    setBusy(false);
    if (err) setNote({ error: err });
    else back();
  };

  const share = async () => {
    if (busy || shareNote.info) return;
    if (!st.profile.flipRules) {
      if (!agree) return setShareNote({ error: 'Tick the box to accept the community rules first.' });
      const err = await acceptFlipRules();
      if (err) return setShareNote({ error: err });
    }
    setBusy(true);
    const dealImage = st.deals.find((d) => d.id === item.dealId)?.imageKey ?? null;
    const err = await postFlip({ bought: item.buy, sold: item.soldPrice ?? item.list, copy: story, imageKey: dealImage });
    setBusy(false);
    setShareNote(err ? { error: err } : { info: 'Posted to Flip Tok ✓' });
  };

  const profit = invProfit(item);
  const isSold = item.status === 'Sold';

  return (
    <View style={{ paddingBottom: 110 }}>
      <View style={{ height: 230 }}>
        <Photo src={item.img} style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, bgImage(`linear-gradient(180deg, rgba(8,10,9,0) 40%, ${C.bg} 100%)`)]} />
        <View style={[s.statusTag, { backgroundColor: STATUS[item.status].bg }]}>
          <Text style={mono(11, { w: 600, ls: 0.5, lh: 1, c: STATUS[item.status].fg })}>{item.status.toUpperCase()}</Text>
        </View>
        <Press onPress={changePhoto} style={s.photoBtn} hover={{ borderColor: A(50) }}>
          <Text style={mono(11, { w: 600, lh: 1, c: C.t1 })}>{item.photoPath || item.img ? 'CHANGE PHOTO' : 'ADD PHOTO'}</Text>
        </Press>
      </View>

      <View style={{ gap: 14, paddingTop: 4, paddingHorizontal: 14 }}>
        <View>
          <Text style={hk(20, { w: 700, ls: -0.3, c: C.t1 })}>{item.name}</Text>
          <Text style={[mono(10, { c: C.t4 }), { paddingTop: 7 }]}>{item.sku}</Text>
        </View>

        <View style={s.segment}>
          {STATUSES.map((status) => {
            const on = item.status === status;
            return (
              <Press key={status} onPress={() => setStatus(status)} style={[s.segItem, on && { backgroundColor: C.s2 }]}>
                {({ hovered }) => (
                  <Text style={hk(14, { w: 700, c: on ? C.white : hovered ? C.t1 : C.t4 })}>{status}</Text>
                )}
              </Press>
            );
          })}
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Box label="BOUGHT" value={money(item.buy)} />
          <Box label={isSold ? 'SOLD FOR' : 'LISTED AT'} value={money(isSold ? item.soldPrice ?? item.list : item.list)} />
          <Box label={isSold ? 'PROFIT' : 'EST. PROFIT'} value={signed(profit)} sub={roi(item.buy, item.buy + profit)} accent={profit >= 0} />
        </View>

        {isSold && (
          <View>
            <Text style={kicker}>SALE PRICE</Text>
            <Field
              value={sold} onChangeText={edited(setSold)} keyboardType="decimal-pad"
              style={{ height: 46, marginTop: 9, borderColor: A(35), ...mono(15, { c: C.t1 }) }}
            />
          </View>
        )}

        <LabeledField label="ITEM NAME" value={name} onChangeText={edited(setName)} gap={9} style={{ height: 46 }} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <LabeledField label="BUY PRICE" value={buy} onChangeText={edited(setBuy)} keyboardType="decimal-pad" gap={9} style={{ height: 46 }} />
          </View>
          <View style={{ flex: 1 }}>
            <LabeledField label="LISTING PRICE" value={list} onChangeText={edited(setList)} keyboardType="decimal-pad" gap={9} style={{ height: 46 }} />
          </View>
        </View>
        <LabeledField label="CATEGORY" value={category} onChangeText={edited(setCategory)} gap={9} style={{ height: 46 }} />
        <LabeledField label="CONDITION" value={condition} onChangeText={edited(setCondition)} gap={9} style={{ height: 46 }} />
        <LabeledField label="SIZE / SPEC" value={size} onChangeText={edited(setSize)} gap={9} style={{ height: 46 }} />
        <LabeledField
          label="NOTES" value={notes} onChangeText={edited(setNotes)} gap={9} multiline
          placeholder="Where you bought it, flaws, buyer details…"
          style={{ height: 92, paddingTop: 13, textAlignVertical: 'top' }}
        />

        {note.error || note.info ? (
          <Text style={hk(13, { lh: 18, c: note.error ? C.neg : C.aink })}>{note.error ?? note.info}</Text>
        ) : null}
        <PrimaryButton label={busy ? 'Saving…' : 'Save changes'} onPress={save} />

        {isSold && LIVE && (
          <View style={[card(14, A(25)), { padding: 16, gap: 12 }]}>
            <Text style={kicker}>SHARE THE WIN ON FLIP TOK</Text>
            {shareNote.info ? (
              <Text style={hk(14, { w: 600, c: C.aink })}>{shareNote.info}</Text>
            ) : (
              <>
                <Field
                  value={story} onChangeText={(v) => { setStory(v); setShareNote({}); }} multiline
                  placeholder="Where you found it, how fast it sold, what you'd tell other flippers…"
                  style={{ height: 92, paddingTop: 13, textAlignVertical: 'top' }}
                />
                {!st.profile.flipRules && (
                  <Press onPress={() => setAgree(!agree)} style={s.agreeRow}>
                    <View style={[s.check, agree && { backgroundColor: A(16), borderColor: A(40) }]}>
                      <Text style={hk(11, { c: C.aink })}>{agree ? '✓' : ''}</Text>
                    </View>
                    <Text style={[hk(12.5, { lh: 17, c: C.t3 }), { flex: 1 }]}>
                      I agree to the Flip Tok community rules: real flips only — no spam, scams, abuse or personal contact details.
                    </Text>
                  </Press>
                )}
                {shareNote.error ? <Text style={hk(13, { lh: 18, c: C.neg })}>{shareNote.error}</Text> : null}
                <Press onPress={share} style={s.shareBtn}>
                  <Text style={hk(14, { w: 700, c: C.aink })}>{busy ? 'Posting…' : `Post my ${signed(profit)} flip`}</Text>
                </Press>
              </>
            )}
          </View>
        )}

        <Press
          onPress={remove}
          style={[s.delete, confirmDelete && { backgroundColor: C.neg, borderColor: C.neg }]}>
          <Text style={hk(14, { w: 700, c: confirmDelete ? C.white : C.neg })}>
            {confirmDelete ? 'Tap again to delete this item' : 'Delete item'}
          </Text>
        </Press>
      </View>
    </View>
  );
}

function Box({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <View style={[card(), { flex: 1, padding: 13 }, accent && { backgroundColor: A(8), borderColor: A(30) }]}>
      <Text style={label9}>{label}</Text>
      <Text style={[mono(15, { w: accent ? 600 : 500, c: accent ? C.aink : C.t1 }), { paddingTop: 8 }]}>{value}</Text>
      {sub ? <Text style={[mono(10, { c: C.t4 }), { paddingTop: 4 }]}>{sub} ROI</Text> : null}
    </View>
  );
}

const pad = { paddingTop: 14, paddingHorizontal: 14, paddingBottom: 110 } as const;

const s = StyleSheet.create({
  statusTag: { position: 'absolute', left: 14, bottom: 14, paddingVertical: 6, paddingHorizontal: 11, borderRadius: 7 },
  photoBtn: {
    position: 'absolute', right: 14, bottom: 14, paddingVertical: 7, paddingHorizontal: 11, borderRadius: 7,
    backgroundColor: 'rgba(8,10,9,0.78)', borderWidth: 1, borderColor: L(14),
  },
  segment: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: 12, backgroundColor: C.s1, borderWidth: 1, borderColor: L(6) },
  segItem: { flex: 1, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  agreeRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  check: { width: 20, height: 20, borderRadius: 6, borderWidth: 1, borderColor: L(14), alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  shareBtn: {
    height: 48, borderRadius: 12, backgroundColor: A(12), borderWidth: 1, borderColor: A(30),
    alignItems: 'center', justifyContent: 'center',
  },
  delete: {
    height: 50, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,92,92,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
});
