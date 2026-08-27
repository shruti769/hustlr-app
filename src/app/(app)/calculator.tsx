import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { Field } from '@/components/ui/field';
import { Screen } from '@/components/ui/screen';
import { BackLink } from '@/components/ui/top-bar';
import { Colors } from '@/constants/theme';
import { archivo, mono } from '@/constants/type';
import { useBack } from '@/hooks/use-back';
import { money, num, useApp } from '@/store/app-store';

export default function CalculatorScreen() {
  const back = useBack();
  const { calc, setCalc } = useApp();

  const buy = num(calc.buy);
  const sell = num(calc.sell);
  const ship = num(calc.ship);
  const other = num(calc.other);
  const feePct = num(calc.fee);

  const fees = (sell * feePct) / 100;
  const net = sell - buy - ship - other - fees;
  const cost = buy + ship + other;
  const roi = cost ? (net / cost) * 100 : 0;
  const margin = sell ? (net / sell) * 100 : 0;

  const verdict = roi >= 60 ? 'STRONG FLIP' : roi >= 25 ? 'DECENT FLIP' : roi > 0 ? 'THIN MARGIN' : 'AVOID';
  const verdictColor = roi >= 60 ? Colors.green : roi >= 25 ? Colors.gold : Colors.red;

  return (
    <Screen contentStyle={styles.content}>
      <BackLink onPress={back} />
      <Text style={[archivo(24, 800, { ls: -0.02, color: Colors.text }), styles.title]}>Calculator</Text>

      <LinearGradient
        colors={['rgba(32,197,101,0.12)', 'rgba(32,197,101,0.02)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.hero}>
        <Text style={mono(9, 500, { ls: 0.24, color: Colors.muted })}>N E T   P R O F I T</Text>
        <Text style={[archivo(44, 900, { ls: -0.03, color: Colors.green }), styles.net]}>
          {`${net >= 0 ? '+' : '-'}${money(Math.abs(net))}`}
        </Text>
        <Text style={mono(9.5, 700, { ls: 0.16, color: verdictColor })}>{verdict}</Text>

        <View style={styles.summary}>
          <Summary label="ROI" value={`${roi.toFixed(1)}%`} />
          <Summary label="MARGIN" value={`${margin.toFixed(1)}%`} />
          <Summary label="FEES" value={money(fees)} />
        </View>
      </LinearGradient>

      <View style={styles.grid}>
        <View style={styles.gridRow}>
          <Field
            label="BUY PRICE"
            variant="calc"
            keyboardType="decimal-pad"
            value={calc.buy}
            onChangeText={(buyV) => setCalc({ buy: buyV })}
            style={styles.cell}
          />
          <Field
            label="SELL PRICE"
            variant="calc"
            keyboardType="decimal-pad"
            value={calc.sell}
            onChangeText={(sellV) => setCalc({ sell: sellV })}
            style={styles.cell}
          />
        </View>
        <View style={styles.gridRow}>
          <Field
            label="SHIPPING"
            variant="calc"
            keyboardType="decimal-pad"
            value={calc.ship}
            onChangeText={(shipV) => setCalc({ ship: shipV })}
            style={styles.cell}
          />
          <Field
            label="OTHER"
            variant="calc"
            keyboardType="decimal-pad"
            value={calc.other}
            onChangeText={(otherV) => setCalc({ other: otherV })}
            style={styles.cell}
          />
        </View>
      </View>

      <Field
        label="PLATFORM FEE %"
        variant="calc"
        keyboardType="decimal-pad"
        value={calc.fee}
        onChangeText={(fee) => setCalc({ fee })}
        style={styles.feeField}
      />
    </Screen>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryTile}>
      <Text style={mono(8, 500, { ls: 0.14, color: Colors.muted })}>{label}</Text>
      <Text style={[archivo(14, 700, { color: Colors.text }), styles.summaryValue]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 6, paddingHorizontal: 20 },
  title: { marginTop: 12 },

  hero: {
    marginTop: 16,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.greenBorder28,
  },
  net: { marginTop: 6 },
  summary: { flexDirection: 'row', alignSelf: 'stretch', gap: 8, marginTop: 16 },
  summaryTile: { flex: 1, backgroundColor: 'rgba(8,10,9,0.5)', borderRadius: 11, padding: 10 },
  summaryValue: { marginTop: 3 },

  grid: { gap: 11, marginTop: 18 },
  gridRow: { flexDirection: 'row', gap: 11 },
  cell: { flex: 1 },
  feeField: { marginTop: 14 },
});
