/**
 * HUSTLR design tokens.
 *
 * Every value here is lifted verbatim from the prototype so screens can be
 * transcribed 1:1. Nothing in the app hardcodes a hex outside this file.
 */

export const Colors = {
  /** Phone canvas */
  bg: '#080A09',
  /** Page behind the canvas (splash / root) */
  bgDeep: '#050706',

  /** Default raised card */
  surface: '#0E1211',
  /** Denser list card */
  surfaceAlt: '#0A0D0B',
  /** Flat tile (dashboard, inventory, calculator) */
  surfaceDim: '#0C0F0D',
  /** Flat tile, prize/plans variant */
  surfaceDim2: '#0C0F0E',
  /** Hero card base under its radial glow */
  surfaceHero: '#0B0F0D',
  /** Highlighted plan card base */
  surfacePlan: '#0B120E',
  /** Secondary button fill */
  surfaceButton: '#121715',
  /** Pill / search field */
  chip: '#1B201E',
  search: '#23272F',
  searchBorder: '#3A4049',
  /** Bottom navigation bar */
  nav: '#0A0D0C',
  /** Green-tinted input (money fields) */
  inputGreen: '#0C120E',

  /** Hairlines, weakest first */
  hairlineSoft: 'rgba(232,236,233,0.05)',
  hairline: 'rgba(232,236,233,0.06)',
  hairlineCard: 'rgba(232,236,233,0.07)',
  border08: 'rgba(232,236,233,0.08)',
  border09: 'rgba(232,236,233,0.09)',
  border: 'rgba(232,236,233,0.1)',
  border12: 'rgba(232,236,233,0.12)',
  border14: 'rgba(232,236,233,0.14)',

  /** Type ramp, brightest first */
  textStrong: '#FFFFFF',
  text: '#E8ECE9',
  textSoft: '#D6DBD7',
  textSoft2: '#C8CFCA',
  textOnLight: '#080A09',
  sub: '#8A938D',
  subLight: '#B9C0BA',
  muted: '#6F786F',
  faint: '#4b544d',

  /** Brand */
  green: '#20C565',
  greenBright: '#2BE074',
  brand: '#5CC96B',
  brandBright: '#6FD97C',
  /** Text sitting on `brand` */
  onBrand: '#0b2f16',
  /** Text sitting on `green` */
  onGreen: '#04130A',
  /** Inline text link on the auth screens */
  link: '#4FC66A',

  /** Accents */
  gold: '#E9C46A',
  orange: '#D98242',
  red: '#FF5C5C',
  blue: '#7AA2FF',
  blueAlt: '#90A0FF',
  purple: '#B284FF',
  disclaimer: '#a08f63',

  /** Avatar / badge tints */
  avatarBg: '#12241a',
  avatarBorder: 'rgba(92,201,107,0.35)',
  rankBg: '#1a231d',
  goldRankBg: '#2a2416',
  /** Leaderboard row highlighting the signed-in user */
  rowSelf: '#101a13',

  /** Translucent fills */
  greenGlass: 'rgba(32,197,101,0.08)',
  greenGlass07: 'rgba(32,197,101,0.07)',
  greenGlass09: 'rgba(32,197,101,0.09)',
  greenGlass12: 'rgba(32,197,101,0.12)',
  greenBorder25: 'rgba(32,197,101,0.25)',
  greenBorder28: 'rgba(32,197,101,0.28)',
  greenBorder30: 'rgba(32,197,101,0.3)',
  greenBorder35: 'rgba(32,197,101,0.35)',
  brandBorder22: 'rgba(92,201,107,0.22)',
  brandBorder30: 'rgba(92,201,107,0.3)',
  brandBorder35: 'rgba(92,201,107,0.35)',
  brandBorder40: 'rgba(92,201,107,0.4)',
  brandBorder45: 'rgba(92,201,107,0.45)',
  brandBorder50: 'rgba(92,201,107,0.5)',
  goldGlass: 'rgba(233,196,106,0.09)',
  goldGlass12: 'rgba(233,196,106,0.12)',
  goldGlass14: 'rgba(233,196,106,0.14)',
  goldBorder18: 'rgba(233,196,106,0.18)',
  goldBorder30: 'rgba(233,196,106,0.3)',
  goldBorder32: 'rgba(233,196,106,0.32)',
  goldBorder40: 'rgba(233,196,106,0.4)',
  redGlass: 'rgba(255,92,92,0.07)',
  redGlass14: 'rgba(255,92,92,0.14)',
  blueGlass: 'rgba(144,160,255,0.12)',
  scrim: 'rgba(8,10,9,0.72)',
  scrimStrong: 'rgba(8,10,9,0.85)',
  tileNeutral: 'rgba(232,236,233,0.06)',

  /** Bottom-nav item states */
  navActive: '#20C565',
  navInactive: '#6F786F',

  /** Photo placeholder gradient (135deg) */
  photoFrom: '#16201a',
  photoTo: '#0c110e',
  photoFromLight: '#1b2620',
} as const;

/** Bottom nav height — content scrollers pad by this. */
export const NAV_HEIGHT = 68;

/** Absolute overlay covering its parent. */
export const FILL = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const;

export const Radius = {
  chip: 20,
  sm: 8,
  md: 11,
  lg: 13,
  card: 15,
  xl: 17,
  hero: 20,
} as const;
