import { Text } from 'react-native';

import { Touch } from '@/components/ui/touch';
import { Colors } from '@/constants/theme';
import { archivo } from '@/constants/type';

/** Selectable pill — deal categories and listing platforms. */
export function Chip({
  label,
  active,
  onPress,
  padV = 9,
  padH = 16,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  padV?: number;
  padH?: number;
}) {
  return (
    <Touch
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={{
        paddingVertical: padV,
        paddingHorizontal: padH,
        borderRadius: 20,
        borderWidth: 1,
        backgroundColor: active ? Colors.brand : Colors.chip,
        borderColor: active ? Colors.brand : Colors.border08,
      }}>
      <Text style={archivo(12, 700, { color: active ? Colors.onBrand : Colors.textSoft2 })}>
        {label}
      </Text>
    </Touch>
  );
}
