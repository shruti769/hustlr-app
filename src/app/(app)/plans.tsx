import { StyleSheet, Text, View } from 'react-native';

import { GlowCard } from '@/components/ui/glow-card';
import { Screen } from '@/components/ui/screen';
import { TopBar } from '@/components/ui/top-bar';
import { Touch } from '@/components/ui/touch';
import { Colors } from '@/constants/theme';
import { archivo, mono } from '@/constants/type';
import { PLANS } from '@/data/mock';
import { useBack } from '@/hooks/use-back';
import { useApp } from '@/store/app-store';

export default function PlansScreen() {
  const back = useBack();
  const { plan, setPlan, flash } = useApp();

  return (
    <Screen contentStyle={styles.content}>
      <TopBar title="Plans" onBack={back} />

      <View style={styles.body}>
        <Text style={[archivo(22, 800, { ls: -0.025, color: Colors.text }), styles.heading]}>
          Choose your weapon
        </Text>
        <Text style={[archivo(12.5, 400, { color: Colors.sub }), styles.subheading]}>
          Every plan pays for itself on one flip.
        </Text>

        <View style={styles.list}>
          {PLANS.map((p) => {
            const current = plan === p.key;
            const cta = current
              ? 'Current plan'
              : p.key === 'Scout'
                ? 'Downgrade to Scout'
                : p.key === 'Hustler'
                  ? 'Upgrade to Hustler'
                  : 'Go Mogul';

            const ctaStyle = current
              ? { backgroundColor: 'transparent', color: Colors.text, borderColor: Colors.border14 }
              : p.popular
                ? { backgroundColor: Colors.brand, color: Colors.onBrand, borderColor: Colors.brand }
                : { backgroundColor: 'transparent', color: Colors.text, borderColor: Colors.border14 };

            const inner = (
              <>
                <Text style={mono(9.5, 600, { ls: 0.22, color: p.popular ? Colors.brand : Colors.sub })}>
                  {p.name}
                </Text>
                <View style={styles.priceRow}>
                  <Text style={archivo(33, 800, { ls: -0.035, color: Colors.text })}>{p.price}</Text>
                  <Text style={archivo(12, 500, { color: Colors.sub })}>/mo</Text>
                </View>
                <Text style={[archivo(12.5, 400, { color: Colors.sub }), styles.tagline]}>{p.tagline}</Text>

                <Touch
                  style={[styles.cta, { backgroundColor: ctaStyle.backgroundColor, borderColor: ctaStyle.borderColor }]}
                  disabled={current}
                  onPress={() => {
                    setPlan(p.key);
                    flash(`${p.key} plan activated`);
                  }}
                  accessibilityRole="button">
                  <Text style={archivo(13.5, 800, { color: ctaStyle.color })}>{cta}</Text>
                </Touch>

                <View style={styles.features}>
                  {p.features.map((f) => (
                    <View key={f} style={styles.featureRow}>
                      <Text style={archivo(12.5, 800, { color: Colors.brand })}>✓</Text>
                      <Text style={[archivo(12.5, 500, { color: Colors.textSoft }), styles.featureText]}>
                        {f}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            );

            return (
              <View key={p.key} style={styles.planWrap}>
                {p.popular ? (
                  <GlowCard
                    opacity={0.16}
                    cx={0.2}
                    cy={0}
                    rx={1.3}
                    ry={1.1}
                    stop={0.7}
                    background={Colors.surfacePlan}
                    border={Colors.brandBorder45}
                    radius={18}
                    padding={20}>
                    {inner}
                  </GlowCard>
                ) : (
                  <View style={styles.planCard}>{inner}</View>
                )}

                {p.popular ? (
                  <View style={styles.popularWrap} pointerEvents="none">
                    <View style={styles.popularBadge}>
                      <Text style={mono(8, 800, { ls: 0.14, color: Colors.onBrand })}>MOST POPULAR</Text>
                    </View>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 0 },
  body: { borderTopWidth: 1, borderTopColor: Colors.hairline, paddingTop: 22, paddingHorizontal: 16 },
  heading: { textAlign: 'center' },
  subheading: { textAlign: 'center', marginTop: 8 },
  list: { gap: 18, marginTop: 22 },

  planWrap: { position: 'relative' },
  planCard: {
    borderRadius: 18,
    padding: 20,
    backgroundColor: Colors.surfaceDim2,
    borderWidth: 1,
    borderColor: Colors.border08,
  },
  popularWrap: { position: 'absolute', top: -11, left: 0, right: 0, alignItems: 'center' },
  popularBadge: {
    backgroundColor: Colors.brand,
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: 20,
  },

  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 5, marginTop: 12 },
  tagline: { marginTop: 7 },
  cta: {
    marginTop: 16,
    borderRadius: 11,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  features: { gap: 11, marginTop: 18 },
  featureRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  featureText: { flex: 1 },
});
