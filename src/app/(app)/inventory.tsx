import { Image, type ImageSource } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { PillButton } from '@/components/ui/button';
import { PhotoSlot } from '@/components/ui/photo-slot';
import { Screen } from '@/components/ui/screen';
import { Colors } from '@/constants/theme';
import { archivo, mono } from '@/constants/type';
import { INVENTORY, type InventoryStatus } from '@/data/mock';
import { useTab } from '@/store/app-store';

const INVENTORY_IMAGES: Record<string, ImageSource> = {
  'AJ4-WHT-10': require('../../../assets/images/deals/air-jordan-1.png'),
  'DYS-V11-02': require('../../../assets/images/deals/dyson.png'),
  'PKM-151-SB': require('../../../assets/images/deals/pokemon.png'),
  'LGO-HOG-71': require('../../../assets/images/deals/lego.png'),
  'NSW-OLED-W': require('../../../assets/images/deals/nintendo-switch.png'),
};

const STATUS: Record<InventoryStatus, { color: string; bg: string }> = {
  SOLD: { color: Colors.green, bg: Colors.greenGlass12 },
  SHIPPED: { color: Colors.blueAlt, bg: Colors.blueGlass },
  LISTED: { color: Colors.gold, bg: Colors.goldGlass12 },
  SOURCED: { color: Colors.muted, bg: Colors.hairlineCard },
};

export default function InventoryScreen() {
  useTab('inventory');

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.header}>
        <Text style={archivo(24, 800, { ls: -0.02, color: Colors.text })}>Inventory</Text>
        <PillButton
          label="+ Add"
          tone="green"
          padV={9}
          padH={14}
          radius={11}
          onPress={() => router.push('/add-listing')}
        />
      </View>

      <View style={styles.totals}>
        <Total label="COST" value="$1,200" />
        <Total label="LISTED" value="$1,807" />
        <Total label="PROFIT" value="+$607" highlight />
      </View>

      <View style={styles.list}>
        {INVENTORY.map((item) => {
          const status = STATUS[item.status];
          return (
            <View key={item.sku} style={styles.row}>
              <PhotoSlot radius={12} style={styles.thumb}>
                <Image
                  source={INVENTORY_IMAGES[item.sku]}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                />
              </PhotoSlot>
              <View style={styles.meta}>
                <Text style={archivo(14, 700, { color: Colors.text })} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={[mono(10, 500, { color: Colors.muted }), styles.sku]}>{item.sku}</Text>
              </View>
              <View style={styles.rowEnd}>
                <Text style={archivo(13.5, 700, { color: Colors.green })}>{item.profit}</Text>
                <View style={[styles.status, { backgroundColor: status.bg }]}>
                  <Text style={mono(9.5, 600, { ls: 0.1, color: status.color })}>{item.status}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

function Total({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={[styles.total, highlight && styles.totalHighlight]}>
      <Text style={mono(8, 500, { ls: 0.16, color: Colors.muted })}>{label}</Text>
      <Text style={[archivo(17, 800, { color: highlight ? Colors.green : Colors.text }), styles.totalValue]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 6, paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: -20,
    paddingHorizontal: 20,
    paddingBottom: 17,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairlineCard,
  },

  totals: { flexDirection: 'row', gap: 9, marginTop: 16 },
  total: {
    flex: 1,
    backgroundColor: Colors.surfaceDim,
    borderWidth: 1,
    borderColor: Colors.border08,
    borderRadius: 13,
    padding: 13,
  },
  totalHighlight: { backgroundColor: Colors.greenGlass09, borderColor: Colors.greenBorder28 },
  totalValue: { marginTop: 5 },

  list: { gap: 10, marginTop: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border08,
    borderRadius: 13,
    padding: 11,
  },
  thumb: { width: 40, height: 40 },
  meta: { flex: 1, minWidth: 0 },
  sku: { marginTop: 3 },
  rowEnd: { alignItems: 'flex-end' },
  status: { marginTop: 4, paddingVertical: 3, paddingHorizontal: 8, borderRadius: 7 },
});
