import { Platform, type TextStyle, type ViewStyle } from 'react-native';

/**
 * HUSTLR design tokens, resolved from the prototype's CSS variables
 * (accent #20C565 on the default "Ink" surface).
 */
export const C = {
  page: '#050605',
  bg: '#080A09',
  s0: '#0A0D0B',
  s1: '#0C0F0D',
  s2: '#151916',
  s3: '#16201A',
  s4: '#0C100E',
  t1: '#E8ECE9',
  t2: '#C8CFCA',
  t3: '#8A938D',
  t4: '#6F786F',
  t5: '#5F675F',
  a: '#20C565',
  a2: 'rgb(81,210,135)',
  aink: '#20C565',
  ona: '#0B0D0B',
  gold: '#E9C46A',
  goldink: '#E9C46A',
  neg: '#FF5C5C',
  white: '#FFFFFF',
} as const;

const rgb = (hex: string) => {
  const v = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16)).join(',');
};

/** `color-mix(in srgb, <hex> <pct>%, transparent)` */
export const mix = (hex: string, pct: number) => `rgba(${rgb(hex)},${pct / 100})`;
/** Accent at `pct`% over transparent. */
export const A = (pct: number) => mix(C.a, pct);
/** Gold at `pct`% over transparent. */
export const G = (pct: number) => mix(C.gold, pct);
/** Hairline (white) at `pct`% over transparent. */
export const L = (pct: number) => mix('#FFFFFF', pct);

/** CSS gradient string as a background, on native and web alike. */
export const bgImage = (css: string): ViewStyle =>
  (Platform.OS === 'web' ? { backgroundImage: css } : { experimental_backgroundImage: css }) as ViewStyle;

const FAMILY = {
  hk: { 400: 'HankenGrotesk_400Regular', 500: 'HankenGrotesk_500Medium', 600: 'HankenGrotesk_600SemiBold', 700: 'HankenGrotesk_700Bold' },
  mono: { 400: 'GeistMono_400Regular', 500: 'GeistMono_500Medium', 600: 'GeistMono_600SemiBold', 700: 'GeistMono_700Bold' },
  bric: { 700: 'BricolageGrotesque_700Bold', 800: 'BricolageGrotesque_800ExtraBold' },
  space: { 700: 'SpaceGrotesk_700Bold' },
} as const;

type Opts = {
  /** font-weight */
  w?: number;
  /** letter-spacing in px */
  ls?: number;
  /** line-height in px; `1` means `100%` */
  lh?: number;
  c?: string;
};

function font(family: Record<number, string>, fallback: number, size: number, o: Opts = {}): TextStyle {
  const style: TextStyle = { fontFamily: family[o.w ?? fallback] ?? family[fallback], fontSize: size };
  if (o.ls !== undefined) style.letterSpacing = o.ls;
  if (o.lh !== undefined) style.lineHeight = o.lh === 1 ? size : o.lh;
  if (o.c !== undefined) style.color = o.c;
  return style;
}

/** Hanken Grotesk — the prototype's body face. */
export const hk = (size: number, o?: Opts) => font(FAMILY.hk, 400, size, o);
/** Geist Mono — labels, figures, kickers. */
export const mono = (size: number, o?: Opts) => font(FAMILY.mono, 400, size, o);
/** Bricolage Grotesque — display headings. */
export const bric = (size: number, o?: Opts) => font(FAMILY.bric, 800, size, o);
/** Space Grotesk — home hero title. */
export const space = (size: number, o?: Opts) => font(FAMILY.space, 700, size, o);

/** Raised card used across nearly every screen. */
export const card = (radius = 13, border = L(8)): ViewStyle => ({
  borderRadius: radius,
  backgroundColor: C.s1,
  borderWidth: 1,
  borderColor: border,
});

/** Section kicker: Geist Mono 10px, 1px tracking, t4. */
export const kicker: TextStyle = mono(10, { ls: 1, c: C.t4 });
/** Small stat label: Geist Mono 9px, 1px tracking, t4. */
export const label9: TextStyle = mono(9, { ls: 1, c: C.t4 });
