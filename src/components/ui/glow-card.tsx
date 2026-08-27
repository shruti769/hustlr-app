import { useId } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { Colors } from '@/constants/theme';

type GlowCardProps = {
  children: React.ReactNode;
  /** Glow tint. */
  color?: string;
  /** Alpha at the glow's centre. */
  opacity?: number;
  /** Glow centre, as a fraction of the card (CSS `at <cx> <cy>`). */
  cx?: number;
  cy?: number;
  /** Glow radii, as a fraction of the card. */
  rx?: number;
  ry?: number;
  /** Where the glow reaches zero (CSS's second colour stop). */
  stop?: number;
  background?: string;
  border?: string;
  radius?: number;
  padding?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Card with a CSS-style `radial-gradient` wash over a flat fill. React Native
 * has no radial gradient, so the wash is an SVG rect painted behind the
 * content; the props map 1:1 onto the CSS values in the prototype.
 */
export function GlowCard({
  children,
  color = Colors.green,
  opacity = 0.13,
  cx = 0.5,
  cy = 0,
  rx = 1.2,
  ry = 0.9,
  stop = 0.62,
  background = Colors.surfaceHero,
  border = Colors.hairlineCard,
  radius = 20,
  padding = 20,
  style,
}: GlowCardProps) {
  const id = useId();

  return (
    <View
      style={[
        {
          backgroundColor: background,
          borderRadius: radius,
          borderWidth: 1,
          borderColor: border,
          padding,
          overflow: 'hidden',
        },
        style,
      ]}>
      {/*
        Drawn in a unit-square viewBox stretched over the card, so the CSS
        percentage geometry maps directly and needs no measurement.
      */}
      <Svg
        style={StyleSheet.absoluteFill}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        pointerEvents="none">
        <Defs>
          <RadialGradient
            id={id}
            cx={cx * 100}
            cy={cy * 100}
            rx={rx * 100}
            ry={ry * 100}
            gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={color} stopOpacity={opacity} />
            <Stop offset={stop} stopColor={color} stopOpacity={0} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100" height="100" fill={`url(#${id})`} />
      </Svg>
      {children}
    </View>
  );
}
