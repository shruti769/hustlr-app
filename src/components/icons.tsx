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

/** Exact bottom-nav artwork supplied from the design file. */
export function NavHomeIcon({ size = 21, color = '#6F786F', width = 1.74167 }: IconProps) {
  return (
    <Svg width={(size * 19) / 21} height={size} viewBox="0 0 19 21" fill="none">
      <Path d="M.871 7.288L9.121.871l8.25 6.417v10.083a1.833 1.833 0 01-1.833 1.833H2.704a1.833 1.833 0 01-1.833-1.833V7.288z" stroke={color} strokeWidth={width} {...join} />
    </Svg>
  );
}

export function NavDealsIcon({ size = 21, color = '#6F786F', width = 1.74167 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 21 21" fill="none">
      <Path d="M10.575 1.408A1.833 1.833 0 009.279.871H2.704A1.833 1.833 0 00.871 2.704v6.575c0 .486.193.952.537 1.296l7.979 7.978a2.217 2.217 0 003.135 0l6.032-6.031a2.217 2.217 0 000-3.135l-7.979-7.979z" stroke={color} strokeWidth={width} {...join} />
    </Svg>
  );
}

export function NavFlipTokIcon({ size = 21, color = '#6F786F', width = 1.74167 }: IconProps) {
  return (
    <Svg width={(size * 15) / 19} height={size} viewBox="0 0 15 19" fill="none">
      <Path d="M.871.871l12.833 8.25L.871 17.371V.871z" stroke={color} strokeWidth={width} {...join} />
    </Svg>
  );
}

export function NavInventoryIcon({ size = 21, color = '#6F786F', width = 1.74167 }: IconProps) {
  return (
    <Svg width={(size * 19) / 21} height={size} viewBox="0 0 19 21" fill="none">
      <Path d="M8.204 18.955a1.833 1.833 0 001.834 0l6.416-3.667a1.833 1.833 0 00.917-1.586V6.369a1.833 1.833 0 00-.917-1.586l-6.416-3.667a1.833 1.833 0 00-1.834 0L1.788 4.783A1.833 1.833 0 00.871 6.369v7.333c0 .655.35 1.26.917 1.586l6.416 3.667z" stroke={color} strokeWidth={width} {...join} />
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

export function BoltIcon({ size = 17, color = '#5CC96B', width = 1.9 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} {...join}>
      <Path d="M13 2L4 14h7l-1 8 9-12h-7z" />
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
      <Path d="M14 4h5v16h-5" />
      <Path d="M10 12H3" />
      <Path d="M6.5 8.5L3 12l3.5 3.5" />
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
