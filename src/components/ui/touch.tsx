import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

type TouchProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  /** Opacity while held. The prototype's `style-hover` lift, translated to touch. */
  activeOpacity?: number;
  children?: React.ReactNode;
};

/**
 * Pressable with a consistent press-down fade. Used for every tappable surface
 * so the whole app reacts the same way.
 */
export function Touch({ style, activeOpacity = 0.62, children, ...rest }: TouchProps) {
  return (
    <Pressable style={({ pressed }) => [style, pressed && { opacity: activeOpacity }]} {...rest}>
      {children}
    </Pressable>
  );
}
