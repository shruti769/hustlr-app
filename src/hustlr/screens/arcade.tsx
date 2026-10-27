import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing, useAnimatedStyle, useSharedValue, withTiming, type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

import { ART, LADDER, UPGRADE_DEFS, WHEEL, WHEEL_ODDS } from '../data';
import { until, type StoreItem } from '../model';
import { useHustlr } from '../store';
import { A, C, G, L, bgImage, bric, card, hk, kicker, mono } from '../theme';
import { EmptyNote, Grid2, Press, ScalePress, Slider } from '../ui';

const pad = { paddingTop: 14, paddingHorizontal: 14, paddingBottom: 110 } as const;

function Chevron() {
  return (
    <View style={s.chev}>
      <Svg width={13} height={13} viewBox="0 0 16 16" fill="none" stroke={C.t2} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M6 3.5 10.5 8 6 12.5" />
      </Svg>
    </View>
  );
}

function GameTile({ title, sub, art, tint, border, chip, icon, onPress }: {
  title: string; sub: string; art: number; tint: string; border: string; chip: string; icon: React.ReactNode; onPress: () => void;
}) {
  const ink = tint === 'gold' ? C.goldink : C.aink;
  return (
    <Press
      onPress={onPress}
      style={[s.tile, bgImage(`radial-gradient(150px 130px at 76% 74%, ${tint === 'gold' ? G(14) : A(14)}, rgba(0,0,0,0) 76%)`)]}
      hover={{ borderColor: border }}>
      <Text style={hk(16, { w: 700, lh: 19, ls: -0.3, c: C.t1 })}>{title}</Text>
      <Text style={[hk(12.5, { lh: 17, c: C.t3 }), { paddingTop: 6 }]}>{sub}</Text>
      <View style={s.tileArt}>
        <Image source={art} contentFit="contain" contentPosition="bottom right" style={StyleSheet.absoluteFill} />
      </View>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <View style={[s.tileChip, { backgroundColor: tint === 'gold' ? G(12) : A(12) }]}>
          {icon}
          <Text numberOfLines={1} style={mono(9, { ls: 0.5, c: ink })}>{chip}</Text>
        </View>
        <Chevron />
      </View>
    </Press>
  );
}

export function Arcade() {
  const { st, go, set, checkIn, openFeatured, pawnRate } = useHustlr();
  const [featureW, setFeatureW] = useState(0);
  const streak = st.streak;
  const powerups = Math.floor(st.credits / 250);
  const spendHint = powerups === 0 ? '250 CR unlocks your first powerup' : powerups === 1 ? 'Enough for 1 powerup' : `Enough for ${powerups} powerups`;
  const cta = st.spinsLeft > 0 ? 'Spin Now' : st.checkedIn ? 'Back tomorrow' : 'Check in for a spin';
  const challenges = [
    { label: 'Analyse 3 listings', value: '+15 CR', done: true },
    { label: 'Spin the wheel once', value: '+5 CR', done: true },
    { label: 'Daily check-in', value: '+10 CR', done: st.checkedIn },
    { label: 'Lock in a Price It Right guess', value: '+20 CR', done: st.puzzle?.guess != null },
  ];

  return (
    <View style={{ gap: 14, paddingHorizontal: 14, paddingBottom: 104 }}>
      <View style={{ height: 104 }}>
        <Image source={ART.arcadeHeader} contentFit="contain" style={s.arcadeArt} />
        <Text style={[hk(14, { c: C.t3 }), { position: 'absolute', left: 0, top: 34 }]}>Play. Win. Redeem.</Text>
        <Press onPress={() => go('store')} style={s.storeBtn} hover={{ backgroundColor: C.a2 }}>
          <Svg width={15} height={15} viewBox="0 0 20 20" fill="none" stroke={C.ona} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M4 6.5h12l-1 10.5H5Z" />
            <Path d="M7.4 6.5V5a2.6 2.6 0 0 1 5.2 0v1.5" />
          </Svg>
          <Text style={hk(14, { w: 700, c: C.ona })}>Store</Text>
        </Press>
      </View>

      <View style={[s.wallet, bgImage(`linear-gradient(150deg, ${A(16)} 0%, ${C.s1} 62%)`)]}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={mono(9.5, { ls: 1.5, c: C.t3 })}>ARCADE WALLET</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 11, paddingBottom: 10 }}>
              <Text style={bric(42, { lh: 1, ls: -1.6, c: C.t1 })}>{st.credits}</Text>
              <View style={{ paddingVertical: 5, paddingHorizontal: 10, borderRadius: 9, backgroundColor: A(16) }}>
                <Text style={mono(11, { w: 600, c: C.aink })}>CR</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 7, alignItems: 'center' }}>
              <Svg width={13} height={13} viewBox="0 0 16 16" fill="none" stroke={C.aink} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M8.8 1.6 3.4 9.2h3.6l-0.8 5.2 5.4-7.6H8Z" />
              </Svg>
              <Text style={[hk(13, { c: C.t3 }), { flexShrink: 1 }]}>{spendHint}</Text>
            </View>
          </View>
          <Press onPress={() => go('store')} style={s.topUp} hover={{ backgroundColor: C.a2 }}>
            <View style={s.plus}>
              <Svg width={10} height={10} viewBox="0 0 12 12" fill="none" stroke={C.a} strokeWidth={2} strokeLinecap="round">
                <Path d="M6 2.5v7M2.5 6h7" />
              </Svg>
            </View>
            <Text style={hk(13.5, { w: 700, c: C.ona })}>Top up</Text>
          </Press>
        </View>
        <View style={{ flexDirection: 'row', gap: 9, paddingTop: 16 }}>
          <MiniStat label="STREAK" value={`${streak}d`} icon={
            <Svg width={15} height={15} viewBox="0 0 16 16" fill="none" stroke="#FF8A4C" strokeWidth={1.4} strokeLinejoin="round">
              <Path d="M8 1.5s3.4 2.8 3.4 6.1A3.4 3.4 0 0 1 8 11a3.4 3.4 0 0 1-3.4-3.4C4.6 4.3 8 1.5 8 1.5Z" />
              <Path d="M8 14.5a3 3 0 0 0 3-3c0-1.6-3-3.4-3-3.4S5 9.9 5 11.5a3 3 0 0 0 3 3Z" fill="#FF8A4C" stroke="none" />
            </Svg>
          } />
          <MiniStat label="SPINS" value={String(st.spinsLeft)} icon={
            <Svg width={15} height={15} viewBox="0 0 16 16" fill="none" stroke="#A78BFA" strokeWidth={1.4}>
              <Circle cx={8} cy={8} r={6.2} />
              <Circle cx={8} cy={8} r={2.6} />
            </Svg>
          } />
          <MiniStat label="EARNED · 7D" value="820" icon={
            <Svg width={15} height={15} viewBox="0 0 16 16" fill={C.gold}>
              <Path d="M8 1.6l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.4l-3.8 2 .7-4.3-3.1-3 4.3-.6Z" />
            </Svg>
          } />
        </View>
      </View>

      <View onLayout={(e) => setFeatureW(e.nativeEvent.layout.width - 2)} style={[s.feature, bgImage(`radial-gradient(260px 200px at 82% 55%, ${A(14)}, rgba(32,197,101,0) 72%), linear-gradient(140deg, ${C.s3} 0%, ${C.s1} 70%)`)]}>
        <Image source={ART.prizeSpin} contentFit="contain" style={s.featureArt} />
        <View style={{ gap: 10, padding: 20, width: featureW ? featureW * 0.6 + 40 : '60%' }}>
          <View style={{ flexDirection: 'row', gap: 7, alignItems: 'center' }}>
            <Svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke={C.gold} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M4.6 2.4h6.8v3.2a3.4 3.4 0 0 1-6.8 0Z" />
              <Path d="M4.6 3.4H2.8v1a2 2 0 0 0 1.8 2M11.4 3.4h1.8v1a2 2 0 0 1-1.8 2" />
              <Path d="M8 8.8v2.6M5.8 13.6h4.4" />
            </Svg>
            <Text style={mono(9.5, { w: 600, ls: 1.2, c: C.goldink })}>TOP PRIZE $100 AUD</Text>
          </View>
          <Text style={bric(30, { lh: 1, ls: -0.9, c: C.t1 })}>Prize Spin</Text>
          <Text style={hk(13, { lh: 19, c: C.t3 })}>Eight credit tiers and one cash prize. Spins reset daily.</Text>
          <Press onPress={openFeatured} style={s.featureCta} hover={{ backgroundColor: C.white }}>
            <Text style={hk(14, { w: 700, c: C.bg })}>{cta}</Text>
            <Svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke={C.bg} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M3 8h9" />
              <Path d="M8.5 4.5 12 8l-3.5 3.5" />
            </Svg>
          </Press>
        </View>
      </View>

      <Grid2 gap={12}>
        <GameTile
          title="Price It Right" sub="Guess the real resale value" art={ART.priceIt} tint="a" border={A(36)}
          chip="WEEKLY · 100 CR" onPress={() => go('priceit')}
          icon={
            <Svg width={12} height={12} viewBox="0 0 16 16" fill={C.aink}>
              <Rect x={1.6} y={9} width={3} height={5.4} rx={1} />
              <Rect x={6.5} y={5.6} width={3} height={8.8} rx={1} />
              <Rect x={11.4} y={2.2} width={3} height={12.2} rx={1} />
            </Svg>
          }
        />
        <GameTile
          title="Pawn Empire" sub="Idle shop tycoon" art={ART.pawn} tint="gold" border={G(36)}
          chip={`+$${pawnRate} / TICK`} onPress={() => go('pawn')}
          icon={
            <Svg width={12} height={12} viewBox="0 0 16 16" fill="none" stroke={C.goldink} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M1.8 11.4 6 6.6l3 2.6 4.6-5.4" />
              <Path d="M10.6 3.8h3.2v3.2" />
            </Svg>
          }
        />
      </Grid2>

      <Press onPress={() => set((x) => ({ challengesOpen: !x.challengesOpen }))} style={[card(18), { padding: 16 }]} pressed={{ opacity: 0.94 }}>
        <View style={{ flexDirection: 'row', gap: 13, alignItems: 'center' }}>
          <View style={s.target}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.aink} strokeWidth={1.6}>
              <Circle cx={12} cy={12} r={9} />
              <Circle cx={12} cy={12} r={4.8} />
              <Circle cx={12} cy={12} r={1.2} fill={C.aink} stroke="none" />
            </Svg>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={hk(16, { w: 700, ls: -0.3, c: C.t1 })}>Daily Challenges</Text>
            <Text style={[hk(12.5, { c: C.t3 }), { paddingTop: 6 }]}>Complete challenges. Earn credits.</Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 8 }}>
            <Text style={mono(12, { w: 600, c: C.aink })}>{st.checkedIn ? 3 : 2}/4</Text>
            <View style={s.progress}>
              <View style={[s.progressFill, { width: st.checkedIn ? '75%' : '50%' }]} />
            </View>
          </View>
        </View>
        {st.challengesOpen && (
          <View style={{ paddingTop: 6 }}>
            {challenges.map((c) => (
              <View key={c.label} style={{ flexDirection: 'row', gap: 11, alignItems: 'center', paddingTop: 12 }}>
                <View style={[s.checkbox, c.done ? { backgroundColor: A(16), borderColor: A(34) } : { borderColor: L(12) }]}>
                  <Text style={hk(11, { c: C.aink })}>{c.done ? '✓' : ''}</Text>
                </View>
                <Text style={[hk(13, { c: C.t2 }), { flex: 1, minWidth: 0 }]}>{c.label}</Text>
                <Text style={mono(11, { c: C.t4 })}>{c.value}</Text>
              </View>
            ))}
          </View>
        )}
      </Press>

      <View style={[card(18), { padding: 18 }]}>
        <View style={s.between}>
          <Text style={kicker}>DAILY STREAK</Text>
          <Text style={mono(10, { c: C.t4 })}>+10 CR · +1 SPIN</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 6, paddingTop: 14 }}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label, i) => {
            const done = i < streak;
            return (
              <View key={i} style={[s.day, done ? { backgroundColor: A(14), borderColor: A(32) } : { borderColor: L(8) }]}>
                <Text style={mono(10, { c: done ? C.a : C.t5 })}>{label}</Text>
              </View>
            );
          })}
        </View>
        <Press onPress={checkIn} style={s.checkIn}>
          <Text style={hk(14, { w: 700, c: C.aink })}>{st.checkedIn ? 'Checked in · +10 CR' : 'Check in · +10 CR'}</Text>
        </Press>
      </View>
    </View>
  );
}

function MiniStat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <View style={s.mini}>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        {icon}
        <Text numberOfLines={1} style={mono(8.5, { ls: 1, c: C.t4 })}>{label}</Text>
      </View>
      <Text style={[mono(15, { w: 600, c: C.t1 }), { paddingTop: 9 }]}>{value}</Text>
    </View>
  );
}

export function PriceIt() {
  const { st, set, submitGuess } = useHustlr();
  const pz = st.puzzle;
  if (!pz) {
    return <View style={pad}><EmptyNote text="No item this week — check back Monday." /></View>;
  }
  const guessed = pz.guess != null;
  const guess = pz.guess ?? st.guess;
  const reward = pz.reward ?? 0;
  const win = reward > 0;
  return (
    <View style={[pad, { gap: 14 }]}>
      <View style={s.between}>
        <Text style={kicker}>THIS WEEK · CLOSES IN {until(pz.closesAt)}</Text>
        <Text style={mono(10, { c: C.aink })}>{st.credits} CR</Text>
      </View>
      <View style={[card(14), { overflow: 'hidden' }]}>
        <Image source={pz.img ?? ART.puzzle} contentFit="cover" style={{ height: 230 }} />
        <View style={{ padding: 16 }}>
          <Text style={hk(18, { w: 700, ls: -0.3, c: C.t1 })}>{pz.name}</Text>
          <Text style={[mono(10, { c: C.t4 }), { paddingTop: 8 }]}>{pz.meta}</Text>
        </View>
      </View>
      <View style={[card(14), { padding: 16 }]}>
        <Text style={kicker}>YOUR VALUATION</Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, paddingTop: 14, paddingBottom: 4 }}>
          <Text style={bric(42, { lh: 1, c: C.t1 })}>${guess}</Text>
        </View>
        <Slider
          min={20} max={600} step={5} value={guess}
          onChange={(v) => { if (!guessed) set({ guess: v }); }}
          style={{ marginTop: 14 }}
        />
        <View style={[s.between, { paddingTop: 6 }]}>
          <Text style={mono(10, { c: C.t5 })}>$20</Text>
          <Text style={mono(10, { c: C.t5 })}>$600</Text>
        </View>
        <Press onPress={submitGuess} style={s.cta50}>
          <Text style={hk(15, { w: 700, c: C.ona })}>{guessed ? 'Locked in for this week' : 'Lock in valuation'}</Text>
        </Press>
      </View>
      {guessed && (
        <View style={[card(14, win ? A(35) : L(8)), { padding: 18 }]}>
          <Text style={mono(10, { ls: 1, c: win ? C.a : C.t4 })}>{win ? `+${reward} CREDITS` : 'NO PAYOUT THIS WEEK'}</Text>
          <Text style={[bric(26, { lh: 1, c: C.t1 }), { paddingTop: 12, paddingBottom: 8 }]}>Actual: ${pz.actual}</Text>
          <Text style={hk(13.5, { lh: 20, c: C.t3 })}>You were ${Math.abs(guess - (pz.actual ?? 0))} off. New item drops Monday — streaks multiply your payout.</Text>
        </View>
      )}
      <View style={[card(14), { padding: 16 }]}>
        <Text style={kicker}>PAYOUT LADDER</Text>
        {LADDER.map((l) => (
          <View key={l.label} style={[s.between, s.line, { paddingVertical: 12 }]}>
            <Text style={hk(13.5, { c: C.t2 })}>{l.label}</Text>
            <Text style={mono(12, { w: 600, c: C.aink })}>{l.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function Pawn() {
  const { st, hustle, buyUpgrade, cashOut, pawnRate, pawnClick } = useHustlr();
  return (
    <View style={{ gap: 14, paddingHorizontal: 14, paddingBottom: 110 }}>
      <View style={{ height: 112 }}>
        <Image source={ART.pawn} contentFit="contain" contentPosition="top right" style={s.pawnArt} />
        <Text style={[hk(14, { c: C.t3 }), { position: 'absolute', left: 0, top: 30 }]}>Buy smart. Sell smarter.</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <PawnStat label="CASH" value={`$${st.pawnCash}`} icon={
          <Svg width={17} height={17} viewBox="0 0 20 20" fill="none" stroke={C.gold} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M7.4 2.6h5.2l-1.3 2.2H8.7Z" />
            <Path d="M8.7 4.8C5.9 6 3.6 8.6 3.6 12a5.2 5.2 0 0 0 5.2 5.4h2.4A5.2 5.2 0 0 0 16.4 12c0-3.4-2.3-6-5.1-7.2Z" />
            <Path d="M10 8.9v4.6M8.6 10.2h2.4a1.2 1.2 0 0 1 0 2.4H9" />
          </Svg>
        } />
        <PawnStat label="PER TICK" value={`+$${pawnRate}`} accent icon={
          <Svg width={17} height={17} viewBox="0 0 20 20" fill="none" stroke={C.aink} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M2.6 14.4 7 9.6l3.2 2.8 5-6" />
            <Path d="M12.4 6.4h2.8v2.8" />
            <Path d="M2.6 17.4h14.8" />
          </Svg>
        } />
        <PawnStat label="CREDITS" value={String(st.credits)} icon={<Coins stroke={C.gold} width={1.4} />} />
      </View>

      <ScalePress onPress={hustle} down={0.985} duration={120} style={[s.hustle, bgImage(`linear-gradient(135deg, ${A(22)} 0%, ${A(9)} 55%, ${C.s1} 100%)`)]}>
        <Svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke={C.aink} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M9 11.4V5.6a1.6 1.6 0 0 1 3.2 0v5.2" />
          <Path d="M12.2 10.2a1.5 1.5 0 0 1 3 0v1.2" />
          <Path d="M15.2 11a1.5 1.5 0 0 1 3 0v3.6a5.4 5.4 0 0 1-5.4 5.4h-1.2a5 5 0 0 1-3.6-1.5L5 15.4a1.6 1.6 0 0 1 2.3-2.2L9 14.8" />
          <Path d="M4.4 4.6 3 3.2M10.6 2.6V1M17 4.6 18.4 3.2" />
        </Svg>
        <View style={{ gap: 8 }}>
          <Text style={hk(20, { w: 700, ls: -0.4, c: C.t1 })}>Work the counter</Text>
          <Text style={mono(11, { ls: 1, c: C.aink })}>TAP TO HAGGLE · +${pawnClick}</Text>
        </View>
      </ScalePress>

      <View style={[card(18), { padding: 16 }]}>
        <Text style={mono(10, { ls: 1.5, c: C.t4 })}>SHOP UPGRADES</Text>
        {UPGRADE_DEFS.map((u) => {
          const level = st.levels[u.key] || 0;
          const cost = Math.round(u.base * Math.pow(1.6, level));
          const afford = st.pawnCash >= cost;
          const ink = u.tone === 'gold' ? C.goldink : C.aink;
          const tint = u.tone === 'gold' ? G : A;
          return (
            <View key={u.key} style={[s.upgrade, s.line, { borderBottomColor: L(5) }]}>
              <View style={[s.upTile, { borderColor: tint(22) }, bgImage(`linear-gradient(140deg, ${tint(20)} 0%, ${L(4)} 90%)`)]}>
                <Svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke={ink} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  {u.paths.map((d) => <Path key={d} d={d} />)}
                </Svg>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'baseline' }}>
                  <Text style={hk(15, { w: 700, ls: -0.2, c: C.t1 })}>{u.name}</Text>
                  <Text style={mono(10, { c: C.t4 })}>Lv {level}</Text>
                </View>
                <Text style={[mono(11, { c: C.aink }), { paddingTop: 7 }]}>{u.effect}</Text>
                <Text style={[hk(12.5, { c: C.t3 }), { paddingTop: 6 }]}>{u.desc}</Text>
              </View>
              <Press
                onPress={() => buyUpgrade(u.key, cost)}
                style={[
                  s.buy,
                  afford
                    ? [bgImage(`linear-gradient(135deg, ${C.a2} 0%, ${C.a} 100%)`), { borderColor: 'transparent', boxShadow: `0 6px 18px ${A(26)}` }]
                    : { borderColor: L(10) },
                ]}>
                <Text style={[mono(13, { w: 600, c: afford ? C.ona : C.t5 }), { textAlign: 'center' }]}>${cost}</Text>
              </Press>
            </View>
          );
        })}
      </View>

      <Press onPress={cashOut} style={[s.cashOut, bgImage(`linear-gradient(135deg, ${C.a2} 0%, ${C.a} 100%)`)]}>
        <Coins stroke={C.ona} width={1.5} size={20} />
        <Text style={hk(16, { w: 700, c: C.ona })}>Cash out $1,000 → 100 CR</Text>
      </Press>
    </View>
  );
}

function Coins({ stroke, width, size = 17 }: { stroke: string; width: number; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={stroke} strokeWidth={width}>
      <Ellipse cx={10} cy={5.6} rx={5.4} ry={2.2} />
      <Path d="M4.6 5.6v3.2c0 1.2 2.4 2.2 5.4 2.2s5.4-1 5.4-2.2V5.6" />
      <Path d="M4.6 8.8V12c0 1.2 2.4 2.2 5.4 2.2s5.4-1 5.4-2.2V8.8" />
    </Svg>
  );
}

function PawnStat({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent?: boolean }) {
  return (
    <View style={[card(16), { flex: 1, padding: 14 }]}>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        {icon}
        <Text style={mono(9, { ls: 1, c: C.t4 })}>{label}</Text>
      </View>
      <Text style={[mono(18, { w: 600, c: accent ? C.aink : C.t1 }), { paddingTop: 11 }]}>{value}</Text>
    </View>
  );
}

const WHEEL_SIZE = 292;
const LABEL_R = 98;
const SPIN_EASE = Easing.bezier(0.12, 0.72, 0.06, 1);
const SEG = 360 / WHEEL.length;

/** A wheel label that orbits with the wheel but always stays upright. */
function WheelLabel({ angle, index }: { angle: SharedValue<number>; index: number }) {
  const w = WHEEL[index];
  const base = index * SEG + SEG / 2;
  const style = useAnimatedStyle(() => {
    const phi = ((angle.value + base) * Math.PI) / 180;
    return {
      left: WHEEL_SIZE / 2 + LABEL_R * Math.sin(phi) - 50,
      top: WHEEL_SIZE / 2 - LABEL_R * Math.cos(phi) - 15,
    };
  });
  return (
    <Animated.View pointerEvents="none" style={[s.labelBox, style]}>
      <View style={[s.wheelLabel, w.cash ? { backgroundColor: C.gold } : null]}>
        <Text style={mono(w.cash ? 12 : 12.5, { w: 600, lh: 1, c: w.cash ? 'rgb(56,38,4)' : C.white })}>
          {w.cash ? '$100' : w.label.replace(' CR', '')}
        </Text>
      </View>
    </Animated.View>
  );
}

export function Spin() {
  const { st, spin } = useHustlr();
  const angle = useSharedValue(st.angle);
  useEffect(() => {
    angle.value = withTiming(st.angle, { duration: 3400, easing: SPIN_EASE });
  }, [st.angle, angle]);
  const rot = useAnimatedStyle(() => ({ transform: [{ rotate: `${angle.value}deg` }] }));

  const r = st.spinResult;
  const title = st.spinning ? '…' : r ? (r.cash ? '$100 CASH' : r.label) : 'Give it a spin';
  const body = r ? (r.cash ? 'Verified winner — paid to your account within 24h.' : 'Added to your balance.') : 'Credits buy powerups, badges and themes.';
  const cta = st.spinning ? 'Spinning…' : st.spinsLeft > 0 ? `Spin (1 of ${st.spinsLeft})` : 'Out of spins · check in tomorrow';

  return (
    <View style={{ gap: 16, paddingTop: 18, paddingHorizontal: 14, paddingBottom: 110, alignItems: 'center' }}>
      <View style={[s.between, { alignSelf: 'stretch' }]}>
        <Text style={kicker}>{st.spinsLeft} FREE SPINS TODAY</Text>
        <Text style={mono(10, { c: C.aink })}>{st.credits} CR</Text>
      </View>
      <View style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}>
        <Animated.View style={[StyleSheet.absoluteFill, rot]}>
          <Image source={ART.wheel} contentFit="contain" style={StyleSheet.absoluteFill} accessibilityLabel="Prize wheel" />
        </Animated.View>
        {WHEEL.map((_, i) => <WheelLabel key={i} angle={angle} index={i} />)}
        <View style={s.pointer} />
      </View>
      <View style={{ minHeight: 46, alignItems: 'center' }}>
        <Text style={[bric(22, { lh: 1, c: C.t1 }), { textAlign: 'center' }]}>{title}</Text>
        <Text style={[hk(13, { c: C.t3 }), { paddingTop: 8, textAlign: 'center' }]}>{body}</Text>
      </View>
      <Press onPress={spin} style={[s.cta50, { alignSelf: 'stretch', height: 52, borderRadius: 13, marginTop: 0 }]}>
        <Text style={hk(15, { w: 700, c: C.ona })}>{cta}</Text>
      </Press>
      <View style={[card(14), { alignSelf: 'stretch', padding: 16 }]}>
        <Text style={kicker}>WHEEL ODDS</Text>
        {WHEEL_ODDS.map((w) => (
          <View key={w.label} style={[s.between, s.line, { paddingVertical: 11 }]}>
            <Text style={hk(13, { c: w.fg })}>{w.label}</Text>
            <Text style={mono(11, { c: C.t4 })}>{w.odds}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function groupStore(items: StoreItem[]) {
  const groups: { label: string; items: StoreItem[] }[] = [];
  for (const i of items) {
    const g = groups.find((x) => x.label === i.group);
    if (g) g.items.push(i);
    else groups.push({ label: i.group, items: [i] });
  }
  return groups;
}

export function Store() {
  const { st, buyItem } = useHustlr();
  return (
    <View style={[pad, { gap: 14 }]}>
      <View style={[card(), s.between, { padding: 15 }]}>
        <Text style={kicker}>BALANCE</Text>
        <Text style={mono(15, { w: 600, c: C.aink })}>{st.credits} CR</Text>
      </View>
      {groupStore(st.storeItems).map((g) => (
        <View key={g.label}>
          <Text style={kicker}>{g.label}</Text>
          <View style={{ gap: 10, paddingTop: 11 }}>
            {g.items.map((i) => {
              const owned = st.owned.includes(i.key);
              const afford = st.credits >= i.cost;
              const btn: ViewStyle = {
                backgroundColor: !owned && afford ? A(12) : 'transparent',
                borderColor: owned || !afford ? L(10) : A(30),
              };
              return (
                <View key={i.key} style={[card(13, owned ? A(28) : L(8)), { flexDirection: 'row', gap: 12, alignItems: 'center', padding: 14 }]}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={hk(14, { w: 600, c: C.t1 })}>{i.name}</Text>
                    <Text style={[hk(12.5, { lh: 17, c: C.t3 }), { paddingTop: 6 }]}>{i.desc}</Text>
                  </View>
                  <Press onPress={() => buyItem(i.key, i.cost)} style={[s.storeCta, btn]}>
                    <Text style={mono(11, { c: owned || afford ? C.a : C.t5 })}>{owned ? 'OWNED' : `${i.cost} CR`}</Text>
                  </Press>
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  line: { borderBottomWidth: 1, borderBottomColor: L(4) },
  arcadeArt: { position: 'absolute', right: 104, top: 4, width: 116, height: 96, opacity: 0.95 },
  storeBtn: {
    position: 'absolute', right: 0, top: 22, flexDirection: 'row', gap: 8, alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 17, borderRadius: 14, backgroundColor: C.a,
  },
  wallet: { overflow: 'hidden', padding: 18, borderRadius: 20, borderWidth: 1, borderColor: A(18) },
  topUp: {
    flexDirection: 'row', gap: 8, alignItems: 'center', paddingVertical: 11, paddingHorizontal: 15,
    borderRadius: 14, backgroundColor: C.a,
  },
  plus: { width: 18, height: 18, borderRadius: 9, backgroundColor: C.ona, alignItems: 'center', justifyContent: 'center' },
  mini: { flex: 1, paddingVertical: 12, paddingHorizontal: 11, borderRadius: 14, backgroundColor: L(4), borderWidth: 1, borderColor: L(7) },
  feature: { overflow: 'hidden', minHeight: 208, borderRadius: 20, borderWidth: 1, borderColor: L(9) },
  featureArt: { position: 'absolute', right: -34, top: '50%', marginTop: -108, width: 216, height: 216 },
  featureCta: {
    marginTop: 8, alignSelf: 'flex-start', flexDirection: 'row', gap: 10, alignItems: 'center',
    paddingVertical: 13, paddingHorizontal: 18, borderRadius: 14, backgroundColor: C.t1,
  },
  tile: { flex: 1, overflow: 'hidden', padding: 15, borderRadius: 18, backgroundColor: C.s1, borderWidth: 1, borderColor: L(8) },
  tileArt: { flex: 1, minHeight: 106, overflow: 'hidden', marginVertical: 8 },
  tileChip: { flex: 1, minWidth: 0, flexDirection: 'row', gap: 7, alignItems: 'center', paddingVertical: 7, paddingHorizontal: 10, borderRadius: 9 },
  chev: { width: 30, height: 30, borderRadius: 15, backgroundColor: L(6), borderWidth: 1, borderColor: L(9), alignItems: 'center', justifyContent: 'center' },
  target: { width: 42, height: 42, borderRadius: 13, backgroundColor: A(13), alignItems: 'center', justifyContent: 'center' },
  progress: { width: 74, height: 5, borderRadius: 3, backgroundColor: L(8), overflow: 'hidden' },
  progressFill: { height: 5, borderRadius: 3, backgroundColor: C.a },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  day: { flex: 1, height: 46, borderRadius: 11, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  checkIn: {
    marginTop: 16, height: 48, borderRadius: 12, backgroundColor: A(12), borderWidth: 1, borderColor: A(30),
    alignItems: 'center', justifyContent: 'center',
  },
  cta50: { marginTop: 16, height: 50, borderRadius: 12, backgroundColor: C.aink, alignItems: 'center', justifyContent: 'center' },
  pawnArt: { position: 'absolute', right: -10, top: 0, width: 138, height: 112 },
  hustle: {
    flexDirection: 'row', gap: 16, alignItems: 'center', justifyContent: 'center', height: 94, borderRadius: 18,
    borderWidth: 1, borderColor: A(45), boxShadow: `0 8px 28px ${A(14)}`,
  },
  upgrade: { flexDirection: 'row', gap: 13, alignItems: 'center', paddingVertical: 14 },
  upTile: { width: 58, height: 58, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  buy: { minWidth: 100, paddingVertical: 13, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1 },
  cashOut: {
    flexDirection: 'row', gap: 12, alignItems: 'center', justifyContent: 'center', height: 56, borderRadius: 16,
    boxShadow: `0 10px 30px ${A(38)}`,
  },
  labelBox: { position: 'absolute', width: 100, height: 30, alignItems: 'center', justifyContent: 'center' },
  wheelLabel: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 7, backgroundColor: 'rgba(6,8,7,0.62)' },
  pointer: {
    position: 'absolute', left: WHEEL_SIZE / 2 - 10, top: -4, width: 0, height: 0, zIndex: 3,
    borderLeftWidth: 10, borderRightWidth: 10, borderTopWidth: 18,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: C.gold,
    filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))',
  },
  storeCta: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1 },
});
