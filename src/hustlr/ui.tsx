import { Image } from 'expo-image';
import { Children, useRef, useState, type ReactNode } from 'react';
import {
  PanResponder, Platform, Pressable, StyleSheet, Text, TextInput, View,
  type StyleProp, type TextInputProps, type TextStyle, type ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';

import type { Img } from './data';
import { C, L, hk, kicker } from './theme';

type PressProps = {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  /** Applied on web hover — the prototype's `style-hover`. */
  hover?: ViewStyle;
  /** Applied while a finger is down. Defaults to a light dim. */
  pressed?: ViewStyle;
  children?: ReactNode | ((s: { hovered: boolean; pressed: boolean }) => ReactNode);
  disabled?: boolean;
};

/** A tappable block that mirrors the prototype's hover and active styles. */
export function Press({ onPress, style, hover, pressed = { opacity: 0.86 }, children, disabled }: PressProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      style={(s) => {
        const hovered = (s as { hovered?: boolean }).hovered;
        return [style, hovered && hover, s.pressed && pressed, Platform.OS === 'web' && styles.pointer];
      }}>
      {(s) => (typeof children === 'function' ? children({ hovered: !!(s as { hovered?: boolean }).hovered, pressed: s.pressed }) : children)}
    </Pressable>
  );
}

const SCALE_EASE = Easing.bezier(0.25, 0.1, 0.25, 1);

/** Tappable that eases its scale on press / hover, like the CSS `transition: transform`. */
export function ScalePress({
  onPress, style, children, down, over = 1, duration,
}: { onPress?: () => void; style?: StyleProp<ViewStyle>; children: ReactNode; down: number; over?: number; duration: number }) {
  const scale = useSharedValue(1);
  const hovered = useRef(false);
  const to = (v: number) => { scale.value = withTiming(v, { duration, easing: SCALE_EASE }); };
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => to(down)}
      onPressOut={() => to(hovered.current ? over : 1)}
      onHoverIn={() => { hovered.current = true; to(over); }}
      onHoverOut={() => { hovered.current = false; to(1); }}
      style={Platform.OS === 'web' ? styles.pointer : undefined}>
      <Animated.View style={[style, anim]}>{children}</Animated.View>
    </Pressable>
  );
}

/** Two equal columns with a gap — CSS `grid-template-columns: repeat(2, 1fr)`. */
export function Grid2({ gap, children, style }: { gap: number; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const items = Children.toArray(children);
  const rows: ReactNode[][] = [];
  for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2));
  return (
    <View style={[{ gap }, style]}>
      {rows.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row', gap, alignItems: 'stretch' }}>
          {row.map((child, c) => <View key={c} style={styles.cell}>{child}</View>)}
          {row.length === 1 && <View style={styles.cell} />}
        </View>
      ))}
    </View>
  );
}

/** Product photo box (`background: url() center / cover`). Empty when there is no shot. */
export function Photo({ src, style }: { src: Img; style: StyleProp<ViewStyle> }) {
  return (
    <View style={[style, styles.clip]}>
      {src ? <Image source={src} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} /> : null}
    </View>
  );
}

/** Text field matching the prototype's input styling. */
export function Field({ style, ...rest }: TextInputProps & { style?: StyleProp<TextStyle> }) {
  return (
    <TextInput
      placeholderTextColor="#757575"
      selectionColor={C.a}
      keyboardAppearance="dark"
      style={[styles.input, style]}
      {...rest}
    />
  );
}

/** Labelled field: Geist Mono kicker over an input. */
export function LabeledField({ label, gap = 8, ...rest }: TextInputProps & { label: string; gap?: number; style?: StyleProp<TextStyle> }) {
  return (
    <View style={{ gap }}>
      <Text style={kicker}>{label}</Text>
      <Field {...rest} />
    </View>
  );
}

/** The solid accent call-to-action. */
export function PrimaryButton({ label, onPress, height = 53, radius = 13, size = 16, style }: {
  label: string; onPress?: () => void; height?: number; radius?: number; size?: number; style?: StyleProp<ViewStyle>;
}) {
  return (
    <Press
      onPress={onPress}
      style={[{ height, borderRadius: radius, backgroundColor: C.aink, alignItems: 'center', justifyContent: 'center' }, style]}
      hover={{ backgroundColor: C.a2 }}>
      <Text style={hk(size, { w: 700, c: C.ona })}>{label}</Text>
    </Press>
  );
}

const THUMB = 14;
const TRACK = 8;

/** `<input type="range">` with `accent-color` set to the brand green. */
export function Slider({ min, max, step, value, onChange, style }: {
  min: number; max: number; step: number; value: number; onChange: (v: number) => void; style?: StyleProp<ViewStyle>;
}) {
  const [width, setWidth] = useState(0);
  const geom = useRef({ width: 0, min, max, step, onChange });
  geom.current = { width, min, max, step, onChange };

  const pick = (x: number) => {
    const g = geom.current;
    const usable = Math.max(1, g.width - THUMB);
    const t = Math.min(1, Math.max(0, (x - THUMB / 2) / usable));
    const raw = g.min + t * (g.max - g.min);
    const snapped = Math.round((raw - g.min) / g.step) * g.step + g.min;
    g.onChange(Number(Math.min(g.max, Math.max(g.min, snapped)).toFixed(4)));
  };

  const responder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: (e) => pick(e.nativeEvent.locationX),
    onPanResponderMove: (e, g) => pick(g.moveX - startX.current),
  })).current;
  const startX = useRef(0);
  const root = useRef<View>(null);

  const t = (value - min) / (max - min || 1);
  const left = t * Math.max(0, width - THUMB);

  return (
    <View
      ref={root}
      style={[styles.slider, style]}
      onLayout={(e) => {
        setWidth(e.nativeEvent.layout.width);
        root.current?.measure?.((_x, _y, _w, _h, pageX) => { startX.current = pageX; });
      }}
      onTouchStart={() => root.current?.measure?.((_x, _y, _w, _h, pageX) => { startX.current = pageX; })}
      {...responder.panHandlers}>
      <View pointerEvents="none" style={styles.track}>
        <View style={[styles.fill, { width: left + THUMB / 2 }]} />
      </View>
      <View pointerEvents="none" style={[styles.thumb, { left }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  pointer: { cursor: 'pointer' } as ViewStyle,
  cell: { flex: 1, minWidth: 0 },
  clip: { overflow: 'hidden' },
  input: {
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: C.s1,
    borderWidth: 1,
    borderColor: L(10),
    ...hk(14, { c: C.t1 }),
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
  },
  slider: { height: 19, margin: 2, justifyContent: 'center' },
  track: { height: TRACK, borderRadius: TRACK / 2, borderWidth: 1, borderColor: '#858585', backgroundColor: '#3B3B3B', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: C.aink },
  thumb: { position: 'absolute', top: 2.5, width: THUMB, height: THUMB, borderRadius: THUMB / 2, backgroundColor: C.aink },
});
