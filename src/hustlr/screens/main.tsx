import { Image } from 'expo-image';
import { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { ART, BADGE, CATS, INV_STATS, PLATFORMS, SHORTCUTS, type Badge } from '../data';
import { count, estProfit, invProfit, money, roi, signed, type InvStatus, type ReportReason } from '../model';
import { LIVE, useHustlr } from '../store';
import { A, C, G, L, bgImage, bric, card, hk, kicker, label9, mono, space } from '../theme';
import { pickPhoto } from '../photos';
import { EmptyNote, Field, Grid2, LabeledField, Photo, Press, PrimaryButton } from '../ui';

const pad = { paddingTop: 14, paddingHorizontal: 14, paddingBottom: 110 } as const;

export function Deals() {
  const { st, set, openDeal, reload } = useHustlr();
  const deals = st.cat === 'All' ? st.deals : st.deals.filter((d) => d.category === st.cat);
  const loading = st.dataStatus === 'loading' || st.dataStatus === 'idle';
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
        {deals.length === 0 && st.dataStatus === 'error' && (
          <Press onPress={reload}>
            <EmptyNote text={"Couldn't load deals. Tap to try again."} />
          </Press>
        )}
        {deals.length === 0 && st.dataStatus !== 'error' && (
          <EmptyNote
            text={loading ? 'Loading deals…' : st.deals.length ? `No ${st.cat.toLowerCase()} deals right now.` : 'No deals right now — check back soon.'}
          />
        )}
        {deals.map((d) => (
          <Press key={d.id} onPress={() => openDeal(d.id)} style={[card(14), s.clip]} hover={{ borderColor: A(35) }}>
            <View style={{ height: 124 }}>
              <Photo src={d.img} style={StyleSheet.absoluteFill} />
              <DealBadge badge={d.badge} style={{ position: 'absolute', left: 10, top: 10 }} />
              <View style={s.scoreTag}>
                <View style={s.dot6} />
                <Text style={mono(12, { lh: 1, c: C.t1 })}>{d.score.toFixed(1)}</Text>
              </View>
            </View>
            <View style={{ padding: 14 }}>
              <View style={s.rowTop}>
                <Text style={[hk(15, { w: 700, lh: 1, ls: -0.2, c: C.t1 }), { flexShrink: 1 }]}>{d.name}</Text>
                <View style={s.market}>
                  <Text style={mono(10, { lh: 15, c: C.t2 })}>{d.marketplace}</Text>
                </View>
              </View>
              <Text style={[mono(10, { lh: 1, c: C.t4 }), { paddingTop: 6 }]}>{d.source}</Text>
              <View style={s.dealFoot}>
                <View style={{ flexDirection: 'row', gap: 18 }}>
                  <Stat label="BUY" value={money(d.buy)} />
                  <Stat label="EST. PROFIT" value={signed(Math.round(estProfit(d)))} accent />
                  <Stat label="ROI" value={roi(d.buy, d.buy + estProfit(d))} />
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

const BADGE_INK: Record<Badge, string> = { STEAL: C.ona, CAUTION: '#2A1E04', RISK: C.white };

/** STEAL / CAUTION / RISK chip, filled in the badge colour. */
export function DealBadge({ badge, style }: { badge: Badge; style?: object }) {
  return (
    <View style={[s.badge, { backgroundColor: BADGE[badge] }, style]}>
      <Text style={mono(11, { w: 700, ls: 0.5, lh: 1, c: BADGE_INK[badge] })}>{badge}</Text>
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

const cents = (n: number) => n.toFixed(2);

export function Detail() {
  const { deal: d, go } = useHustlr();
  if (!d) return <View style={pad}><EmptyNote text="This deal is no longer available." /></View>;
  const net = estProfit(d);
  const feePct = d.resale > 0 ? Math.round((d.estFees / d.resale) * 1000) / 10 : 0;
  const breakdown = [
    { label: 'Est. resale', value: money(d.resale), fg: C.t1 },
    { label: 'Buy price', value: '-' + money(d.buy).slice(1), fg: C.t1 },
    { label: `Est. platform fee (${feePct}%)`, value: '-$' + cents(d.estFees), fg: C.t1 },
    { label: 'Est. shipping', value: '-$' + cents(d.estShipping), fg: C.t1 },
    { label: 'Est. net profit', value: (net >= 0 ? '+$' : '-$') + cents(Math.abs(net)), fg: net >= 0 ? C.aink : C.neg },
  ];
  const profit = signed(Math.round(net));
  const openListing = () => { if (d.listingUrl) Linking.openURL(d.listingUrl); };
  return (
    <View style={{ paddingBottom: 110 }}>
      <View style={{ height: 230 }}>
        <Photo src={d.img} style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, bgImage(`linear-gradient(180deg, rgba(8,10,9,0) 40%, ${C.bg} 100%)`)]} />
        <View style={{ position: 'absolute', left: 14, bottom: 14, flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <DealBadge badge={d.badge} style={{ paddingVertical: 6, paddingHorizontal: 11, borderRadius: 7 }} />
          <View style={s.marketTag}>
            <Text style={mono(11, { w: 600, lh: 1, c: C.t1 })}>{d.marketplace}</Text>
          </View>
        </View>
        <View style={{ position: 'absolute', right: 14, bottom: 14, alignItems: 'flex-end' }}>
          <Text style={bric(28, { lh: 1, c: C.t1 })}>{d.score.toFixed(1)}</Text>
          <Text style={mono(9, { ls: 1, c: C.t4 })}>SCORE</Text>
        </View>
      </View>
      <View style={{ gap: 12, paddingTop: 4, paddingHorizontal: 14 }}>
        <View>
          <Text style={hk(20, { w: 700, ls: -0.3, c: C.t1 })}>{d.name}</Text>
          <Text style={[mono(10, { c: C.t4 }), { paddingTop: 7 }]}>{d.source}</Text>
          {d.reason ? <Text style={[hk(13.5, { lh: 19, c: C.t2 }), { paddingTop: 10 }]}>{d.reason}</Text> : null}
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Box label="ASKING" value={money(d.buy)} />
          <Box label="RESALE" value={money(d.resale)} />
          <Box label="EST. PROFIT" value={profit} accent />
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
            {d.verdict.map((v) => (
              <Check
                key={v.text}
                mark={v.ok ? '✓' : '!'}
                text={v.text}
                bg={v.ok ? A(15) : 'rgba(233,196,106,0.15)'}
                fg={v.ok ? C.aink : C.goldink}
              />
            ))}
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
        {d.listingUrl ? (
          <>
            <PrimaryButton label={`View on ${d.marketplace} ↗`} onPress={openListing} />
            <Press onPress={() => go('add')} style={s.secondary}>
              <Text style={hk(14, { w: 700, c: C.aink })}>I bought it · Add to inventory</Text>
            </Press>
          </>
        ) : (
          <PrimaryButton label="Lock this deal" onPress={() => go('add')} />
        )}
        <Text style={[mono(10, { lh: 15, c: C.t5 }), { paddingTop: 2 }]}>
          Profit is an estimate from recent sold prices, after fees and shipping.
          {d.listingUrl ? ` You buy on ${d.marketplace}; HU$TLR may earn a commission from this link.` : ''}
        </Text>
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
  const { set, go } = useHustlr();
  const [link, setLink] = useState('');
  const analyse = () => { set({ analyseUrl: link.trim() }); setLink(''); go('analyse'); };
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
        <Field
          value={link}
          onChangeText={setLink}
          placeholder="https://facebook.com/marketplace/item/…"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          onSubmitEditing={analyse}
          style={{ height: undefined, paddingVertical: 14, borderColor: L(8), ...hk(13.5, { c: C.t1 }) }}
        />
        <PrimaryButton label="Analyse listing" onPress={analyse} height={50} radius={12} size={15} />
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

const REASONS: { key: ReportReason; label: string }[] = [
  { key: 'spam', label: 'Spam' },
  { key: 'scam', label: 'Scam' },
  { key: 'offensive', label: 'Offensive' },
  { key: 'fake', label: 'Fake flip' },
];

export function FlipTok() {
  const { st, reportFlip, blockAuthor, deleteFlip } = useHustlr();
  const [menu, setMenu] = useState<number | null>(null);
  const [reporting, setReporting] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const report = async (id: number, reason: ReportReason) => {
    setMenu(null);
    setReporting(null);
    const err = await reportFlip(id, reason);
    setNotice(err ?? 'Thanks — we’ll review that post. It’s hidden for you now.');
  };
  const block = async (userId: string) => {
    setMenu(null);
    const err = await blockAuthor(userId);
    setNotice(err ?? 'Blocked. You won’t see their posts.');
  };

  return (
    <View style={[pad, { gap: 11 }]}>
      {notice ? (
        <Press onPress={() => setNotice(null)} style={[card(12, A(30)), { padding: 12 }]}>
          <Text style={hk(13, { lh: 18, c: C.aink })}>{notice}</Text>
        </Press>
      ) : null}
      {st.flips.length === 0 && <EmptyNote text="No flips yet. Sell something, then share the win from your inventory." />}
      {st.flips.map((f) => (
        <View key={f.id} style={[card(14), s.clip]}>
          <View style={s.flipHead}>
            <Avatar initials={f.initials} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={hk(13.5, { w: 600, c: C.t1 })}>{f.name}</Text>
              <Text style={[mono(10, { c: C.t4 }), { paddingTop: 4 }]}>{f.handle}</Text>
            </View>
            <View style={s.flipProfit}>
              <Text style={mono(12, { w: 700, c: C.aink })}>{signed(f.sold - f.bought)}</Text>
            </View>
            <Press
              onPress={() => { setMenu(menu === f.id ? null : f.id); setReporting(null); }}
              style={s.more}
              hover={{ borderColor: L(20) }}
              accessibilityLabel="Post options">
              <Text style={mono(13, { w: 700, lh: 1, c: C.t3 })}>⋯</Text>
            </Press>
          </View>
          {menu === f.id && (
            <View style={s.flipMenu}>
              {f.userId && f.userId === st.userId ? (
                <Press onPress={() => { setMenu(null); deleteFlip(f.id); }} style={s.menuChip}>
                  <Text style={hk(13, { w: 600, c: C.neg })}>Delete my post</Text>
                </Press>
              ) : reporting === f.id ? (
                <>
                  <Text style={[label9, { width: '100%' }]}>WHAT’S WRONG?</Text>
                  {REASONS.map((r) => (
                    <Press key={r.key} onPress={() => report(f.id, r.key)} style={s.menuChip} hover={{ borderColor: A(40) }}>
                      <Text style={hk(13, { w: 600, c: C.t1 })}>{r.label}</Text>
                    </Press>
                  ))}
                </>
              ) : (
                <>
                  <Press onPress={() => setReporting(f.id)} style={s.menuChip} hover={{ borderColor: A(40) }}>
                    <Text style={hk(13, { w: 600, c: C.t1 })}>Report post</Text>
                  </Press>
                  {f.userId ? (
                    <Press onPress={() => block(f.userId!)} style={s.menuChip} hover={{ borderColor: 'rgba(255,92,92,0.5)' }}>
                      <Text style={hk(13, { w: 600, c: C.neg })}>Block {f.handle}</Text>
                    </Press>
                  ) : null}
                </>
              )}
            </View>
          )}
          {f.img ? <Photo src={f.img} style={{ height: 210 }} /> : null}
          <View style={{ padding: 14 }}>
            <Text style={hk(13.5, { lh: 20, c: C.t2 })}>{f.copy}</Text>
            <View style={{ flexDirection: 'row', gap: 18, paddingTop: 14 }}>
              <Stat label="BOUGHT" value={money(f.bought)} tight={false} />
              <Stat label="SOLD" value={money(f.sold)} tight={false} />
              <Stat label="ROI" value={roi(f.bought, f.sold)} accent tight={false} />
              <View style={{ flex: 1 }} />
              <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
                <Text style={mono(11, { c: C.t4 })}>♥ {count(f.likes)}</Text>
                <Text style={mono(11, { c: C.t4 })}>↗ {count(f.shares)}</Text>
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

export const STATUS: Record<InvStatus, { bg: string; fg: string }> = {
  Listed: { bg: A(14), fg: C.aink },
  Sold: { bg: L(6), fg: C.t3 },
  Sourcing: { bg: G(14), fg: C.goldink },
};

export function Inventory() {
  const { st, openItem } = useHustlr();
  const items = st.inventory;
  const stats = LIVE
    ? [
        { label: 'COST', value: money(items.reduce((n, i) => n + i.buy, 0)), fg: C.t1 },
        { label: 'LISTED', value: money(items.reduce((n, i) => n + i.list, 0)), fg: C.t1 },
        { label: 'PROFIT', value: signed(items.reduce((n, i) => n + invProfit(i), 0)), fg: C.aink },
      ]
    : INV_STATS;
  return (
    <View style={[pad, { gap: 12 }]}>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {stats.map((x) => (
          <View key={x.label} style={[card(), { flex: 1, padding: 15 }]}>
            <Text style={label9}>{x.label}</Text>
            <Text style={[mono(15, { w: 600, c: x.fg }), { paddingTop: 10 }]}>{x.value}</Text>
          </View>
        ))}
      </View>
      {items.length === 0 && <EmptyNote text="No items yet — tap + Add to log your first flip." />}
      {items.map((i) => (
        <Press key={i.id} onPress={() => openItem(i.id)} style={[card(), s.itemRow]} hover={{ borderColor: A(35) }}>
          <Photo src={i.img} style={s.thumb54} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text numberOfLines={1} style={hk(13.5, { w: 600, c: C.t1 })}>{i.name}</Text>
            <Text style={[mono(10, { c: C.t4 }), { paddingTop: 5 }]}>{i.sku}</Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 6 }}>
            <Text style={mono(12, { w: 600, c: invProfit(i) >= 0 ? C.aink : C.neg })}>{signed(invProfit(i))}</Text>
            <View style={[s.status, { backgroundColor: STATUS[i.status].bg }]}>
              <Text style={mono(9, { ls: 0.5, c: STATUS[i.status].fg })}>{i.status}</Text>
            </View>
          </View>
        </Press>
      ))}
    </View>
  );
}

const toNumber = (v: string) => {
  const n = parseFloat(v.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

export function AddListing() {
  const { deal, go, addInventory } = useHustlr();
  const [name, setName] = useState(deal ? (deal.name === 'Air Jordan 4 Retro' ? "Air Jordan 4 Retro 'White Cement'" : deal.name) : '');
  const [category, setCategory] = useState(deal?.category ?? '');
  const [condition, setCondition] = useState('Used · 9/10');
  const [buy, setBuy] = useState(deal ? String(deal.buy) : '');
  const [size, setSize] = useState(deal?.category === 'Sneakers' ? 'US 10' : '');
  const [list, setList] = useState(deal ? String(deal.resale) : '');
  const [platforms, setPlatforms] = useState(['eBay']);
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const buyN = toNumber(buy);
  const listN = toNumber(list);
  const net = listN - buyN;
  const roiText = roi(buyN, listN);
  const verdict = net > 100 ? 'STRONG FLIP' : net > 30 ? 'WORTH A LOOK' : 'SKIP IT';
  const fields = [
    { label: 'ITEM NAME', value: name, set: setName },
    { label: 'CATEGORY', value: category, set: setCategory },
    { label: 'CONDITION', value: condition, set: setCondition },
    { label: 'BUY PRICE', value: buy, set: setBuy, numeric: true },
    { label: 'SIZE / SPEC', value: size, set: setSize },
  ];

  const save = async () => {
    if (saving) return;
    setSaving(true);
    setError(null);
    const err = await addInventory({
      dealId: deal?.id ?? null, name, category, condition, sizeSpec: size,
      buy: buyN, list: listN, platforms, status: 'Listed', photoUri: photo,
    });
    setSaving(false);
    if (err) setError(err);
    else go('inventory');
  };

  return (
    <View style={[pad, { gap: 18 }]}>
      <View>
        <Text style={kicker}>PHOTOS</Text>
        <View style={{ flexDirection: 'row', gap: 10, paddingTop: 11, alignItems: 'flex-start' }}>
          <Press
            onPress={async () => { const uri = await pickPhoto(); if (uri) setPhoto(uri); }}
            style={[s.slot, { borderStyle: 'dashed', borderColor: A(40) }]}
            hover={{ backgroundColor: A(8) }}>
            <Text style={mono(10, { ls: 1, c: C.aink })}>{photo ? 'CHANGE' : 'ADD'}</Text>
          </Press>
          <Image source={photo ? { uri: photo } : deal?.img ?? ART.addPhoto} contentFit="cover" style={{ width: 84, height: 84, borderRadius: 12 }} />
          <View style={s.slot}><Text style={mono(10, { ls: 1, c: C.t5 })}>PHOTO 2</Text></View>
          <View style={s.slot}><Text style={mono(10, { ls: 1, c: C.t5 })}>PHOTO 3</Text></View>
        </View>
      </View>
      {fields.map((f) => (
        <LabeledField
          key={f.label}
          label={f.label}
          value={f.value}
          onChangeText={f.set}
          keyboardType={f.numeric ? 'decimal-pad' : 'default'}
          gap={9}
          style={{ height: 46 }}
        />
      ))}
      <View>
        <View style={s.between}>
          <Text style={kicker}>LISTING PRICE</Text>
          <View style={s.aiTag}>
            <Text style={mono(9, { ls: 0.5, c: C.aink })}>AI SUGGESTED</Text>
          </View>
        </View>
        <Field
          value={list}
          onChangeText={setList}
          keyboardType="decimal-pad"
          style={{ height: 46, marginTop: 9, borderColor: A(35), ...mono(15, { c: C.t1 }) }}
        />
        <Text style={[mono(10, { c: C.t4 }), { paddingTop: 9 }]}>
          Based on 42 recent comps · {signed(net)} profit · {roiText} ROI
        </Text>
      </View>
      <View>
        <Text style={kicker}>LIST ON</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingTop: 11 }}>
          {PLATFORMS.map((label) => {
            const on = platforms.includes(label);
            return (
              <Press
                key={label}
                onPress={() => setPlatforms((p) => (on ? p.filter((x) => x !== label) : [...p, label]))}
                style={[s.platform, on ? { backgroundColor: A(14), borderColor: A(45) } : null]}>
                <Text style={hk(13, { w: 600, c: on ? C.a : C.t3 })}>{label}</Text>
              </Press>
            );
          })}
        </View>
      </View>
      <View style={[card(), { padding: 16 }]}>
        <Text style={kicker}>PROFIT PREVIEW</Text>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-end', paddingTop: 14 }}>
          <View style={{ flex: 1 }}>
            <Text style={label9}>NET PROFIT</Text>
            <Text style={[bric(28, { lh: 1, c: net >= 0 ? C.aink : C.neg }), { paddingTop: 8 }]}>{signed(net)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={label9}>ROI</Text>
            <Text style={[bric(28, { lh: 1, c: C.t1 }), { paddingTop: 8 }]}>{roiText}</Text>
          </View>
          <View style={s.strong}>
            <Text style={mono(10, { ls: 0.5, c: C.aink })}>{verdict}</Text>
          </View>
        </View>
      </View>
      {error && <Text style={hk(13, { c: C.neg })}>{error}</Text>}
      <PrimaryButton label={saving ? 'Adding…' : 'Add to inventory'} onPress={save} />
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
  market: { paddingVertical: 2, paddingHorizontal: 7, borderRadius: 5, borderWidth: 1, borderColor: L(14) },
  badge: { paddingVertical: 5, paddingHorizontal: 9, borderRadius: 6 },
  marketTag: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 7, backgroundColor: 'rgba(8,10,9,0.78)', borderWidth: 1, borderColor: L(10) },
  secondary: {
    height: 50, borderRadius: 13, backgroundColor: A(12), borderWidth: 1, borderColor: A(30),
    alignItems: 'center', justifyContent: 'center',
  },
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
  more: { width: 30, height: 30, borderRadius: 9, borderWidth: 1, borderColor: L(10), alignItems: 'center', justifyContent: 'center' },
  flipMenu: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 14, paddingBottom: 13 },
  menuChip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 9, borderWidth: 1, borderColor: L(10), backgroundColor: C.s2 },
  itemRow: { flexDirection: 'row', gap: 12, alignItems: 'center', padding: 12 },
  thumb54: { width: 54, height: 54, borderRadius: 10 },
  status: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 5 },
  slot: { width: 86, height: 86, borderRadius: 12, borderWidth: 1, borderColor: L(8), alignItems: 'center', justifyContent: 'center' },
  aiTag: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 5, backgroundColor: A(14) },
  platform: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: 9, backgroundColor: C.s1, borderWidth: 1, borderColor: L(8) },
  strong: { paddingVertical: 6, paddingHorizontal: 11, borderRadius: 6, backgroundColor: A(14) },
});
