import { useEffect, useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import {
  CALC_FIELDS, ENTRY_TASKS, KPIS, PLANS, PROFILE_META, PROFILE_STATS, SHOW_PRIZE_DRAW, TOOLS, WINNERS,
} from '../data';
import { PLAN_LABEL, ago, type Analysis, compact, initialsOf, money, monthYear, pct, roi, signed, type Deal } from '../model';
import { billingAvailable, type PaidPlan } from '../billing';
import { LIVE, useHustlr } from '../store';
import { A, C, G, L, bgImage, bric, card, hk, kicker, label9, mono } from '../theme';
import { EmptyNote, Field, Grid2, Photo, Press, Slider } from '../ui';
import { type Img } from '../data';
import { LB, LB_SCOPE, LB_TABS, type LbRow, type LbTab } from '../rewards-data';
import { useRewards } from '../rewards';
import { AreaChart, Avatar, Check, DealBadge } from './main';
import { HoldCalc, NoticeRewardCards, ProfileGamiCard, Skel, holdSlotsOf } from './rewards';

const pad = { paddingTop: 14, paddingHorizontal: 14, paddingBottom: 110 } as const;

const DEMO_CHART = 'M0 70 L40 64 L80 52 L120 58 L160 40 L200 44 L240 26 L280 30 L320 14 L360 8';
const DAY = 86400000;

/** Cumulative sold profit over the last 30 days, as a 360×80 line. */
function profitPath(sold: { soldAt: string | null; buy: number; list: number }[]) {
  const now = Date.now();
  const buckets = Array.from({ length: 10 }, () => 0);
  for (const i of sold) {
    if (!i.soldAt) continue;
    const age = (now - new Date(i.soldAt).getTime()) / DAY;
    if (age < 0 || age >= 30) continue;
    buckets[9 - Math.floor(age / 3)] += i.list - i.buy;
  }
  let run = 0;
  const pts = buckets.map((b) => (run += b));
  const max = Math.max(1, ...pts);
  return pts.map((v, i) => `${i === 0 ? 'M' : 'L'}${i * 40} ${(70 - (Math.max(0, v) / max) * 62).toFixed(1)}`).join(' ');
}

export function Dashboard() {
  const { st, me, openDeal } = useHustlr();
  const since = Date.now() - 30 * DAY;
  const sold30 = me.sold.filter((i) => i.soldAt && new Date(i.soldAt).getTime() >= since);
  const unsold = st.inventory.filter((i) => i.status !== 'Sold');
  const kpis = LIVE
    ? [
        { label: 'PROFIT', value: compact(me.lifetime), delta: `${me.sold.length} SOLD`, fg: C.aink },
        { label: 'DEPLOYED', value: compact(unsold.reduce((n, i) => n + i.buy, 0)), delta: `${unsold.length} ITEMS`, fg: C.aink },
        {
          label: 'LISTINGS', value: String(st.inventory.filter((i) => i.status === 'Listed').length),
          delta: `▲ ${st.inventory.filter((i) => new Date(i.createdAt).getTime() >= since).length}`, fg: C.aink,
        },
        { label: 'AVG ROI', value: me.avgRoi == null ? '—' : `${me.avgRoi}%`, delta: 'SOLD ITEMS', fg: C.t4 },
      ]
    : KPIS;
  const profit30 = LIVE ? money(sold30.reduce((n, i) => n + i.list - i.buy, 0)) : '$12,480';
  return (
    <View style={[pad, { gap: 12 }]}>
      <Grid2 gap={10}>
        {kpis.map((k) => (
          <View key={k.label} style={[card(), { padding: 15, flex: 1 }]}>
            <Text style={label9}>{k.label}</Text>
            <Text style={[bric(22, { lh: 1, c: C.t1 }), { paddingTop: 10, paddingBottom: 7 }]}>{k.value}</Text>
            <Text style={mono(10, { c: k.fg })}>{k.delta}</Text>
          </View>
        ))}
      </Grid2>
      <View style={[card(), { padding: 16 }]}>
        <Text style={kicker}>PROFIT · 30D</Text>
        <Text style={[bric(28, { lh: 1, c: C.aink }), { paddingTop: 10, paddingBottom: 12 }]}>{profit30}</Text>
        <AreaChart d={LIVE ? profitPath(me.sold) : DEMO_CHART} />
      </View>
      <View style={[card(), { padding: 16 }]}>
        <Text style={kicker}>RECENT DEALS</Text>
        {st.deals.slice(0, 4).map((r) => (
          <Press key={r.id} onPress={() => openDeal(r.id)} style={[s.lineRow, { gap: 11, paddingVertical: 12 }]}>
            <Photo src={r.img} style={{ width: 36, height: 36, borderRadius: 8 }} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text numberOfLines={1} style={hk(13.5, { w: 600, c: C.t1 })}>{r.name}</Text>
              <Text style={[mono(10, { c: C.t4 }), { paddingTop: 4 }]}>{r.source}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={mono(12, { w: 600, c: C.aink })}>{signed(r.resale - r.buy)}</Text>
              <Text style={[mono(10.5, { c: C.t4 }), { paddingTop: 4 }]}>{roi(r.buy, r.resale)}</Text>
            </View>
          </Press>
        ))}
      </View>
    </View>
  );
}

export function Calculator() {
  const { st, set } = useHustlr();
  const c = st.calc;
  const net = c.sell - c.buy - c.ship - c.other - (c.sell * c.fee) / 100;
  const profit = (net >= 0 ? '+$' : '-$') + Math.abs(net).toFixed(2);
  const verdict = net > 100 ? 'STRONG FLIP' : net > 30 ? 'WORTH A LOOK' : 'SKIP IT';
  return (
    <View style={[pad, { gap: 14 }]}>
      <View style={[s.calcHero, bgImage(`linear-gradient(140deg, ${A(12)} 0%, ${C.s1} 70%)`)]}>
        <Text style={kicker}>NET PROFIT</Text>
        <Text style={[bric(42, { lh: 1, c: C.aink }), { paddingTop: 10, paddingBottom: 12 }]}>{profit}</Text>
        <View style={[s.pill, { backgroundColor: A(16), alignSelf: 'flex-start' }]}>
          <Text style={mono(10, { ls: 0.5, c: C.aink })}>{verdict}</Text>
        </View>
      </View>
      {CALC_FIELDS.map((f) => (
        <View key={f.key}>
          <View style={s.between}>
            <Text style={kicker}>{f.label}</Text>
            <Text style={mono(13, { w: 600, c: C.t1 })}>{f.key === 'fee' ? `${c.fee}%` : `$${c[f.key]}`}</Text>
          </View>
          <Slider
            min={f.min} max={f.max} step={f.step} value={c[f.key]}
            onChange={(v) => set((x) => ({ calc: { ...x.calc, [f.key]: v } }))}
            style={{ marginTop: 12 }}
          />
        </View>
      ))}
    </View>
  );
}

export function Tracker() {
  const { st, addTracked, removeTracked } = useHustlr();
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const showForm = st.trackForm || (LIVE && st.tracked.length === 0);

  const add = async () => {
    if (busy) return;
    setBusy(true);
    const err = await addTracked(name, toPrice(target));
    setBusy(false);
    if (err) return setError(err);
    setName('');
    setTarget('');
    setError(null);
  };

  return (
    <View style={[pad, { gap: 11 }]}>
      <Text style={kicker}>{LIVE ? st.tracked.length : 5} ITEMS WATCHED · ALERTS ON</Text>
      {showForm && (
        <View style={[card(13, A(25)), { padding: 15, gap: 10 }]}>
          <Text style={label9}>TRACK AN ITEM</Text>
          <Field
            value={name} onChangeText={(v) => { setName(v); setError(null); }} placeholder="e.g. Air Jordan 4 Retro"
            style={{ height: 44, ...hk(13.5, { c: C.t1 }) }}
          />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Field
              value={target} onChangeText={(v) => { setTarget(v); setError(null); }} placeholder="Sell target $"
              keyboardType="decimal-pad" onSubmitEditing={add}
              style={{ flex: 1, height: 44, ...mono(13.5, { c: C.t1 }) }}
            />
            <Press onPress={add} style={s.trackAdd} hover={{ backgroundColor: C.a2 }}>
              <Text style={hk(14, { w: 700, c: C.ona })}>{busy ? 'Adding…' : 'Track'}</Text>
            </Press>
          </View>
          {error ? <Text style={hk(13, { c: C.neg })}>{error}</Text> : (
            <Text style={mono(10, { lh: 15, c: C.t4 })}>We check its resale price every 30 minutes and alert you when it hits your target.</Text>
          )}
        </View>
      )}
      {st.tracked.map((t) => (
        <View key={t.id} style={[card(), { padding: 15 }]}>
          <View style={s.between}>
            <Text style={[hk(14, { w: 600, c: C.t1 }), { flexShrink: 1 }]}>{t.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={mono(12, { c: t.change >= 0 ? C.aink : C.neg })}>{pct(t.change)}</Text>
              {LIVE && (
                <Press onPress={() => removeTracked(t.id)} style={s.remove} hover={{ borderColor: 'rgba(255,92,92,0.5)' }}>
                  <Text style={mono(11, { lh: 1, c: C.t4 })}>✕</Text>
                </Press>
              )}
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 26, paddingTop: 14 }}>
            <View>
              <Text style={label9}>NOW</Text>
              <Text style={[mono(14, { w: 500, c: C.t1 }), { paddingTop: 7 }]}>{t.now > 0 ? money(t.now) : '—'}</Text>
            </View>
            <View>
              <Text style={label9}>TARGET</Text>
              <Text style={[mono(14, { w: 500, c: C.aink }), { paddingTop: 7 }]}>{money(t.target)}</Text>
            </View>
            <View style={{ flex: 1, alignSelf: 'flex-end' }}>
              <View style={s.track}>
                <View style={[s.trackFill, { width: `${(t.pct ?? Math.min(1, t.target > 0 ? t.now / t.target : 0)) * 100}%` }]} />
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

export function Trends() {
  const { st } = useHustlr();
  return (
    <View style={[pad, { gap: 11 }]}>
      <Text style={kicker}>WHAT IS MOVING · LAST 90 DAYS</Text>
      {st.trends.map((t) => (
        <View key={t.name} style={[card(), s.row, { gap: 12, padding: 15 }]}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={hk(14, { w: 600, c: C.t1 })}>{t.name}</Text>
            <Text style={[mono(10, { c: C.t4 }), { paddingTop: 5 }]}>{t.watching}</Text>
          </View>
          <Svg width={76} height={28} viewBox="0 0 76 28" preserveAspectRatio="none">
            <Path d={t.spark} fill="none" stroke={t.change >= 0 ? C.aink : C.neg} strokeWidth={1.6} />
          </Svg>
          <Text style={mono(13, { w: 600, c: t.change >= 0 ? C.aink : C.neg })}>{pct(t.change)}</Text>
        </View>
      ))}
    </View>
  );
}

const DEMO_ANALYSIS: Analysis = {
  title: 'Air Jordan 4 Retro', marketplace: 'Facebook', url: null, imageUrl: null,
  price: 200, cost: 200, resale: 410, fees: 53, shipping: 15, profit: 172, roi: 86,
  badge: 'STEAL', score: 8.7, reason: '', resaleSource: 'sample', sampleSize: 42, by: 'rules',
  checks: [
    { ok: true, text: 'High demand — 42 comparable sales' },
    { ok: true, text: 'Priced 38% below market' },
    { ok: false, text: 'Verify authenticity — request box photos' },
  ],
};

const toPrice = (v: string) => {
  const n = parseFloat(v.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

export function Analyse() {
  const { st, set, go, analyseListing, addInventory } = useHustlr();
  const [url, setUrl] = useState(st.analyseUrl);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [result, setResult] = useState<Analysis | null>(LIVE ? null : DEMO_ANALYSIS);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (st.analyseUrl) set({ analyseUrl: '' });
  }, [st.analyseUrl, set]);

  const run = async () => {
    if (busy) return;
    if (!LIVE) return setResult(DEMO_ANALYSIS);
    if (!url.trim() && !(title.trim() && toPrice(price) > 0)) {
      return setError('Paste a listing link, or add the title and asking price.');
    }
    setBusy(true);
    setError(null);
    setAdded(false);
    const res = await analyseListing({
      url: url.trim() || undefined,
      title: title.trim() || undefined,
      price: toPrice(price) || undefined,
    });
    setBusy(false);
    if (res.error) setError(res.error);
    setResult(res.result ?? null);
  };

  const addToInventory = async () => {
    if (!result || added) return;
    const err = await addInventory({
      dealId: null, name: result.title, category: '', condition: '', sizeSpec: '',
      buy: result.cost, list: Math.round(result.resale), platforms: ['eBay'], status: 'Sourcing',
    });
    if (err) setError(err);
    else setAdded(true);
  };

  const metric = (label: string, value: string, accent?: boolean) => (
    <View style={s.metric}>
      <Text style={label9}>{label}</Text>
      <Text style={[mono(14, { w: accent ? 600 : 500, c: accent ? C.aink : C.t1 }), { paddingTop: 8 }]}>{value}</Text>
    </View>
  );
  const edit = (fn: (v: string) => void) => (v: string) => { fn(v); setError(null); };

  return (
    <View style={[pad, { gap: 14 }]}>
      <View>
        <Text style={kicker}>LISTING URL OR DETAILS</Text>
        <Field
          value={url} onChangeText={edit(setUrl)} placeholder="https://www.ebay.com/itm/…"
          autoCapitalize="none" autoCorrect={false} keyboardType="url" onSubmitEditing={run}
          style={{ marginTop: 11, ...hk(13.5, { c: C.t1 }) }}
        />
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
          <Field
            value={title} onChangeText={edit(setTitle)} placeholder="Or the item title…"
            style={{ flex: 1, borderColor: L(6), ...hk(13.5, { c: C.t1 }) }}
          />
          <Field
            value={price} onChangeText={edit(setPrice)} placeholder="$ price" keyboardType="decimal-pad"
            style={{ width: 96, borderColor: L(6), ...mono(13.5, { c: C.t1 }) }}
          />
        </View>
        <Press onPress={run} style={s.analyseBtn} hover={{ backgroundColor: C.a2 }}>
          <Text style={hk(15, { w: 700, c: C.ona })}>{busy ? 'Analysing…' : 'Analyse listing'}</Text>
        </Press>
        {error ? <Text style={[hk(13, { lh: 18, c: C.neg }), { paddingTop: 10 }]}>{error}</Text> : null}
      </View>

      {result && (
        <View style={[card(), { padding: 16 }]}>
          <View style={[s.between, { alignItems: 'flex-start', gap: 12 }]}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={hk(15, { w: 700, ls: -0.2, c: C.t1 })}>{result.title}</Text>
              <Text style={[mono(10, { c: C.t4 }), { paddingTop: 7 }]}>
                {result.marketplace.toUpperCase()} · {money(result.price)}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <Text style={bric(26, { lh: 1, c: result.badge === 'RISK' ? C.neg : C.aink })}>{result.score.toFixed(1)}</Text>
              <DealBadge badge={result.badge} />
            </View>
          </View>
          {result.reason ? <Text style={[hk(13.5, { lh: 19, c: C.t2 }), { paddingTop: 12 }]}>{result.reason}</Text> : null}
          <View style={{ flexDirection: 'row', gap: 10, paddingTop: 16 }}>
            {metric('RESALE', money(Math.round(result.resale)))}
            {metric('EST. PROFIT', signed(Math.round(result.profit)), result.profit > 0)}
            {metric('ROI', `${result.roi}%`, result.profit > 0)}
          </View>
          <View style={{ gap: 12, paddingTop: 18 }}>
            {result.checks.map((c) => (
              <Check
                key={c.text} monoMark={false} mark={c.ok ? '✓' : '!'} text={c.text}
                bg={c.ok ? A(15) : 'rgba(233,196,106,0.15)'} fg={c.ok ? C.aink : C.goldink}
              />
            ))}
          </View>
          {LIVE && (
            <View style={{ gap: 10, paddingTop: 18 }}>
              {result.url ? (
                <Press onPress={() => Linking.openURL(result.url!)} style={s.analyseBtn}>
                  <Text style={hk(15, { w: 700, c: C.ona })}>View on {result.marketplace} ↗</Text>
                </Press>
              ) : null}
              <Press onPress={added ? () => go('inventory') : addToInventory} style={s.secondaryBtn}>
                <Text style={hk(14, { w: 700, c: C.aink })}>{added ? 'Added · Open inventory' : 'Add to inventory'}</Text>
              </Press>
              <Text style={mono(10, { lh: 15, c: C.t5 })}>
                Estimate from {result.sampleSize} comparable {result.resaleSource.includes('sold') ? 'sales' : 'listings'}, after fees and shipping.
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

export function Leaderboard() {
  const { rs, loadBoard } = useRewards();
  const tab = rs.lbTab;
  const rows: LbRow[] = LIVE ? (rs.lbRows ?? []) : LB[tab];
  const mine = rows.find((b) => b.me);
  return (
    <View style={[pad, { gap: 11 }]}>
      <View style={s.segment}>
        {LB_TABS.map((t) => {
          const on = tab === t;
          return (
            <Press key={t} onPress={() => { if (!on) loadBoard(550, t); }} style={[s.segItem, on && { backgroundColor: C.s2 }]}>
              <Text style={hk(12.5, { w: 700, c: on ? C.t1 : C.t4 })}>{t}</Text>
            </Press>
          );
        })}
      </View>
      <View style={[s.between, { paddingHorizontal: 2 }]}>
        <Text numberOfLines={1} style={[mono(10, { ls: 1.2, c: C.t4 }), { flexShrink: 1 }]}>{LIVE ? LIVE_SCOPE[tab] : LB_SCOPE[tab]}</Text>
        {mine ? <Text style={mono(10, { c: C.aink })}>YOU · #{mine.rank}</Text> : null}
      </View>
      {rs.lbLoading ? (
        <>
          <Skel h={64} />
          <Skel h={64} />
          <Skel h={64} />
          <Skel h={64} style={{ opacity: 0.6 }} />
        </>
      ) : rows.map((b, i) => {
        const lvl = b.me ? rs.level : b.lvl;
        const meta = [lvl != null ? `LVL ${lvl}` : null, b.flips ? `${b.flips} FLIPS` : null].filter(Boolean).join(' · ');
        return (
          <View
            key={b.handle + i}
            style={[s.row, s.boardRow, b.me ? { backgroundColor: A(8), borderColor: A(35) } : { backgroundColor: C.s1, borderColor: L(8) }]}>
            <Text style={[mono(13, { w: 600, c: b.rank === '1' ? C.gold : C.t4 }), { width: 22 }]}>{b.rank}</Text>
            <Avatar initials={b.initials} size={38} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ flexDirection: 'row', gap: 7, alignItems: 'center' }}>
                <Text numberOfLines={1} style={[hk(13.5, { w: 600, c: C.t1 }), { flexShrink: 1 }]}>{b.name}</Text>
                {b.badge ? (
                  <View style={s.lbBadge}>
                    <Text numberOfLines={1} style={mono(8, { ls: 0.5, c: C.goldink })}>{b.badge}</Text>
                  </View>
                ) : null}
              </View>
              <Text numberOfLines={1} style={[mono(10, { c: C.t4 }), { paddingTop: 4 }]}>{b.handle}{meta ? ` · ${meta}` : ''}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={mono(13, { w: 600, c: C.t1 })}>{b.profit}</Text>
              <Text style={[mono(10, { c: C.t4 }), { paddingTop: 4 }]}>{b.streak}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const LIVE_SCOPE: Record<LbTab, string> = {
  Regional: 'YOUR REGION · ALL TIME', Global: 'GLOBAL · ALL TIME', Weekly: 'YOUR REGION · THIS WEEK', Monthly: 'YOUR REGION · THIS MONTH',
};

type HoldRow = { key: string; name: string; source: string; score: string; img: Img; buy: number; sell: number; open: () => void };

export function Watchlist() {
  const { st, openDeal, go } = useHustlr();
  const { rs, pool, goDeal } = useRewards();
  const saved: HoldRow[] = st.watchIds
    .map((id) => st.deals.find((d) => d.id === id))
    .filter((d): d is Deal => !!d)
    .map((d) => ({ key: `d${d.id}`, name: d.name, source: d.source, score: d.score.toFixed(1), img: d.img, buy: d.buy, sell: d.resale, open: () => openDeal(d.id) }));
  const held: HoldRow[] = rs.streamHeld.map((id) => {
    const x = rs.streamItems.find((y) => y.id === id);
    const p = pool[x ? x.p % pool.length : 0];
    return { key: `s${id}`, name: p.name, source: `${p.platform} · ${p.loc.toUpperCase()}`, score: '8.0', img: p.img, buy: p.price, sell: p.resale, open: () => goDeal(p.deal) };
  });
  const all = [...saved, ...held];
  const slots = holdSlotsOf(rs.redeemed);
  return (
    <View style={[pad, { gap: 11 }]}>
      <Text style={kicker}>SAVED DEALS · WATCHING {all.length}</Text>
      <View style={[card(13), s.row, { gap: 12, paddingVertical: 12, paddingHorizontal: 14 }]}>
        <Text style={hk(13, { c: C.t2 })}>Hold Pile · {all.length} / {slots}</Text>
        <View style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: L(8), overflow: 'hidden' }}>
          <View style={{ height: 5, backgroundColor: C.a, width: `${Math.min(100, (all.length / slots) * 100)}%` }} />
        </View>
        <Press onPress={() => go('redeem')}>
          <Text style={mono(10, { c: C.aink })}>{rs.redeemed.hold5 ? '+5 ACTIVE' : '+5 SLOTS'}</Text>
        </Press>
      </View>
      {all.length === 0 && <EmptyNote text="Tap Save on any deal, or Hold in the Live Deal Stream, to watch it here." />}
      {all.map((w, k) => (
        <View key={w.key} style={{ gap: 6 }}>
          <Press onPress={w.open} style={[card(), s.row, { gap: 12, padding: 12 }]} hover={{ borderColor: A(35) }}>
            <Photo src={w.img} style={{ width: 54, height: 54, borderRadius: 10 }} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text numberOfLines={1} style={hk(13.5, { w: 600, c: C.t1 })}>{w.name}</Text>
              <Text numberOfLines={1} style={[mono(10, { c: C.t4 }), { paddingTop: 5 }]}>{w.source}</Text>
            </View>
            <View style={s.scorePill}>
              <View style={s.dot6} />
              <Text style={mono(12, { c: C.t1 })}>{w.score}</Text>
            </View>
            <View style={s.viewBtn}>
              <Text style={hk(13, { w: 700, c: C.ona })}>View</Text>
            </View>
          </Press>
          <HoldCalc k={k} buy={w.buy} sell={w.sell} />
        </View>
      ))}
    </View>
  );
}

export function PrizesScreen() {
  return SHOW_PRIZE_DRAW ? <Prizes /> : <PrizesSoon />;
}

function PrizesSoon() {
  const { st, set, go } = useHustlr();
  return (
    <View style={s.soon}>
      <View style={s.lock}>
        <Svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke={C.t4} strokeWidth={1.5} strokeLinecap="round">
          <Rect x={4} y={10.5} width={16} height={10.5} rx={2.5} />
          <Path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
        </Svg>
      </View>
      <Text style={mono(10, { ls: 1.5, c: C.t4 })}>COMING SOON</Text>
      <Text style={[bric(28, { lh: 32, ls: -0.6, c: C.t1 }), s.center]}>Monthly prize pool</Text>
      <Text style={[hk(14, { lh: 21, c: C.t3 }), s.center, { maxWidth: 300 }]}>
        The $500 cash draw is being finalised. Earn credits in the Arcade now — they will carry over as entries when it launches.
      </Text>
      <Press onPress={() => go('arcade')} style={[s.soonBtn, { marginTop: 8 }]}>
        <Text style={hk(15, { w: 700, c: C.ona })}>Open the Arcade</Text>
      </Press>
      <Press onPress={() => set({ notified: true })} style={s.notify}>
        <Text style={hk(14, { w: 600, c: C.t2 })}>{st.notified ? 'We will alert you at launch ✓' : 'Notify me when it opens'}</Text>
      </Press>
    </View>
  );
}

function Prizes() {
  return (
    <View style={[pad, { gap: 14 }]}>
      <View style={[s.pool, bgImage(`linear-gradient(140deg, rgba(233,196,106,0.14) 0%, ${C.s1} 70%)`)]}>
        <Text style={kicker}>THIS MONTH’S POOL</Text>
        <Text style={[bric(42, { lh: 1, c: C.goldink }), { paddingTop: 12, paddingBottom: 8 }]}>$500</Text>
        <Text style={hk(13.5, { c: C.t3 })}>AUD · paid instantly</Text>
        <View style={[s.pill, { marginTop: 14, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: G(14) }]}>
          <Text style={mono(10, { ls: 0.5, c: C.goldink })}>DRAWS IN 14D 06H 22M</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {[['YOUR ENTRIES', '12'], ['WIN CHANCE', '0.6%']].map(([label, value]) => (
          <View key={label} style={[card(), { flex: 1, padding: 15 }]}>
            <Text style={label9}>{label}</Text>
            <Text style={[bric(26, { lh: 1, c: C.t1 }), { paddingTop: 10 }]}>{value}</Text>
          </View>
        ))}
      </View>
      <View style={[card(), { padding: 16 }]}>
        <Text style={kicker}>EARN MORE ENTRIES</Text>
        {ENTRY_TASKS.map((e) => (
          <View key={e.label} style={[s.lineRow, s.between, { paddingVertical: 12 }]}>
            <Text style={hk(13.5, { c: C.t2 })}>{e.label}</Text>
            <Text style={mono(12, { w: 600, c: C.aink })}>{e.value}</Text>
          </View>
        ))}
      </View>
      <View style={[card(), { padding: 16 }]}>
        <Text style={kicker}>PAST WINNERS</Text>
        {WINNERS.map((w) => (
          <View key={w.name} style={[s.lineRow, { gap: 12, paddingVertical: 12 }]}>
            <Avatar initials={w.initials} size={38} radius={9} font={11} weight={400} border="rgba(233,196,106,0.25)" color={C.goldink} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={hk(13.5, { w: 600, c: C.t1 })}>{w.name}</Text>
              <Text style={[mono(10, { c: C.t4 }), { paddingTop: 4 }]}>{w.meta}</Text>
            </View>
            <Text style={mono(13, { w: 600, c: C.goldink })}>$500</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function Plans() {
  const { st, upgradePlan, restorePurchases } = useHustlr();
  const [note, setNote] = useState<{ error?: string; info?: string }>({});
  const [busy, setBusy] = useState<string | null>(null);
  const current = st.profile.plan;
  const ctaOf = (p: (typeof PLANS)[number]) =>
    !LIVE ? p.cta : busy === p.key ? 'Opening store…' : p.key === current ? 'Current plan' : p.key === 'scout' ? 'Free plan' : p.cta;

  const choose = async (key: string) => {
    if (!LIVE || busy || key === current) return;
    if (key === 'scout') {
      return setNote({ info: 'To go back to Scout, cancel your subscription in your App Store or Google Play settings.' });
    }
    setBusy(key);
    setNote(await upgradePlan(key as PaidPlan));
    setBusy(null);
  };

  const restore = async () => {
    if (busy) return;
    setBusy('restore');
    setNote(await restorePurchases());
    setBusy(null);
  };

  return (
    <View style={[pad, { gap: 14 }]}>
      <View>
        <Text style={bric(28, { lh: 1, ls: -0.6, c: C.t1 })}>Choose your weapon</Text>
        <Text style={[hk(13.5, { c: C.t3 }), { paddingTop: 10 }]}>Every plan pays for itself on one flip.</Text>
      </View>
      {PLANS.map((p) => (
        <View key={p.name} style={[card(14, p.bd), { padding: 18 }]}>
          {p.badge ? (
            <View style={s.badge}>
              <Text style={mono(9, { ls: 0.5, c: C.ona })}>{p.badge}</Text>
            </View>
          ) : null}
          <Text style={mono(11, { ls: 1.5, c: p.fg })}>{p.name}</Text>
          <View style={{ flexDirection: 'row', gap: 5, alignItems: 'baseline', paddingTop: 12, paddingBottom: 6 }}>
            <Text style={bric(42, { lh: 1, c: C.t1 })}>{p.price}</Text>
            <Text style={mono(12, { c: C.t4 })}>/mo</Text>
          </View>
          <Text style={hk(13.5, { c: C.t3 })}>{p.tagline}</Text>
          <Press style={[s.planCta, { backgroundColor: p.ctaBg, borderColor: p.ctaBd }]} onPress={() => choose(p.key)}>
            <Text style={hk(14, { w: 700, c: p.ctaFg })}>{ctaOf(p)}</Text>
          </Press>
          <View style={{ gap: 11, paddingTop: 16 }}>
            {p.features.map((f) => (
              <View key={f} style={{ flexDirection: 'row', gap: 9, alignItems: 'flex-start' }}>
                <Text style={hk(12, { c: C.aink })}>✓</Text>
                <Text style={[hk(13, { lh: 18, c: C.t2 }), { flexShrink: 1 }]}>{f}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
      {note.error || note.info ? (
        <Text style={hk(13, { lh: 18, c: note.error ? C.neg : C.aink })}>{note.error ?? note.info}</Text>
      ) : null}
      {LIVE && (
        <>
          <Press onPress={restore} style={{ alignSelf: 'center', padding: 6 }}>
            {({ hovered }) => (
              <Text style={hk(13.5, { w: 600, c: hovered ? C.aink : C.t3 })}>
                {busy === 'restore' ? 'Restoring…' : 'Restore purchases'}
              </Text>
            )}
          </Press>
          <Text style={[mono(10, { lh: 15, c: C.t5 }), { textAlign: 'center' }]}>
            {billingAvailable
              ? 'Plans renew monthly until cancelled in your App Store or Google Play settings. Payment is charged to your store account.'
              : 'Subscriptions are sold in the HUSTLR iPhone and Android apps.'}
          </Text>
        </>
      )}
    </View>
  );
}

export function Profile() {
  const { st, me, go, signOut } = useHustlr();
  const pr = st.profile;
  const stats = LIVE
    ? [
        { label: 'TOTAL FLIPS', value: String(me.sold.length) },
        { label: 'LIFETIME PROFIT', value: compact(me.lifetime) },
        { label: 'AVG ROI', value: me.avgRoi == null ? '—' : `${me.avgRoi}%` },
        { label: 'STREAK', value: `${st.streak}d` },
      ]
    : PROFILE_STATS;
  const meta = LIVE
    ? [
        { label: 'Email', value: pr.email },
        { label: 'Member since', value: monthYear(pr.memberSince) },
        { label: 'Plan', value: PLAN_LABEL[pr.plan] ?? pr.plan },
        { label: 'Region', value: pr.region },
      ]
    : PROFILE_META;
  return (
    <View style={[pad, { gap: 14 }]}>
      <View style={[card(14), s.row, { gap: 14, padding: 16 }]}>
        <Avatar initials={LIVE ? initialsOf(pr.name) : 'MR'} size={58} radius={14} font={16} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={bric(20, { w: 700, lh: 1, c: C.t1 })}>{pr.name}</Text>
          <Text style={[mono(10, { c: C.t4 }), { paddingTop: 8 }]}>{pr.handle} · rank #{LIVE ? me.rank : 8}</Text>
        </View>
        <View style={[s.pill, { paddingHorizontal: 10, backgroundColor: A(14) }]}>
          <Text style={mono(9, { ls: 0.5, c: C.aink })}>{pr.plan.toUpperCase()} PLAN</Text>
        </View>
      </View>
      <ProfileGamiCard />
      <Grid2 gap={10}>
        {stats.map((x) => (
          <View key={x.label} style={[card(), { padding: 15, flex: 1 }]}>
            <Text style={label9}>{x.label}</Text>
            <Text style={[mono(16, { w: 600, c: C.t1 }), { paddingTop: 10 }]}>{x.value}</Text>
          </View>
        ))}
      </Grid2>
      <View style={[card(), { paddingVertical: 4, paddingHorizontal: 16 }]}>
        {meta.map((m) => (
          <View key={m.label} style={[s.lineRow, s.between, { paddingVertical: 13 }]}>
            <Text style={hk(13.5, { c: C.t3 })}>{m.label}</Text>
            <Text style={hk(13.5, { w: 600, c: C.t1 })}>{m.value}</Text>
          </View>
        ))}
      </View>
      <Grid2 gap={10}>
        {TOOLS.map((t) => (
          <Press key={t.label} onPress={() => go(t.to)} style={[card(12), { padding: 14, flex: 1 }]} hover={{ borderColor: A(40) }}>
            {({ hovered }) => <Text style={hk(13.5, { w: 600, c: hovered ? C.aink : C.t1 })}>{t.label}</Text>}
          </Press>
        ))}
      </Grid2>
      <Press onPress={() => go('plans')} style={[s.wide, { backgroundColor: A(12), borderColor: A(30) }]}>
        <Text style={hk(14, { w: 700, c: C.aink })}>Manage subscription</Text>
      </Press>
      <Press onPress={() => go('prizes')} style={[s.wide, { borderColor: L(8) }]} hover={{ borderColor: 'rgba(233,196,106,0.4)' }}>
        {({ hovered }) => (
          <Text style={hk(14, { w: 600, c: hovered ? C.goldink : C.t2 })}>
            {SHOW_PRIZE_DRAW ? 'Prize entries (12)' : 'Prize draw · coming soon'}
          </Text>
        )}
      </Press>
      <Press onPress={signOut} style={[s.wide, { height: 48, borderWidth: 0 }]}>
        <Text style={hk(14, { w: 600, c: C.neg })}>Log out</Text>
      </Press>
    </View>
  );
}

export function Notifications() {
  const { st, markNoticesRead, openDeal } = useHustlr();
  // Unread styling shows on this visit; the list is marked read as it opens.
  const [unread] = useState(() => new Set(st.notices.filter((n) => !n.read).map((n) => n.id)));
  useEffect(() => { markNoticesRead(); }, [markNoticesRead]);
  return (
    <View style={[pad, { gap: 11 }]}>
      <NoticeRewardCards />
      {st.notices.length === 0 && <EmptyNote text="You're all caught up." />}
      {st.notices.map((n) => (
        <Press
          key={n.id}
          onPress={n.dealId ? () => openDeal(n.dealId!) : undefined}
          style={[card(13, unread.has(n.id) ? A(30) : L(8)), { flexDirection: 'row', gap: 12, alignItems: 'flex-start', padding: 14 }]}
          hover={n.dealId ? { borderColor: A(35) } : undefined}>
          <Photo src={n.img} style={{ width: 42, height: 42, borderRadius: 10 }} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
              <Text style={[hk(13.5, { w: 600, c: C.t1 }), { flexShrink: 1 }]}>{n.title}</Text>
              <Text style={mono(10, { c: C.t4 })}>{ago(n.createdAt)}</Text>
            </View>
            <Text style={[hk(13, { lh: 18, c: C.t3 }), { paddingTop: 6 }]}>{n.body}</Text>
          </View>
        </Press>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  center: { textAlign: 'center' },
  lineRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: L(4) },
  pill: { paddingVertical: 5, paddingHorizontal: 11, borderRadius: 6 },
  calcHero: { padding: 18, borderRadius: 13, borderWidth: 1, borderColor: A(25) },
  track: { height: 4, borderRadius: 2, backgroundColor: L(7), overflow: 'hidden' },
  trackFill: { height: 4, borderRadius: 2, backgroundColor: C.aink },
  metric: { flex: 1, padding: 12, borderRadius: 11, borderWidth: 1, borderColor: L(7) },
  analyseBtn: { marginTop: 14, height: 50, borderRadius: 12, backgroundColor: C.aink, alignItems: 'center', justifyContent: 'center' },
  trackAdd: { height: 44, paddingHorizontal: 20, borderRadius: 12, backgroundColor: C.aink, alignItems: 'center', justifyContent: 'center' },
  remove: {
    width: 26, height: 26, borderRadius: 8, borderWidth: 1, borderColor: L(10),
    alignItems: 'center', justifyContent: 'center',
  },
  secondaryBtn: {
    height: 48, borderRadius: 12, backgroundColor: A(12), borderWidth: 1, borderColor: A(30),
    alignItems: 'center', justifyContent: 'center',
  },
  boardRow: { gap: 12, paddingVertical: 13, paddingHorizontal: 14, borderRadius: 13, borderWidth: 1 },
  segment: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: 12, backgroundColor: C.s1, borderWidth: 1, borderColor: L(6) },
  segItem: { flex: 1, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  lbBadge: { flexShrink: 0, paddingVertical: 2, paddingHorizontal: 6, borderRadius: 5, backgroundColor: G(12) },
  scorePill: {
    flexDirection: 'row', gap: 5, alignItems: 'center', paddingVertical: 4, paddingHorizontal: 9,
    borderRadius: 6, borderWidth: 1, borderColor: L(10),
  },
  dot6: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.aink },
  viewBtn: { paddingVertical: 8, paddingHorizontal: 13, borderRadius: 9, backgroundColor: C.aink },
  soon: { gap: 16, paddingTop: 60, paddingHorizontal: 22, paddingBottom: 110, alignItems: 'center' },
  lock: { width: 66, height: 66, borderRadius: 18, borderWidth: 1, borderColor: L(8), alignItems: 'center', justifyContent: 'center' },
  soonBtn: { height: 50, alignSelf: 'stretch', borderRadius: 13, backgroundColor: C.aink, alignItems: 'center', justifyContent: 'center' },
  notify: { height: 50, alignSelf: 'stretch', borderRadius: 12, borderWidth: 1, borderColor: L(10), alignItems: 'center', justifyContent: 'center' },
  pool: { padding: 20, borderRadius: 13, borderWidth: 1, borderColor: G(30), alignItems: 'center' },
  badge: { position: 'absolute', right: 16, top: -9, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6, backgroundColor: C.aink, zIndex: 1 },
  planCta: { marginTop: 16, height: 46, borderRadius: 11, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  wide: { height: 50, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});

