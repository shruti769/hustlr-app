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
  size = 12,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  padV?: number;
  padH?: number;
  size?: number;
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
        backgroundColor: active ? Colors.green : Colors.chip,
        borderColor: active ? Colors.green : Colors.border08,
      }}>
      <Text style={archivo(size, 700, { color: active ? Colors.onGreen : Colors.textSoft2 })}>
        {label}
      </Text>
    </Touch>
  );
}
