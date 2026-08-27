import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';

import { FieldLabel } from '@/components/ui/field';
import { Screen } from '@/components/ui/screen';
import { TopBar } from '@/components/ui/top-bar';
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
      <TopBar title="Calculator" onBack={back} style={styles.topBar} />

      <LinearGradient
        colors={['rgba(32,197,101,0.12)', 'rgba(32,197,101,0.02)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.hero}>
        <Text style={mono(9, 500, { ls: 0.24, color: Colors.muted })}>N E T   P R O F I T</Text>
        <Text style={[archivo(44, 900, { ls: -0.03, color: Colors.green }), styles.net]}>
          {`${net >= 0 ? '+' : '-'}${money(Math.abs(net))}`}
        </Text>
        <View style={[styles.verdictPill, { borderColor: verdictColor }]}>
          <Text style={mono(9.5, 700, { ls: 0.16, color: verdictColor })}>{verdict}</Text>
        </View>

        <View style={styles.summary}>
          <Summary label="ROI" value={`${roi.toFixed(1)}%`} color={Colors.green} />
          <Summary label="MARGIN" value={`${margin.toFixed(1)}%`} />
          <Summary label="FEES" value={money(fees)} />
        </View>
      </LinearGradient>

      <View style={styles.formCard}>
        <CalcField
          label="BUY PRICE"
          prefix="$"
          value={calc.buy}
          onChangeText={(buyV) => setCalc({ buy: buyV })}
        />
        <CalcField
          label="SELL PRICE"
          prefix="$"
          value={calc.sell}
          onChangeText={(sellV) => setCalc({ sell: sellV })}
        />
        <View style={styles.gridRow}>
          <CalcField
            label="SHIPPING"
            prefix="$"
            value={calc.ship}
            onChangeText={(shipV) => setCalc({ ship: shipV })}
            style={styles.cell}
          />
          <CalcField
            label="OTHER"
            prefix="$"
            value={calc.other}
            onChangeText={(otherV) => setCalc({ other: otherV })}
            style={styles.cell}
          />
        </View>
        <CalcField
          label="PLATFORM FEE"
          suffix="%"
          value={calc.fee}
          onChangeText={(fee) => setCalc({ fee })}
        />
      </View>
    </Screen>
  );
}

function Summary({ label, value, color = Colors.text }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.summaryTile}>
      <Text style={mono(8, 500, { ls: 0.14, color: Colors.muted })}>{label}</Text>
      <Text style={[archivo(16, 800, { color }), styles.summaryValue]}>{value}</Text>
    </View>
  );
}

function CalcField({
  label,
  prefix,
  suffix,
  value,
  onChangeText,
  style,
}: {
  label: string;
  prefix?: string;
  suffix?: string;
  value: string;
  onChangeText: (value: string) => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.field, style]}>
      <FieldLabel ls={0.14}>{label}</FieldLabel>
      <View style={styles.inputBox}>
        {prefix ? <Text style={mono(13, 500, { color: Colors.muted })}>{prefix}</Text> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
          selectionColor={Colors.green}
          style={styles.input}
        />
        {suffix ? <Text style={mono(13, 500, { color: Colors.muted })}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 0, paddingHorizontal: 20 },
  topBar: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline,
  },

  hero: {
    marginTop: 16,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.greenBorder28,
  },
  net: { marginTop: 6 },
  verdictPill: { borderWidth: 1, borderRadius: 7, paddingVertical: 5, paddingHorizontal: 12, marginTop: 5 },
  summary: { flexDirection: 'row', alignSelf: 'stretch', gap: 8, marginTop: 16 },
  summaryTile: { flex: 1, alignItems: 'center', padding: 4 },
  summaryValue: { marginTop: 5 },

  formCard: {
    gap: 16,
    marginTop: 14,
    padding: 16,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border08,
    borderRadius: 16,
  },
  gridRow: { flexDirection: 'row', gap: 11 },
  cell: { flex: 1 },
  field: { gap: 7, minWidth: 0 },
  inputBox: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 14,
    backgroundColor: Colors.surfaceDim,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 11,
  },
  input: { flex: 1, minWidth: 0, padding: 0, ...mono(14, 600, { color: Colors.text }) },
});
