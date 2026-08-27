import Svg, { Circle, Path } from 'react-native-svg';

/**
 * Line icons transcribed path-for-path from the prototype's inline SVGs, so
 * stroke weights and shapes match exactly. All are drawn on a 24×24 grid.
 */

export type IconProps = {
  size?: number;
  color?: string;
  /** Prototype stroke-width for this icon; each default matches its source. */
  width?: number;
  fill?: string;
};

const cap = { strokeLinecap: 'round' } as const;
const join = { strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export function BellIcon({ size = 15, color = '#E8ECE9', width = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} {...cap}>
      <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <Path d="M13.7 21a2 2 0 01-3.4 0" />
    </Svg>
  );
}

export function SearchIcon({ size = 15, color = '#8A938D', width = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} {...cap}>
      <Circle cx="11" cy="11" r="7" />
      <Path d="M20 20l-3.5-3.5" />
    </Svg>
  );
}

export function ChevronLeftIcon({ size = 15, color = '#E8ECE9', width = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} {...join}>
      <Path d="M15 5l-7 7 7 7" />
    </Svg>
  );
}

export function ArrowLeftIcon({ size = 16, color = '#8A938D', width = 1.7 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} {...join}>
      <Path d="M19 12H5" />
      <Path d="M11 18l-6-6 6-6" />
    </Svg>
  );
}

export function LockIcon({ size = 24, color = '#20C565', width = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} {...join}>
      <Path d="M5 10h14v11H5z" />
      <Path d="M8 10V7a4 4 0 018 0v3" />
    </Svg>
  );
}

export function ChevronDownIcon({ size = 12, color = '#6F786F', width = 2.2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} {...join}>
      <Path d="M6 9l6 6 6-6" />
    </Svg>
  );
}

export function BookmarkIcon({ size = 16, color = '#8A938D', width = 1.8, fill = 'none' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={width} {...cap}>
      <Path d="M6 4h12v17l-6-4-6 4z" />
    </Svg>
  );
}

export function HeartIcon({ size = 16, color = '#8A938D', width = 1.8, fill = 'none' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={width} {...cap}>
      <Path d="M12 20s-7-4.6-7-9.4A4 4 0 0112 8a4 4 0 017 2.6C19 15.4 12 20 12 20z" />
    </Svg>
  );
}

export function CommentIcon({ size = 16, color = '#8A938D', width = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} {...cap}>
      <Path d="M21 12a8 8 0 01-11.4 7.2L4 20l1-4.4A8 8 0 1121 12z" />
    </Svg>
  );
}

export function BoxIcon({ size = 19, color = '#5c665f', width = 1.7 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} {...join}>
      <Path d="M21 8l-9-5-9 5 9 5 9-5z" />
      <Path d="M3 8v8l9 5 9-5V8" />
    </Svg>
  );
}

export function HomeIcon({ size = 19, color = '#5c665f', width = 1.7 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} {...join}>
      <Path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" />
    </Svg>
  );
}

export function TagIcon({ size = 19, color = '#5c665f', width = 1.7 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} {...join}>
      <Path d="M20.6 12.4L12.4 20.6a2 2 0 01-2.8 0l-6.2-6.2a2 2 0 01-.6-1.4V4a1 1 0 011-1h9a2 2 0 011.4.6l6.4 6.4a2 2 0 010 2.4z" />
      <Circle cx="7.5" cy="7.5" r="1.2" />
    </Svg>
  );
}

export function PlayIcon({ size = 19, color = '#5c665f', width = 1.7 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} {...join}>
      <Path d="M8 5l11 7-11 7z" />
    </Svg>
  );
}

export function UserIcon({ size = 19, color = '#5c665f', width = 1.7 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} {...join}>
      <Circle cx="12" cy="8" r="4" />
      <Path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
    </Svg>
  );
}

/** Detailed bottom-nav artwork matching the reference icon set. */
export function NavHomeIcon({ size = 21, color = '#6F786F', width = 1.74167 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 10l9-7 9 7v10a1 1 0 01-1 1H4a1 1 0 01-1-1V10z" stroke={color} strokeWidth={width} {...join} />
      <Path d="M9 21v-8h6v8" stroke={color} strokeWidth={width} {...join} />
    </Svg>
  );
}

export function NavDealsIcon({ size = 21, color = '#6F786F', width = 1.74167 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M20.6 13.6l-7 7a2 2 0 01-2.8 0L3.4 13.2A2 2 0 013 11.8V5a2 2 0 012-2h6.8a2 2 0 011.4.6l7.4 7.2a2 2 0 010 2.8z" stroke={color} strokeWidth={width} {...join} />
      <Circle cx="8" cy="8" r="1.25" fill={color} />
    </Svg>
  );
}

export function NavFlipTokIcon({ size = 21, color = '#6F786F', width = 1.74167 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 3l15 9-15 9V3z" stroke={color} strokeWidth={width} {...join} />
    </Svg>
  );
}

export function NavInventoryIcon({ size = 21, color = '#6F786F', width = 1.74167 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Path d="M10.0833 19.9192C10.362 20.0801 10.6782 20.1648 11 20.1648C11.3218 20.1648 11.638 20.0801 11.9167 19.9192L18.3333 16.2525C18.6118 16.0917 18.843 15.8606 19.0039 15.5823C19.1648 15.3039 19.2497 14.9882 19.25 14.6667V7.33333C19.2497 7.01183 19.1648 6.69607 19.0039 6.41772C18.843 6.13938 18.6118 5.90824 18.3333 5.74749L11.9167 2.08083C11.638 1.91992 11.3218 1.83521 11 1.83521C10.6782 1.83521 10.362 1.91992 10.0833 2.08083L3.66667 5.74749C3.38824 5.90824 3.15698 6.13938 2.99609 6.41772C2.8352 6.69607 2.75033 7.01183 2.75 7.33333V14.6667C2.75033 14.9882 2.8352 15.3039 2.99609 15.5823C3.15698 15.8606 3.38824 16.0917 3.66667 16.2525L10.0833 19.9192Z" stroke={color} strokeWidth={width} {...join} />
      <Path d="M3.02539 6.41675L11.0004 11.0001L18.9754 6.41675" stroke={color} strokeWidth={width} {...join} />
      <Path d="M11 20.1667V11" stroke={color} strokeWidth={width} {...join} />
    </Svg>
  );
}

export function NavProfileIcon({ size = 22, color = '#6F786F', width = 1.74167 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Path d="M11 11.917a4.583 4.583 0 100-9.167 4.583 4.583 0 000 9.167z" stroke={color} strokeWidth={width} {...join} />
      <Path d="M18.333 19.25a7.333 7.333 0 00-14.667 0" stroke={color} strokeWidth={width} {...join} />
    </Svg>
  );
}

export function BoltIcon({ size = 17, color = '#5CC96B', width = 1.9, fill = 'none' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={width} {...join}>
      <Path d="M13 2L4 14h7l-1 8 9-12h-7z" />
    </Svg>
  );
}

/** Multicolor emoji-style icons that render consistently without an emoji font. */
export function FireEmojiIcon({ size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12.5 2.2c.8 3.8-2.4 5.1-1.4 8.1.5-1.2 1.5-2.1 2.8-2.7 3.4 2.7 5 5.5 4.1 9.1C17.2 19.9 14.9 22 12 22c-4.1 0-7-3-7-7.2 0-3.1 1.8-5.7 4.6-8.3.1 2 .6 3.2 1.3 3.9-.3-3.6.5-5.9 1.6-8.2z" fill="#FF5A1F" />
      <Path d="M12.2 11c.4 2-1.2 2.8-.7 4.3.4-.7 1-1.3 1.8-1.7 1.3 1.2 2 2.5 1.7 4.1-.3 1.8-1.6 3-3.2 3-2.2 0-3.7-1.6-3.7-3.8 0-1.6.9-3 2.4-4.4.1 1.2.4 2 .9 2.4-.1-1.8.2-2.9.8-3.9z" fill="#FFD43B" />
    </Svg>
  );
}

export function PackageEmojiIcon({ size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 7.2L12 3l9 4.2-9 4.3L3 7.2z" fill="#D6A36C" />
      <Path d="M3 7.2l9 4.3V21l-9-4.4V7.2z" fill="#B8793E" />
      <Path d="M21 7.2l-9 4.3V21l9-4.4V7.2z" fill="#8F592F" />
      <Path d="M8 5l9 4.3v3.2l-2 .9v-3.1L6 6l2-1z" fill="#F1D0A5" />
      <Path d="M5.2 12.1l3.7 1.8v2.7l-3.7-1.8v-2.7z" fill="#F4E5D1" />
    </Svg>
  );
}

export function WarningEmojiIcon({ size = 15 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3L22 20H2L12 3z" fill="#FFD43B" />
      <Path d="M12 9v5M12 17.2v.1" stroke="#302600" strokeWidth="2" {...join} />
    </Svg>
  );
}

export function GiftIcon({ size = 17, color = '#E9C46A', width = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} {...join}>
      <Path d="M4 9h16v12H4z" />
      <Path d="M2 5h20v4H2z" />
      <Path d="M12 5v16" />
      <Path d="M12 5c-2.5 0-4-1-4-2s1.5-1.5 4 2z" />
      <Path d="M12 5c2.5 0 4-1 4-2s-1.5-1.5-4 2z" />
    </Svg>
  );
}

export function LogoutIcon({ size = 17, color = '#FF5C5C', width = 1.9 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} {...join}>
      <Path d="M10 4H5v16h5" />
      <Path d="M14 12h7" />
      <Path d="M17.5 8.5L21 12l-3.5 3.5" />
    </Svg>
  );
}

export function TrophyIcon({ size = 14, color = '#E9C46A', width = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} {...join}>
      <Path d="M8 4h8v5a4 4 0 01-8 0z" />
      <Path d="M12 13v4" />
      <Path d="M8 21h8" />
    </Svg>
  );
}

export function GridIcon({ size = 17, color = '#8A938D', width = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} {...join}>
      <Path d="M4 4h7v7H4z" />
      <Path d="M13 4h7v7h-7z" />
      <Path d="M4 13h7v7H4z" />
      <Path d="M13 13h7v7h-7z" />
    </Svg>
  );
}

export function ChevronRightIcon({ size = 18, color = '#E8ECE9', width = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} {...join}>
      <Path d="M9 5l7 7-7 7" />
    </Svg>
  );
}

export function CalculatorIcon({ size = 19, color = '#E8ECE9', width = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} {...join}>
      <Path d="M5 2h14a1 1 0 011 1v18a1 1 0 01-1 1H5a1 1 0 01-1-1V3a1 1 0 011-1z" />
      <Path d="M7 5h10v4H7zM8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01M16 17v2" />
    </Svg>
  );
}

export function MarketTrendsIcon({ size = 19, color = '#E8ECE9', width = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} {...join}>
      <Path d="M4 21h16M6 21v-8h4v8M10 21V4h4v17M14 21v-12h4v12" />
    </Svg>
  );
}

export function AnalyseIcon({ size = 19, color = '#E8ECE9', width = 1.9 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} {...join}>
      <Circle cx="5" cy="5" r="1.5" fill={color} stroke="none" />
      <Circle cx="5" cy="12" r="1.5" fill={color} stroke="none" />
      <Circle cx="5" cy="19" r="1.5" fill={color} stroke="none" />
      <Path d="M9 5h11M9 12h11M9 19h11" />
    </Svg>
  );
}

/** Solid tool-menu artwork used by the Profile shortcuts. */
export function ToolDashboardIcon({ size = 20, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M3 3.5A1.5 1.5 0 014.5 2h6A1.5 1.5 0 0112 3.5v6a1.5 1.5 0 01-1.5 1.5h-6A1.5 1.5 0 013 9.5v-6zM14 3.5A1.5 1.5 0 0115.5 2h4A1.5 1.5 0 0121 3.5v8a1.5 1.5 0 01-1.5 1.5h-4a1.5 1.5 0 01-1.5-1.5v-8zM3 14.5A1.5 1.5 0 014.5 13h6a1.5 1.5 0 011.5 1.5v6a1.5 1.5 0 01-1.5 1.5h-6A1.5 1.5 0 013 20.5v-6zM14 16.5a1.5 1.5 0 011.5-1.5h4a1.5 1.5 0 011.5 1.5v4a1.5 1.5 0 01-1.5 1.5h-4a1.5 1.5 0 01-1.5-1.5v-4z" />
    </Svg>
  );
}

export function ToolCalculatorIcon({ size = 20, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path
        fillRule="evenodd"
        d="M5 2h14a2 2 0 012 2v16a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2zm1 3v4h12V5H6zm0 7h3v3H6v-3zm5 0h3v3h-3v-3zm5 0h2v3h-2v-3zM6 17h3v3H6v-3zm5 0h3v3h-3v-3zm5 0h2v3h-2v-3z"
      />
    </Svg>
  );
}

export function ToolTagIcon({ size = 20, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path
        fillRule="evenodd"
        d="M3 4a1 1 0 011-1h7.1a2 2 0 011.42.59l8.9 8.9a2 2 0 010 2.82l-6.11 6.11a2 2 0 01-2.82 0l-8.9-8.9A2 2 0 013 11.1V4zm5 2a2 2 0 100 4 2 2 0 000-4z"
      />
    </Svg>
  );
}
