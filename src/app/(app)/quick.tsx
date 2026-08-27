import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Screen } from '@/components/ui/screen';
import { Touch } from '@/components/ui/touch';
import { Colors } from '@/constants/theme';
import { archivo, mono, screenHeading } from '@/constants/type';
import { useApp } from '@/store/app-store';

export default function QuickAnalyserScreen() {
  const { quick, setQuick, setAnalyse } = useApp();

  const run = () => {
    setAnalyse({ url: '', notes: quick.notes, loading: false, done: true });
    router.replace('/analyser');
  };

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.tabs}>
        <Touch onPress={() => router.replace('/home')} hitSlop={8} accessibilityRole="button">
          <Text style={archivo(12, 700, { color: Colors.muted })}>Home</Text>
        </Touch>
        <View style={styles.tabActive}>
          <Text style={archivo(12, 700, { color: Colors.green })}>Analyser</Text>
        </View>
      </View>

      <Text style={[screenHeading(Colors.text), styles.title]}>
        Quick Listing Analyser
      </Text>
      <Text style={[archivo(13, 400, { color: Colors.sub }), styles.subtitle]}>
        Paste any listing, get an instant AI verdict.
      </Text>

      <Field
        label="ITEM TITLE"
        variant="calc"
        value={quick.title}
        onChangeText={(title) => setQuick({ title })}
        placeholder="e.g. iPhone 14 Pro 256GB"
        textStyle={archivo(13.5, 500, { color: Colors.text })}
        style={styles.first}
      />
      <Field
        label="ASKING PRICE ($)"
        variant="calc"
        value={quick.price}
        onChangeText={(price) => setQuick({ price })}
        placeholder="0"
        keyboardType="decimal-pad"
        textStyle={mono(13.5, 600, { color: Colors.text })}
        style={styles.field}
      />
      <Field
        label="EXTRA NOTES"
        variant="calc"
        value={quick.notes}
        onChangeText={(notes) => setQuick({ notes })}
        placeholder="condition, location, description…"
        multiline
        textStyle={archivo(13, 400, { color: Colors.text })}
        style={styles.field}
      />

      <Button label="⚡ Analyse Deal" radius={12} padding={16} size={14.5} onPress={run} style={styles.cta} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 6, paddingHorizontal: 20 },
  tabs: { flexDirection: 'row', gap: 18, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.green, paddingBottom: 3 },
  title: { marginTop: 16 },
  subtitle: { marginTop: 7 },
  first: { marginTop: 20 },
  field: { marginTop: 14 },
  cta: { marginTop: 18 },
});
