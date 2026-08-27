import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { Colors } from '@/constants/theme';
import { archivo, geistMono, mono } from '@/constants/type';

/** The three input treatments the prototype uses. */
export type FieldVariant = 'auth' | 'listing' | 'calc';

const VARIANTS: Record<
  FieldVariant,
  { box: TextStyle; text: TextStyle; focus: string; labelGap: number }
> = {
  auth: {
    box: {
      backgroundColor: Colors.surfaceDim,
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: 11,
      paddingHorizontal: 15,
      paddingVertical: 14,
    },
    text: archivo(14, 500, { color: Colors.text }),
    focus: Colors.green,
    labelGap: 7,
  },
  listing: {
    box: {
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: 12,
      paddingHorizontal: 15,
      paddingVertical: 15,
    },
    text: archivo(13.5, 500, { color: Colors.text }),
    focus: Colors.brand,
    labelGap: 8,
  },
  calc: {
    box: {
      backgroundColor: Colors.surfaceDim,
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: 11,
      paddingHorizontal: 14,
      paddingVertical: 13,
    },
    text: mono(14, 600, { color: Colors.text }),
    focus: Colors.green,
    labelGap: 7,
  },
};

type FieldProps = Omit<TextInputProps, 'style'> & {
  label?: string;
  variant?: FieldVariant;
  /** Overrides on the input text itself (size / weight tweaks per screen). */
  textStyle?: StyleProp<TextStyle>;
  boxStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
  /** `letter-spacing` for the mono label, in em. */
  labelLs?: number;
  labelColor?: string;
};

/** Mono uppercase label sitting above a field. */
export function FieldLabel({
  children,
  ls = 0.2,
  color = Colors.muted,
  auth = false,
}: {
  children: React.ReactNode;
  ls?: number;
  color?: string;
  auth?: boolean;
}) {
  return (
    <Text style={auth ? geistMono(11, { lh: 1, ls: 1 / 11, color }) : mono(9, 500, { ls, color })}>
      {children}
    </Text>
  );
}

export function Field({
  label,
  variant = 'auth',
  textStyle,
  boxStyle,
  style,
  labelLs = 0.2,
  labelColor = Colors.muted,
  multiline,
  ...input
}: FieldProps) {
  const [focused, setFocused] = useState(false);
  const v = VARIANTS[variant];

  return (
    <View style={[styles.group, { gap: v.labelGap }, style]}>
      {label ? (
        <FieldLabel ls={labelLs} color={labelColor} auth={variant === 'auth'}>
          {label}
        </FieldLabel>
      ) : null}
      <TextInput
        {...input}
        multiline={multiline}
        onFocus={(e) => {
          setFocused(true);
          input.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          input.onBlur?.(e);
        }}
        placeholderTextColor={Colors.muted}
        selectionColor={Colors.green}
        style={[
          v.box,
          v.text,
          multiline && styles.multiline,
          focused && { borderColor: v.focus },
          boxStyle,
          textStyle,
        ]}
      />
    </View>
  );
}

/**
 * Green-tinted money input with a `$` prefix — the buy/list price fields on
 * Add Listing.
 */
export function MoneyField({
  label,
  value,
  onChangeText,
  strong = false,
  style,
}: {
  label?: string;
  value: string;
  onChangeText: (v: string) => void;
  /** The listing-price field is a touch larger than the buy-price field. */
  strong?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.group, { gap: 8 }, style]}>
      {label ? <FieldLabel color={Colors.sub}>{label}</FieldLabel> : null}
      <View
        style={[
          styles.moneyBox,
          { borderColor: focused ? Colors.brand : strong ? Colors.brandBorder35 : Colors.brandBorder30 },
        ]}>
        <Text style={mono(13, 600, { color: Colors.brand })}>$</Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          keyboardType="decimal-pad"
          selectionColor={Colors.green}
          placeholderTextColor={Colors.muted}
          style={[
            styles.moneyInput,
            archivo(strong ? 16 : 15, 700, { color: Colors.text }),
            { paddingVertical: strong ? 16 : 15 },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { flexDirection: 'column', minWidth: 0 },
  multiline: { minHeight: 88, textAlignVertical: 'top' },
  moneyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: Colors.inputGreen,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  moneyInput: { flex: 1, minWidth: 0, padding: 0 },
});
