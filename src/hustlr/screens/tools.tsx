import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import {
  BOARD, CALC_FIELDS, ENTRY_TASKS, KPIS, NOTIFICATIONS, PLANS, PROFILE_META, PROFILE_STATS,
  RECENT, SHOW_PRIZE_DRAW, TOOLS, TRACKED, TRENDS, WATCH, WINNERS,
} from '../data';
import { useHustlr } from '../store';
import { A, C, G, L, bgImage, bric, card, hk, kicker, label9, mono } from '../theme';
import { Grid2, Photo, Press, Slider } from '../ui';
import { AreaChart, Avatar, Check } from './main';

const pad = { paddingTop: 14, paddingHorizontal: 14, paddingBottom: 110 } as const;

export function Dashboard() {
  return (
    <View style={[pad, { gap: 12 }]}>
      <Grid2 gap={10}>
        {KPIS.map((k) => (
          <View key={k.label} style={[card(), { padding: 15, flex: 1 }]}>
            <Text style={label9}>{k.label}</Text>
            <Text style={[bric(22, { lh: 1, c: C.t1 }), { paddingTop: 10, paddingBottom: 7 }]}>{k.value}</Text>
            <Text style={mono(10, { c: k.fg })}>{k.delta}</Text>
          </View>
        ))}
      </Grid2>
      <View style={[card(), { padding: 16 }]}>
        <Text style={kicker}>PROFIT · 30D</Text>
        <Text style={[bric(28, { lh: 1, c: C.aink }), { paddingTop: 10, paddingBottom: 12 }]}>$12,480</Text>
        <AreaChart d="M0 70 L40 64 L80 52 L120 58 L160 40 L200 44 L240 26 L280 30 L320 14 L360 8" />
      </View>
      <View style={[card(), { padding: 16 }]}>
        <Text style={kicker}>RECENT DEALS</Text>
        {RECENT.map((r) => (
          <View key={r.name} style={[s.lineRow, { gap: 11, paddingVertical: 12 }]}>
            <Photo src={r.img} style={{ width: 36, height: 36, borderRadius: 8 }} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text numberOfLines={1} style={hk(13.5, { w: 600, c: C.t1 })}>{r.name}</Text>
              <Text style={[mono(10, { c: C.t4 }), { paddingTop: 4 }]}>{r.source}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={mono(12, { w: 600, c: C.aink })}>{r.profit}</Text>
              <Text style={[mono(10.5, { c: C.t4 }), { paddingTop: 4 }]}>{r.roi}</Text>
            </View>
          </View>
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
  return (
    <View style={[pad, { gap: 11 }]}>
      <Text style={kicker}>5 ITEMS WATCHED · ALERTS ON</Text>
      {TRACKED.map((t) => (
        <View key={t.name} style={[card(), { padding: 15 }]}>
          <View style={s.between}>
            <Text style={hk(14, { w: 600, c: C.t1 })}>{t.name}</Text>
            <Text style={mono(12, { c: t.fg })}>{t.change}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 26, paddingTop: 14 }}>
            <View>
              <Text style={label9}>NOW</Text>
              <Text style={[mono(14, { w: 500, c: C.t1 }), { paddingTop: 7 }]}>{t.now}</Text>
            </View>
            <View>
              <Text style={label9}>TARGET</Text>
              <Text style={[mono(14, { w: 500, c: C.aink }), { paddingTop: 7 }]}>{t.target}</Text>
            </View>
            <View style={{ flex: 1, alignSelf: 'flex-end' }}>
              <View style={s.track}>
                <View style={[s.trackFill, { width: `${t.pct * 100}%` }]} />
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

export function Trends() {
  return (
    <View style={[pad, { gap: 11 }]}>
      <Text style={kicker}>WHAT IS MOVING · LAST 90 DAYS</Text>
      {TRENDS.map((t) => (
        <View key={t.name} style={[card(), s.row, { gap: 12, padding: 15 }]}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={hk(14, { w: 600, c: C.t1 })}>{t.name}</Text>
            <Text style={[mono(10, { c: C.t4 }), { paddingTop: 5 }]}>{t.watching}</Text>
          </View>
          <Svg width={76} height={28} viewBox="0 0 76 28" preserveAspectRatio="none">
            <Path d={t.path} fill="none" stroke={t.fg} strokeWidth={1.6} />
          </Svg>
          <Text style={mono(13, { w: 600, c: t.fg })}>{t.change}</Text>
        </View>
      ))}
    </View>
  );
}

export function Analyse() {
  const metric = (label: string, value: string, accent?: boolean) => (
    <View style={s.metric}>
      <Text style={label9}>{label}</Text>
      <Text style={[mono(14, { w: accent ? 600 : 500, c: accent ? C.aink : C.t1 }), { paddingTop: 8 }]}>{value}</Text>
    </View>
  );
  return (
    <View style={[pad, { gap: 14 }]}>
      <View>
        <Text style={kicker}>LISTING URL OR DETAILS</Text>
        <View style={[card(12, L(10)), { marginTop: 11, padding: 14 }]}>
          <Text style={hk(13.5, { c: C.t1 })}>https://facebook.com/marketplace/item/…</Text>
        </View>
        <View style={[card(12, L(6)), { marginTop: 10, padding: 14 }]}>
          <Text style={hk(13.5, { c: C.t4 })}>Or paste title, price, condition…</Text>
        </View>
        <View style={s.analyseBtn}>
          <Text style={hk(15, { w: 700, c: C.ona })}>Analyse listing</Text>
        </View>
      </View>
      <View style={[card(), { padding: 16 }]}>
        <View style={[s.between, { alignItems: 'flex-start' }]}>
          <View>
            <Text style={hk(15, { w: 700, ls: -0.2, c: C.t1 })}>Air Jordan 4 Retro</Text>
            <Text style={[mono(10, { c: C.t4 }), { paddingTop: 7 }]}>FB MARKETPLACE · $200 · USED</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={bric(26, { lh: 1, c: C.aink })}>8.7</Text>
            <Text style={[label9, { paddingTop: 5 }]}>SCORE</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 10, paddingTop: 16 }}>
          {metric('RESALE', '$410')}
          {metric('PROFIT', '+$172', true)}
          {metric('ROI', '86%', true)}
        </View>
        <View style={{ gap: 12, paddingTop: 18 }}>
          <Check monoMark={false} mark="✓" text="High demand — 42 comparable sales" bg={A(15)} fg={C.aink} />
          <Check monoMark={false} mark="✓" text="Priced 38% below market" bg={A(15)} fg={C.aink} />
          <Check monoMark={false} mark="!" text="Verify authenticity — request box photos" bg="rgba(233,196,106,0.15)" fg={C.goldink} />
        </View>
      </View>
    </View>
  );
}

export function Leaderboard() {
  return (
    <View style={[pad, { gap: 11 }]}>
      {BOARD.map((b) => (
        <View
          key={b.rank}
          style={[s.row, s.boardRow, b.me ? { backgroundColor: A(8), borderColor: A(35) } : { backgroundColor: C.s1, borderColor: L(8) }]}>
          <Text style={[mono(13, { w: 600, c: b.rank === '1' ? C.gold : C.t4 }), { width: 22 }]}>{b.rank}</Text>
          <Avatar initials={b.initials} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={hk(13.5, { w: 600, c: C.t1 })}>{b.name}</Text>
            <Text style={[mono(10, { c: C.t4 }), { paddingTop: 4 }]}>{b.handle}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={mono(13, { w: 600, c: C.t1 })}>{b.profit}</Text>
            <Text style={[mono(10, { c: C.t4 }), { paddingTop: 4 }]}>{b.streak}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

export function Watchlist() {
  const { openDeal } = useHustlr();
  return (
    <View style={[pad, { gap: 11 }]}>
      <Text style={kicker}>SAVED DEALS · WATCHING 4</Text>
      {WATCH.map((w) => (
        <Press key={w.name} onPress={() => openDeal(w.i)} style={[card(), s.row, { gap: 12, padding: 12 }]} hover={{ borderColor: A(35) }}>
          <Photo src={w.img} style={{ width: 54, height: 54, borderRadius: 10 }} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text numberOfLines={1} style={hk(13.5, { w: 600, c: C.t1 })}>{w.name}</Text>
            <Text style={[mono(10, { c: C.t4 }), { paddingTop: 5 }]}>{w.source}</Text>
          </View>
          <View style={s.scorePill}>
            <View style={s.dot6} />
            <Text style={mono(12, { c: C.t1 })}>{w.score}</Text>
          </View>
          <View style={s.viewBtn}>
            <Text style={hk(13, { w: 700, c: C.ona })}>View</Text>
          </View>
        </Press>
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
          <Press style={[s.planCta, { backgroundColor: p.ctaBg, borderColor: p.ctaBd }]} onPress={() => {}}>
            <Text style={hk(14, { w: 700, c: p.ctaFg })}>{p.cta}</Text>
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
    </View>
  );
}

export function Profile() {
  const { go, goLogin } = useHustlr();
  return (
    <View style={[pad, { gap: 14 }]}>
      <View style={[card(14), s.row, { gap: 14, padding: 16 }]}>
        <Avatar initials="MR" size={58} radius={14} font={16} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={bric(20, { w: 700, lh: 1, c: C.t1 })}>Mason Reid</Text>
          <Text style={[mono(10, { c: C.t4 }), { paddingTop: 8 }]}>@mrhustle · rank #8</Text>
        </View>
        <View style={[s.pill, { paddingHorizontal: 10, backgroundColor: A(14) }]}>
          <Text style={mono(9, { ls: 0.5, c: C.aink })}>HUSTLER PLAN</Text>
        </View>
      </View>
      <Grid2 gap={10}>
        {PROFILE_STATS.map((x) => (
          <View key={x.label} style={[card(), { padding: 15, flex: 1 }]}>
            <Text style={label9}>{x.label}</Text>
            <Text style={[mono(16, { w: 600, c: C.t1 }), { paddingTop: 10 }]}>{x.value}</Text>
          </View>
        ))}
      </Grid2>
      <View style={[card(), { paddingVertical: 4, paddingHorizontal: 16 }]}>
        {PROFILE_META.map((m) => (
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
      <Press onPress={goLogin} style={[s.wide, { height: 48, borderWidth: 0 }]}>
        <Text style={hk(14, { w: 600, c: C.neg })}>Log out</Text>
      </Press>
    </View>
  );
}

export function Notifications() {
  return (
    <View style={[pad, { gap: 11 }]}>
      {NOTIFICATIONS.map((n) => (
        <View key={n.title} style={[card(), { flexDirection: 'row', gap: 12, alignItems: 'flex-start', padding: 14 }]}>
          <Photo src={n.img} style={{ width: 42, height: 42, borderRadius: 10 }} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
              <Text style={[hk(13.5, { w: 600, c: C.t1 }), { flexShrink: 1 }]}>{n.title}</Text>
              <Text style={mono(10, { c: C.t4 })}>{n.time}</Text>
            </View>
            <Text style={[hk(13, { lh: 18, c: C.t3 }), { paddingTop: 6 }]}>{n.body}</Text>
          </View>
        </View>
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
  boardRow: { gap: 12, paddingVertical: 13, paddingHorizontal: 14, borderRadius: 13, borderWidth: 1 },
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

