import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { BoltIcon, WarningEmojiIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { PhotoSlot } from '@/components/ui/photo-slot';
import { Screen } from '@/components/ui/screen';
import { TopBar } from '@/components/ui/top-bar';
import { Colors } from '@/constants/theme';
import { archivo, mono } from '@/constants/type';
import { useBack } from '@/hooks/use-back';
import { useApp } from '@/store/app-store';

const VERDICT = [
  { icon: '✓', color: Colors.green, text: 'High demand — 42 comparable sales' },
  { icon: '✓', color: Colors.green, text: 'Priced 38% below market' },
  { icon: 'warning', color: Colors.gold, text: 'Verify authenticity — request box photos' },
];

export default function AnalyserScreen() {
  const back = useBack();
  const { analyse, setAnalyse, runAnalyse } = useApp();

  return (
    <Screen contentStyle={styles.content}>
      <TopBar title="Analyse Listing" onBack={back} style={styles.topBar} />

      <View style={styles.form}>
        <FieldLabel>LISTING URL OR DETAILS</FieldLabel>
        <Field
          variant="calc"
          value={analyse.url}
          onChangeText={(url) => setAnalyse({ url })}
          placeholder="https://facebook.com/marketplace/item/…"
          autoCapitalize="none"
          keyboardType="url"
          textStyle={archivo(12.5, 500, { color: Colors.text })}
        />
        <Field
          variant="calc"
          value={analyse.notes}
          onChangeText={(notes) => setAnalyse({ notes })}
          placeholder="Or paste title, price, condition…"
          multiline
          textStyle={archivo(13, 400, { color: Colors.text })}
        />
        <Button
          label={analyse.loading ? 'Analysing…' : 'Analyse listing'}
          icon={analyse.loading ? undefined : <BoltIcon size={18} color={Colors.onGreen} width={2} />}
          tone="green"
          radius={13}
          padding={15}
          size={14.5}
          onPress={runAnalyse}
          style={styles.cta}
        />
      </View>

      {analyse.done || !analyse.loading ? (
        <Animated.View entering={FadeInDown.duration(350)} style={styles.result}>
          <View style={styles.resultHead}>
            <PhotoSlot radius={10} style={styles.resultPhoto} />
            <View style={styles.resultTitle}>
              <Text style={archivo(17, 800, { color: Colors.text })}>Air Jordan 4 Retro</Text>
              <Text style={[mono(9, 500, { ls: 0.16, color: Colors.muted }), styles.resultMeta]}>
                FB MARKETPLACE · $200 · USED
              </Text>
            </View>
            <View style={styles.scoreBox}>
              <Text style={mono(7, 500, { ls: 0.16, color: Colors.muted })}>SCORE</Text>
              <Text style={[archivo(28, 800, { color: Colors.green }), styles.score]}>8.7</Text>
            </View>
          </View>

          <View style={styles.metrics}>
            <Metric label="RESALE" value="$410" />
            <Metric label="PROFIT" value="+$172" color={Colors.green} divided />
            <Metric label="ROI" value="86%" color={Colors.green} divided />
          </View>

          <View style={styles.verdict}>
            {VERDICT.map((v) => (
              <View key={v.text} style={styles.verdictRow}>
                <View style={styles.verdictIcon}>
                  {v.icon === 'warning' ? (
                    <WarningEmojiIcon size={15} />
                  ) : (
                    <Text style={archivo(12.5, 500, { color: v.color })}>{v.icon}</Text>
                  )}
                </View>
                <Text style={[archivo(12.5, 500, { color: Colors.textSoft2 }), styles.verdictText]}>
                  {v.text}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>
      ) : null}
    </Screen>
  );
}

function Metric({
  label,
  value,
  color = Colors.text,
  divided = false,
}: {
  label: string;
  value: string;
  color?: string;
  divided?: boolean;
}) {
  return (
    <View style={[styles.metric, divided && styles.metricDivider]}>
      <Text style={mono(8, 500, { ls: 0.14, color: Colors.muted })}>{label}</Text>
      <Text style={[archivo(16, 800, { color }), styles.metricValue]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 0, paddingHorizontal: 20 },
  topBar: { marginHorizontal: -20, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: Colors.hairline },
  form: {
    gap: 9,
    marginTop: 20,
    padding: 16,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border08,
    borderRadius: 16,
  },
  cta: { marginTop: 4 },

  result: {
    marginTop: 18,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border08,
    borderRadius: 16,
    overflow: 'hidden',
  },
  resultHead: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 16 },
  resultPhoto: { width: 62, height: 62 },
  resultTitle: { flex: 1, minWidth: 0 },
  resultMeta: { marginTop: 5 },
  scoreBox: {
    alignItems: 'center',
  },
  score: { marginTop: 1 },

  metrics: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.hairlineSoft,
  },
  metric: { flex: 1, paddingVertical: 15, paddingHorizontal: 16 },
  metricDivider: { borderLeftWidth: 1, borderLeftColor: Colors.hairlineSoft },
  metricValue: { marginTop: 5 },

  verdict: { gap: 10, padding: 16 },
  verdictRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  verdictIcon: { width: 15, alignItems: 'center', justifyContent: 'center' },
  verdictText: { flex: 1 },
});
