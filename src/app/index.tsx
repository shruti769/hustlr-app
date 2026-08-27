import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, Line, RadialGradient, Rect, Stop } from 'react-native-svg';

import { HUSTLR_LOGO_DATA_URI } from '@/constants/hustlr-logo';
import { Colors } from '@/constants/theme';
import { geistMono } from '@/constants/type';

const SPLASH_DURATION_MS = 5000;
const GRID_LINES = [0, 80, 160, 240, 320, 400, 480, 560, 640, 720, 800, 880, 960, 1040];

/** Five-second branded opening screen shown after the native launch screen. */
export default function SplashScreen() {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: SPLASH_DURATION_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    const timer = setTimeout(() => router.replace('/login'), SPLASH_DURATION_MS);

    animation.start();
    return () => {
      clearTimeout(timer);
      animation.stop();
    };
  }, [progress]);

  return (
    <View style={styles.root}>
      <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <RadialGradient id="glow" cx="50%" cy="48%" rx="58%" ry="48%">
            <Stop offset="0" stopColor="#063D25" stopOpacity="0.72" />
            <Stop offset="0.48" stopColor="#052418" stopOpacity="0.35" />
            <Stop offset="1" stopColor="#050706" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#glow)" />
        {GRID_LINES.map((position) => (
          <Line key={`h-${position}`} x1="0" y1={position} x2="100%" y2={position} stroke="#A5C5B2" strokeOpacity="0.1" strokeWidth="1" />
        ))}
        {GRID_LINES.map((position) => (
          <Line key={`v-${position}`} x1={position} y1="0" x2={position} y2="100%" stroke="#A5C5B2" strokeOpacity="0.1" strokeWidth="1" />
        ))}
      </Svg>

      <View style={styles.center}>
        <Image
          source={{ uri: HUSTLR_LOGO_DATA_URI }}
          style={styles.logo}
          contentFit="contain"
          accessibilityLabel="HUSTLR"
        />
        <Text style={styles.tagline}>STOP BROWSING.  START STACKING.</Text>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progress,
              { width: progress.interpolate({ inputRange: [0, 1], outputRange: [8, 184] }) },
            ]}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.dot} />
        <Text style={styles.footerText}>AI RESALE INTELLIGENCE</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden', backgroundColor: Colors.bgDeep },
  center: {
    position: 'absolute',
    top: '42%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  logo: { width: 227, height: 66 },
  tagline: { ...geistMono(9, { ls: 0.3, color: Colors.muted }), marginTop: 20 },
  progressTrack: { width: 184, height: 3, marginTop: 29, alignItems: 'flex-start' },
  progress: { height: 3, borderRadius: 2, backgroundColor: Colors.green },
  footer: {
    position: 'absolute',
    bottom: 58,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.green },
  footerText: geistMono(8, { ls: 0.28, color: Colors.faint }),
});
