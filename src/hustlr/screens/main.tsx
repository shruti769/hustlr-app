import { Image } from 'expo-image';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import {
  ADD_FIELDS, ART, CATS, DEALS, FLIPS, INVENTORY, INV_STATS, PLATFORMS, RISK, SHORTCUTS, VERDICT,
} from '../data';
import { useHustlr } from '../store';
import { A, C, L, bgImage, bric, card, hk, kicker, label9, mono, space } from '../theme';
import { Field, Grid2, LabeledField, Photo, Press, PrimaryButton } from '../ui';

const pad = { paddingTop: 14, paddingHorizontal: 14, paddingBottom: 110 } as const;

export function Deals() {
  const { st, set, openDeal } = useHustlr();
  return (
    <View style={pad}>
      <View style={s.search}>
        <Svg width={15} height={15} viewBox="0 0 15 15" fill="none" stroke={C.t4} strokeWidth={1.25} strokeLinecap="round">
          <Circle cx={6.9} cy={6.9} r={5} />
          <Path d="M10.4 10.4 13.1 13.1" />
        </Svg>
        <Text style={hk(14, { lh: 1, c: C.t4 })}>Search item, brand…</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -14 }} contentContainerStyle={s.cats}>
        {CATS.map((label) => {
          const on = st.cat === label;
          return (
            <Press
              key={label}
              onPress={() => set({ cat: label })}
              style={[s.cat, { backgroundColor: on ? A(14) : C.s1, borderColor: on ? A(45) : L(8) }]}>
              <Text style={mono(11, { ls: 0.5, c: on ? C.a : C.t3 })}>{label}</Text>
            </Press>
          );
        })}
      </ScrollView>
      <View style={{ gap: 11 }}>
        {DEALS.map((d, i) => (
          <Press key={d.name} onPress={() => openDeal(i)} style={[card(14), s.clip]} hover={{ borderColor: A(35) }}>
            <View style={{ height: 124 }}>
              <Photo src={d.img} style={StyleSheet.absoluteFill} />
              <View style={[s.profitTag, { left: 10, top: 10 }]}>
                <Text style={mono(12, { w: 700, lh: 1, c: C.ona })}>{d.profit}</Text>
              </View>
              <View style={s.scoreTag}>
                <View style={s.dot6} />
                <Text style={mono(12, { lh: 1, c: C.t1 })}>{d.score}</Text>
              </View>
            </View>
            <View style={{ padding: 14 }}>
              <View style={s.rowTop}>
                <Text style={[hk(15, { w: 700, lh: 1, ls: -0.2, c: C.t1 }), { flexShrink: 1 }]}>{d.name}</Text>
                <View style={[s.risk, { borderColor: RISK[d.risk] }]}>
                  <Text style={mono(10, { lh: 15, c: RISK[d.risk] })}>{d.risk}</Text>
                </View>
              </View>
              <Text style={[mono(10, { lh: 1, c: C.t4 }), { paddingTop: 6 }]}>{d.source}</Text>
              <View style={s.dealFoot}>
                <View style={{ flexDirection: 'row', gap: 18 }}>
                  <Stat label="BUY" value={d.buy} />
                  <Stat label="ROI" value={d.roi} accent />
                </View>
                <View style={s.view}>
                  <Text style={hk(13, { w: 700, c: C.ona })}>View →</Text>
                </View>
              </View>
            </View>
          </Press>
        ))}
      </View>
    </View>
  );
}

function Stat({ label, value, accent, tight = true }: { label: string; value: string; accent?: boolean; tight?: boolean }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={mono(9, { ls: 0.5, lh: tight ? 1 : undefined, c: C.t4 })}>{label}</Text>
      <Text style={mono(14, { w: accent ? 600 : 500, lh: tight ? 1 : undefined, c: accent ? C.aink : C.t1 })}>{value}</Text>
    </View>
  );
}

/** 90-day resale sparkline used by the detail and dashboard cards. */
export function AreaChart({ d }: { d: string }) {
  return (
    <Svg viewBox="0 0 360 80" preserveAspectRatio="none" width="100%" height={80}>
      <Path d={`${d} L360 80 L0 80 Z`} fill={A(12)} />
      <Path d={d} fill="none" stroke={C.a} strokeWidth={2} />
    </Svg>
  );
}

export function Detail() {
  const { st, go } = useHustlr();
  const d = DEALS[st.dealIndex];
  const breakdown = [
    { label: 'Est. resale', value: d.resale, fg: C.t1 },
    { label: 'Buy price', value: '-' + d.buy.slice(1), fg: C.t1 },
    { label: 'Platform fee (12.9%)', value: '-$52.89', fg: C.t1 },
    { label: 'Shipping', value: '-$15.00', fg: C.t1 },
    { label: 'Net profit', value: '+$142.11', fg: C.aink },
  ];
  return (
    <View style={{ paddingBottom: 110 }}>
      <View style={{ height: 230 }}>
        <Photo src={d.img} style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, bgImage(`linear-gradient(180deg, rgba(8,10,9,0) 40%, ${C.bg} 100%)`)]} />
        <View style={[s.profitTag, { left: 14, bottom: 14, paddingVertical: 6, paddingHorizontal: 11, borderRadius: 7 }]}>
          <Text style={mono(12, { w: 700, c: C.ona })}>{d.profit} PROFIT</Text>
        </View>
        <View style={{ position: 'absolute', right: 14, bottom: 14, alignItems: 'flex-end' }}>
          <Text style={bric(28, { lh: 1, c: C.t1 })}>{d.score}</Text>
          <Text style={mono(9, { ls: 1, c: C.t4 })}>SCORE</Text>
        </View>
      </View>
      <View style={{ gap: 12, paddingTop: 4, paddingHorizontal: 14 }}>
        <View>
          <Text style={hk(20, { w: 700, ls: -0.3, c: C.t1 })}>{d.name}</Text>
          <Text style={[mono(10, { c: C.t4 }), { paddingTop: 7 }]}>{d.source}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Box label="ASKING" value={d.buy} />
          <Box label="RESALE" value={d.resale} />
          <Box label="PROFIT" value={d.profit} accent />
        </View>
        <View style={[card(), { padding: 16 }]}>
          <View style={s.between}>
            <Text style={kicker}>RESALE PRICE · 90D</Text>
            <Text style={mono(11, { c: C.aink })}>▲ 24%</Text>
          </View>
          <View style={{ marginTop: 14, height: 80 }}>
            <AreaChart d="M0 66 L45 58 L90 62 L135 44 L180 48 L225 30 L270 34 L315 16 L360 10" />
          </View>
        </View>
        <View style={[card(), { padding: 16 }]}>
          <Text style={kicker}>AI VERDICT</Text>
          <View style={{ gap: 12, paddingTop: 14 }}>
            {VERDICT.map((v) => <Check key={v.text} {...v} />)}
          </View>
        </View>
        <View style={[card(), { padding: 16 }]}>
          <Text style={kicker}>PROFIT BREAKDOWN</Text>
          <View style={{ paddingTop: 6 }}>
            {breakdown.map((b) => (
              <View key={b.label} style={s.lineRow}>
                <Text style={hk(13.5, { c: C.t3 })}>{b.label}</Text>
                <Text style={mono(13, { c: b.fg })}>{b.value}</Text>
              </View>
            ))}
          </View>
        </View>
        <PrimaryButton label="Lock this deal" onPress={() => go('add')} />
      </View>
    </View>
  );
}

function Box({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={[s.box, accent && { backgroundColor: A(8), borderColor: A(30) }]}>
      <Text style={label9}>{label}</Text>
      <Text style={[mono(15, { w: accent ? 600 : 500, c: accent ? C.aink : C.t1 }), { paddingTop: 8 }]}>{value}</Text>
    </View>
  );
}

/** Verdict row: a tinted 18px mark and a line of copy. */
export function Check({ mark, text, bg, fg, monoMark = true }: { mark: string; text: string; bg: string; fg: string; monoMark?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
      <View style={[s.mark, { backgroundColor: bg }]}>
        <Text style={(monoMark ? mono : hk)(11, { c: fg })}>{mark}</Text>
      </View>
      <Text style={[hk(13.5, { lh: 18, c: C.t2 }), { flexShrink: 1 }]}>{text}</Text>
    </View>
  );
}

export function Home() {
  const { go } = useHustlr();
  return (
    <View style={pad}>
      <View style={s.segment}>
        <View style={[s.segItem, { backgroundColor: C.s2 }]}>
          <Text style={hk(14, { w: 700, c: C.white })}>Home</Text>
        </View>
        <Press onPress={() => go('analyse')} style={s.segItem}>
          {({ hovered }) => <Text style={hk(14, { w: 700, c: hovered ? C.t1 : C.t4 })}>Analyser</Text>}
        </Press>
      </View>
      <View style={{ paddingTop: 24 }}>
        <Text style={space(24, { lh: 1, c: C.t1 })}>Quick Listing Analyser</Text>
        <Text style={[hk(13.5, { lh: 1, c: C.t3 }), { paddingTop: 10 }]}>Paste any listing, get an instant AI verdict.</Text>
      </View>
      <View style={{ gap: 14, paddingTop: 20 }}>
        <View style={[card(12), { padding: 14 }]}>
          <Text style={hk(13.5, { c: C.t4 })}>https://facebook.com/marketplace/item/…</Text>
        </View>
        <PrimaryButton label="Analyse listing" onPress={() => go('analyse')} height={50} radius={12} size={15} />
      </View>
      <Text style={[kicker, { paddingTop: 26, paddingBottom: 10 }]}>JUMP BACK IN</Text>
      <Grid2 gap={10}>
        {SHORTCUTS.map((t) => (
          <Press key={t.label} onPress={() => go(t.to)} style={[card(), { padding: 14, flex: 1 }]} hover={{ borderColor: A(35) }}>
            <Text style={label9}>{t.kicker}</Text>
            <Text style={[hk(14, { w: 600, c: C.t1 }), { paddingTop: 9 }]}>{t.label}</Text>
          </Press>
        ))}
      </Grid2>
    </View>
  );
}

/** Initials tile used for people across Flip Tok, Leaderboard and Profile. */
export function Avatar({ initials, size = 40, radius = 10, font = 12, border = A(25), color = C.aink, weight = 600 }: {
  initials: string; size?: number; radius?: number; font?: number; border?: string; color?: string; weight?: number;
}) {
  return (
    <View style={[{
      width: size, height: size, borderRadius: radius, borderWidth: 1, borderColor: border,
      alignItems: 'center', justifyContent: 'center',
    }, bgImage(`linear-gradient(140deg, ${C.s3} 4%, ${C.s4} 96%)`)]}>
      <Text style={mono(font, { w: weight, c: color })}>{initials}</Text>
    </View>
  );
}

export function FlipTok() {
  return (
    <View style={[pad, { gap: 11 }]}>
      {FLIPS.map((f) => (
        <View key={f.handle} style={[card(14), s.clip]}>
          <View style={s.flipHead}>
            <Avatar initials={f.initials} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={hk(13.5, { w: 600, c: C.t1 })}>{f.name}</Text>
              <Text style={[mono(10, { c: C.t4 }), { paddingTop: 4 }]}>{f.handle}</Text>
            </View>
            <View style={s.flipProfit}>
              <Text style={mono(12, { w: 700, c: C.aink })}>{f.profit}</Text>
            </View>
          </View>
          <Photo src={f.img} style={{ height: 210 }} />
          <View style={{ padding: 14 }}>
            <Text style={hk(13.5, { lh: 20, c: C.t2 })}>{f.copy}</Text>
            <View style={{ flexDirection: 'row', gap: 18, paddingTop: 14 }}>
              <Stat label="BOUGHT" value={f.bought} tight={false} />
              <Stat label="SOLD" value={f.sold} tight={false} />
              <Stat label="ROI" value={f.roi} accent tight={false} />
              <View style={{ flex: 1 }} />
              <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
                <Text style={mono(11, { c: C.t4 })}>♥ {f.likes}</Text>
                <Text style={mono(11, { c: C.t4 })}>↗ {f.shares}</Text>
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

export function Inventory() {
  return (
    <View style={[pad, { gap: 12 }]}>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {INV_STATS.map((x) => (
          <View key={x.label} style={[card(), { flex: 1, padding: 15 }]}>
            <Text style={label9}>{x.label}</Text>
            <Text style={[mono(15, { w: 600, c: x.fg }), { paddingTop: 10 }]}>{x.value}</Text>
          </View>
        ))}
      </View>
      {INVENTORY.map((i) => (
        <View key={i.sku} style={[card(), s.itemRow]}>
          <Photo src={i.img} style={s.thumb54} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text numberOfLines={1} style={hk(13.5, { w: 600, c: C.t1 })}>{i.name}</Text>
            <Text style={[mono(10, { c: C.t4 }), { paddingTop: 5 }]}>{i.sku}</Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 6 }}>
            <Text style={mono(12, { w: 600, c: C.aink })}>{i.profit}</Text>
            <View style={[s.status, { backgroundColor: i.sbg }]}>
              <Text style={mono(9, { ls: 0.5, c: i.sfg })}>{i.status}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

export function AddListing() {
  const { go } = useHustlr();
  return (
    <View style={[pad, { gap: 18 }]}>
      <View>
        <Text style={kicker}>PHOTOS</Text>
        <View style={{ flexDirection: 'row', gap: 10, paddingTop: 11, alignItems: 'flex-start' }}>
          <View style={[s.slot, { borderStyle: 'dashed', borderColor: A(40) }]}>
            <Text style={mono(10, { ls: 1, c: C.aink })}>ADD</Text>
          </View>
          <Image source={ART.addPhoto} contentFit="cover" style={{ width: 84, height: 84, borderRadius: 12 }} />
          <View style={s.slot}><Text style={mono(10, { ls: 1, c: C.t5 })}>PHOTO 2</Text></View>
          <View style={s.slot}><Text style={mono(10, { ls: 1, c: C.t5 })}>PHOTO 3</Text></View>
        </View>
      </View>
      {ADD_FIELDS.map((f) => (
        <LabeledField key={f.label} label={f.label} defaultValue={f.value} gap={9} style={{ height: 46 }} />
      ))}
      <View>
        <View style={s.between}>
          <Text style={kicker}>LISTING PRICE</Text>
          <View style={s.aiTag}>
            <Text style={mono(9, { ls: 0.5, c: C.aink })}>AI SUGGESTED</Text>
          </View>
        </View>
        <Field
          defaultValue="410"
          keyboardType="numeric"
          style={{ height: 46, marginTop: 9, borderColor: A(35), ...mono(15, { c: C.t1 }) }}
        />
        <Text style={[mono(10, { c: C.t4 }), { paddingTop: 9 }]}>Based on 42 recent comps · +$210 profit · 105% ROI</Text>
      </View>
      <View>
        <Text style={kicker}>LIST ON</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingTop: 11 }}>
          {PLATFORMS.map((label, i) => (
            <View key={label} style={[s.platform, i === 0 ? { backgroundColor: A(14), borderColor: A(45) } : null]}>
              <Text style={hk(13, { w: 600, c: i === 0 ? C.a : C.t3 })}>{label}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={[card(), { padding: 16 }]}>
        <Text style={kicker}>PROFIT PREVIEW</Text>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-end', paddingTop: 14 }}>
          <View style={{ flex: 1 }}>
            <Text style={label9}>NET PROFIT</Text>
            <Text style={[bric(28, { lh: 1, c: C.aink }), { paddingTop: 8 }]}>+$210</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={label9}>ROI</Text>
            <Text style={[bric(28, { lh: 1, c: C.t1 }), { paddingTop: 8 }]}>105%</Text>
          </View>
          <View style={s.strong}>
            <Text style={mono(10, { ls: 0.5, c: C.aink })}>STRONG FLIP</Text>
          </View>
        </View>
      </View>
      <PrimaryButton label="Add to inventory" onPress={() => go('inventory')} />
    </View>
  );
}

const s = StyleSheet.create({
  clip: { overflow: 'hidden' },
  search: {
    height: 42, borderRadius: 12, backgroundColor: C.s2, borderWidth: 1, borderColor: L(10),
    flexDirection: 'row', gap: 10, paddingVertical: 11, paddingHorizontal: 13, alignItems: 'center',
  },
  cats: { flexDirection: 'row', gap: 7, paddingVertical: 13, paddingHorizontal: 14 },
  cat: { paddingVertical: 8, paddingHorizontal: 13, borderRadius: 9, borderWidth: 1 },
  profitTag: { position: 'absolute', paddingVertical: 4, paddingHorizontal: 9, borderRadius: 6, backgroundColor: C.aink },
  scoreTag: {
    position: 'absolute', right: 10, top: 10, paddingVertical: 4, paddingHorizontal: 9, borderRadius: 6,
    backgroundColor: 'rgba(8,10,9,0.78)', borderWidth: 1, borderColor: L(10),
    flexDirection: 'row', gap: 5, alignItems: 'center',
  },
  dot6: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.aink },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  risk: { paddingVertical: 2, paddingHorizontal: 7, borderRadius: 5, borderWidth: 1 },
  dealFoot: { flexDirection: 'row', paddingTop: 13, justifyContent: 'space-between', alignItems: 'center' },
  view: { width: 78, height: 37, borderRadius: 9, backgroundColor: C.aink, alignItems: 'center', justifyContent: 'center' },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  box: { flex: 1, padding: 13, ...card() },
  mark: { width: 18, height: 18, borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
  lineRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: L(4),
  },
  segment: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: 12, backgroundColor: C.s1, borderWidth: 1, borderColor: L(6) },
  segItem: { flex: 1, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  flipHead: { flexDirection: 'row', gap: 11, alignItems: 'center', paddingVertical: 13, paddingHorizontal: 14 },
  flipProfit: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 6, backgroundColor: A(14) },
  itemRow: { flexDirection: 'row', gap: 12, alignItems: 'center', padding: 12 },
  thumb54: { width: 54, height: 54, borderRadius: 10 },
  status: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 5 },
  slot: { width: 86, height: 86, borderRadius: 12, borderWidth: 1, borderColor: L(8), alignItems: 'center', justifyContent: 'center' },
  aiTag: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 5, backgroundColor: A(14) },
  platform: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: 9, backgroundColor: C.s1, borderWidth: 1, borderColor: L(8) },
  strong: { paddingVertical: 6, paddingHorizontal: 11, borderRadius: 6, backgroundColor: A(14) },
});
