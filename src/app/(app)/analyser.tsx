import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Screen } from '@/components/ui/screen';
import { BackLink } from '@/components/ui/top-bar';
import { Colors } from '@/constants/theme';
import { archivo, mono } from '@/constants/type';
import { useBack } from '@/hooks/use-back';
import { useApp } from '@/store/app-store';

const VERDICT = [
  { icon: '✓', color: Colors.green, text: 'High demand — 42 comparable sales' },
  { icon: '✓', color: Colors.green, text: 'Priced 38% below market' },
  { icon: '!', color: Colors.gold, text: 'Verify authenticity — request box photos' },
];

export default function AnalyserScreen() {
  const back = useBack();
  const { analyse, setAnalyse, runAnalyse } = useApp();

  return (
    <Screen contentStyle={styles.content}>
      <BackLink onPress={back} />
      <Text style={[archivo(24, 800, { ls: -0.02, color: Colors.text }), styles.title]}>
        Analyse Listing
      </Text>
      <Text style={[archivo(13, 400, { color: Colors.sub }), styles.subtitle]}>
        Paste any listing, get an instant AI verdict.
      </Text>

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
      </View>

      <Button
        label={analyse.loading ? 'Analysing…' : '⚡ Analyse listing'}
        tone="green"
        radius={13}
        padding={15}
        size={14.5}
        onPress={runAnalyse}
        style={styles.cta}
      />

      {analyse.done ? (
        <Animated.View entering={FadeInDown.duration(350)} style={styles.result}>
          <View style={styles.resultHead}>
            <View style={styles.resultTitle}>
              <Text style={archivo(17, 800, { color: Colors.text })}>Air Jordan 4 Retro</Text>
              <Text style={[mono(9, 500, { ls: 0.16, color: Colors.muted }), styles.resultMeta]}>
                FB MARKETPLACE · $200 · USED
              </Text>
            </View>
            <View style={styles.scoreBox}>
              <Text style={mono(16, 800, { color: Colors.green })}>8.7</Text>
              <Text style={mono(7, 500, { ls: 0.16, color: Colors.muted })}>SCORE</Text>
            </View>
          </View>

          <View style={styles.metrics}>
            <Metric label="RESALE" value="$410" />
            <Metric label="PROFIT" value="+$172" color={Colors.green} />
            <Metric label="ROI" value="86%" />
          </View>

          <View style={styles.verdict}>
            {VERDICT.map((v) => (
              <View key={v.text} style={styles.verdictRow}>
                <Text style={archivo(12.5, 500, { color: v.color })}>{v.icon}</Text>
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

function Metric({ label, value, color = Colors.text }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.metric}>
      <Text style={mono(8, 500, { ls: 0.14, color: Colors.muted })}>{label}</Text>
      <Text style={[archivo(16, 800, { color }), styles.metricValue]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 6, paddingHorizontal: 20 },
  title: { marginTop: 12 },
  subtitle: { marginTop: 7 },
  form: { gap: 7, marginTop: 18 },
  cta: { marginTop: 14 },

  result: {
    marginTop: 18,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.greenBorder25,
    borderRadius: 18,
    padding: 16,
  },
  resultHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  resultTitle: { flex: 1, minWidth: 0 },
  resultMeta: { marginTop: 5 },
  scoreBox: {
    alignItems: 'center',
    backgroundColor: Colors.greenGlass12,
    borderWidth: 1,
    borderColor: Colors.greenBorder30,
    borderRadius: 11,
    paddingVertical: 7,
    paddingHorizontal: 11,
  },

  metrics: { flexDirection: 'row', gap: 8, marginTop: 14 },
  metric: { flex: 1, backgroundColor: Colors.surfaceDim, borderRadius: 11, padding: 11 },
  metricValue: { marginTop: 4 },

  verdict: { gap: 7, marginTop: 14 },
  verdictRow: { flexDirection: 'row', gap: 9 },
  verdictText: { flex: 1 },
});
