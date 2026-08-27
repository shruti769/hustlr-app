import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { BoxIcon, ChevronDownIcon } from '@/components/icons';
import { Button, PillButton } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Field, FieldLabel, MoneyField } from '@/components/ui/field';
import { GlowCard } from '@/components/ui/glow-card';
import { PhotoSlot } from '@/components/ui/photo-slot';
import { Screen } from '@/components/ui/screen';
import { TopBar } from '@/components/ui/top-bar';
import { Touch } from '@/components/ui/touch';
import { Colors, FILL } from '@/constants/theme';
import { archivo, mono } from '@/constants/type';
import { PLATFORMS } from '@/data/mock';
import { useBack } from '@/hooks/use-back';
import { num, useApp } from '@/store/app-store';

export default function AddListingScreen() {
  const back = useBack('/inventory');
  const { listing, setListing, resetListingFromAi, platforms, togglePlatform, flash, setTab } = useApp();

  const buy = num(listing.buy);
  const sell = num(listing.sell);
  const profit = sell - buy;
  const roi = buy ? Math.round((profit / buy) * 100) : 0;
  const profitLabel = `${profit >= 0 ? '+$' : '-$'}${Math.abs(profit)}`;
  const roiLabel = `${roi}%`;
  const verdict = roi >= 60 ? 'STRONG FLIP' : roi >= 25 ? 'DECENT FLIP' : 'THIN MARGIN';

  const aiFill = () => {
    resetListingFromAi();
    flash('AI filled from 42 comps');
  };

  const addToInventory = () => {
    flash('Added to inventory');
    setTab('inventory');
    router.replace('/inventory');
  };

  return (
    <Screen contentStyle={styles.content}>
      <TopBar
        title="Add Listing"
        onBack={back}
        titleFlex
        right={<PillButton label="AI Fill" size={12} padV={9} padH={14} radius={9} onPress={aiFill} />}
      />

      <View style={styles.body}>
        <FieldLabel color={Colors.sub}>PHOTOS</FieldLabel>
        <View style={styles.photoGrid}>
          <Touch
            style={styles.addPhoto}
            onPress={() => flash('Photo picker coming soon')}
            accessibilityRole="button"
            accessibilityLabel="Add photo">
            <Text style={archivo(20, 400, { lh: 1, color: Colors.brand })}>+</Text>
            <Text style={mono(8, 600, { ls: 0.14, color: Colors.brand })}>ADD</Text>
          </Touch>

          {[1, 2, 3].map((i) => (
            <PhotoSlot key={i} radius={12} style={styles.photo}>
              <View style={styles.photoLabel} pointerEvents="none">
                <Text style={mono(8, 500, { ls: 0.12, color: Colors.faint })}>PHOTO {i}</Text>
              </View>
              <Touch
                style={styles.photoRemove}
                onPress={() => flash(`Photo ${i} removed`)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`Remove photo ${i}`}>
                <Text style={archivo(11, 500, { color: Colors.subLight })}>×</Text>
              </Touch>
            </PhotoSlot>
          ))}
        </View>

        <Field
          label="ITEM NAME"
          labelColor={Colors.sub}
          variant="listing"
          value={listing.name}
          onChangeText={(name) => setListing({ name })}
          placeholder="e.g. Air Jordan 4 Retro"
          textStyle={archivo(14, 600, { color: Colors.text })}
          style={styles.itemName}
        />

        <View style={styles.pairRow}>
          <Select label="CATEGORY" value="Sneakers" />
          <Select label="CONDITION" value="Used · 9/10" />
        </View>

        <View style={styles.pairRow}>
          <MoneyField
            label="BUY PRICE"
            value={listing.buy}
            onChangeText={(v) => setListing({ buy: v })}
            style={styles.pairCell}
          />
          <Field
            label="SIZE / SPEC"
            labelColor={Colors.sub}
            variant="listing"
            value={listing.size}
            onChangeText={(size) => setListing({ size })}
            style={styles.pairCell}
          />
        </View>

        <View style={styles.listingPriceHead}>
          <FieldLabel color={Colors.sub}>LISTING PRICE</FieldLabel>
          <View style={styles.aiBadge}>
            <Text style={mono(8.5, 700, { ls: 0.12, color: Colors.brand })}>✦ AI SUGGESTED</Text>
          </View>
        </View>
        <MoneyField
          strong
          value={listing.sell}
          onChangeText={(v) => setListing({ sell: v })}
          style={styles.listingPrice}
        />
        <View style={styles.compsRow}>
          <Text style={archivo(10.5, 400, { color: Colors.muted })}>Based on 42 recent comps</Text>
          <Text style={mono(10.5, 600, { color: Colors.brand })}>
            {profitLabel} profit · {roiLabel} ROI
          </Text>
        </View>

        <Text style={[mono(9, 500, { ls: 0.2, color: Colors.sub }), styles.listOn]}>LIST ON</Text>
        <View style={styles.platforms}>
          {PLATFORMS.map((label) => {
            const on = platforms.includes(label);
            return (
              <Chip
                key={label}
                label={on ? `✓ ${label}` : label}
                active={on}
                padV={10}
                padH={15}
                onPress={() => togglePlatform(label)}
              />
            );
          })}
        </View>

        <Field
          label="NOTES"
          labelColor={Colors.sub}
          variant="listing"
          value={listing.notes}
          onChangeText={(notes) => setListing({ notes })}
          placeholder="Condition, extras, flaws…"
          multiline
          textStyle={archivo(12.5, 400, { color: Colors.textSoft })}
          style={styles.notes}
        />

        <GlowCard
          opacity={0.2}
          cx={0.15}
          cy={0.3}
          rx={1.3}
          ry={1.3}
          stop={0.7}
          background={Colors.surface}
          border={Colors.brandBorder22}
          radius={16}
          padding={16}
          style={styles.preview}>
          <Text style={mono(9, 500, { ls: 0.2, color: Colors.sub })}>PROFIT PREVIEW</Text>
          <View style={styles.previewRow}>
            <View>
              <Text style={mono(8.5, 500, { ls: 0.16, color: Colors.sub })}>NET PROFIT</Text>
              <Text style={[archivo(27, 800, { ls: -0.02, color: Colors.brand }), styles.previewValue]}>
                {profitLabel}
              </Text>
            </View>
            <View>
              <Text style={mono(8.5, 500, { ls: 0.16, color: Colors.sub })}>ROI</Text>
              <Text style={[archivo(27, 800, { ls: -0.02, color: Colors.text }), styles.previewValue]}>
                {roiLabel}
              </Text>
            </View>
            <View style={styles.verdictBadge}>
              <Text style={mono(9, 700, { ls: 0.12, color: Colors.brand })}>{verdict}</Text>
            </View>
          </View>
        </GlowCard>

        <Button
          label="Add to inventory"
          radius={13}
          onPress={addToInventory}
          icon={<BoxIcon size={17} color={Colors.onBrand} width={1.9} />}
          style={styles.submit}
        />
      </View>
    </Screen>
  );
}

/** Read-only dropdown row. The prototype's category / condition pickers. */
function Select({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.pairCell}>
      <FieldLabel color={Colors.sub}>{label}</FieldLabel>
      <View style={styles.select}>
        <Text style={archivo(13.5, 500, { color: Colors.text })}>{value}</Text>
        <ChevronDownIcon />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 0 },
  body: { paddingHorizontal: 16 },

  photoGrid: { flexDirection: 'row', gap: 9, marginTop: 10 },
  addPhoto: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.brandBorder50,
    backgroundColor: 'rgba(32,197,101,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  photo: { flex: 1, aspectRatio: 1, borderWidth: 1, borderColor: Colors.border08 },
  photoLabel: { ...FILL, alignItems: 'center', justifyContent: 'center' },
  photoRemove: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: Colors.scrimStrong,
    borderWidth: 1,
    borderColor: Colors.border14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  itemName: { marginTop: 18 },
  pairRow: { flexDirection: 'row', gap: 11, marginTop: 16 },
  pairCell: { flex: 1, minWidth: 0, gap: 8 },
  select: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  listingPriceHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  aiBadge: {
    borderWidth: 1,
    borderColor: Colors.brandBorder40,
    backgroundColor: Colors.greenGlass07,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  listingPrice: { marginTop: 8 },
  compsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 9,
  },

  listOn: { marginTop: 18 },
  platforms: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },

  notes: { marginTop: 18 },
  preview: { marginTop: 18 },
  previewRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 22, marginTop: 12 },
  previewValue: { marginTop: 4 },
  verdictBadge: {
    marginLeft: 'auto',
    borderWidth: 1,
    borderColor: Colors.brandBorder45,
    borderRadius: 9,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  submit: { marginTop: 16 },
});
