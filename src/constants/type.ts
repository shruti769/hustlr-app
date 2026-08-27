import type { TextStyle } from 'react-native';

/**
 * Typography helpers that mirror the prototype's CSS `font:` shorthand.
 *
 * The prototype writes e.g. `font:800 34px 'Archivo'; letter-spacing:-.03em;
 * line-height:1.08`. React Native has no font-weight synthesis for these
 * families and takes letterSpacing/lineHeight in px, so `archivo()` /
 * `mono()` do that conversion: pass the em and multiplier values straight
 * from the CSS and they resolve against the given size.
 */

export type ArchivoWeight = 400 | 500 | 600 | 700 | 800 | 900;
export type MonoWeight = 400 | 500 | 600 | 700 | 800;

const ARCHIVO: Record<ArchivoWeight, string> = {
  400: 'Archivo_400Regular',
  500: 'Archivo_500Medium',
  600: 'Archivo_600SemiBold',
  700: 'Archivo_700Bold',
  800: 'Archivo_800ExtraBold',
  900: 'Archivo_900Black',
};

const MONO: Record<MonoWeight, string> = {
  400: 'JetBrainsMono_400Regular',
  500: 'JetBrainsMono_500Medium',
  600: 'JetBrainsMono_600SemiBold',
  700: 'JetBrainsMono_700Bold',
  800: 'JetBrainsMono_800ExtraBold',
};

type Opts = {
  /** CSS `letter-spacing`, in em. */
  ls?: number;
  /** CSS `line-height`, as a unitless multiplier. */
  lh?: number;
  color?: string;
};

function build(family: string, size: number, opts?: Opts): TextStyle {
  const style: TextStyle = { fontFamily: family, fontSize: size };
  if (opts?.ls !== undefined) style.letterSpacing = opts.ls * size;
  if (opts?.lh !== undefined) style.lineHeight = opts.lh * size;
  if (opts?.color !== undefined) style.color = opts.color;
  return style;
}

export function archivo(size: number, weight: ArchivoWeight, opts?: Opts): TextStyle {
  return build(ARCHIVO[weight], size, opts);
}

export function mono(size: number, weight: MonoWeight, opts?: Opts): TextStyle {
  return build(MONO[weight], size, opts);
}

/** Bricolage Grotesque ExtraBold, used for the auth screen display headings. */
export function bricolageExtraBold(size: number, opts?: Opts): TextStyle {
  return build('BricolageGrotesque_800ExtraBold', size, opts);
}

/** Bricolage Grotesque Bold, used by pushed-screen display titles. */
export function bricolageBold(size: number, opts?: Opts): TextStyle {
  return build('BricolageGrotesque_700Bold', size, opts);
}

/** Shared screen-heading spec from the product typography system. */
export function screenHeading(color?: string): TextStyle {
  return build('BricolageGrotesque_700Bold', 22, {
    lh: 1,
    ls: -0.4 / 22,
    color,
  });
}

/** Geist Mono Regular, used for compact auth form labels. */
export function geistMono(size: number, opts?: Opts): TextStyle {
  return build('GeistMono_400Regular', size, opts);
}

/** Hanken Grotesk Regular, used for readable marketing body copy. */
export function hankenGrotesk(size: number, opts?: Opts): TextStyle {
  return build('HankenGrotesk_400Regular', size, opts);
}

/** Space Grotesk Bold, used for strong marketing display copy. */
export function spaceGroteskBold(size: number, opts?: Opts): TextStyle {
  return build('SpaceGrotesk_700Bold', size, opts);
}

/** Font map for `useFonts` at the root layout. */
export { ARCHIVO as ArchivoFamilies, MONO as MonoFamilies };
