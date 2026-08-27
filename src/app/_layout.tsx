import {
  Archivo_400Regular,
  Archivo_500Medium,
  Archivo_600SemiBold,
  Archivo_700Bold,
  Archivo_800ExtraBold,
  Archivo_900Black,
} from '@expo-google-fonts/archivo';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  JetBrainsMono_600SemiBold,
  JetBrainsMono_700Bold,
  JetBrainsMono_800ExtraBold,
} from '@expo-google-fonts/jetbrains-mono';
import { BricolageGrotesque_800ExtraBold } from '@expo-google-fonts/bricolage-grotesque';
import { GeistMono_400Regular } from '@expo-google-fonts/geist-mono';
import { SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { useFonts } from 'expo-font';
import { Stack, ThemeProvider, type Theme } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Toast } from '@/components/ui/toast';
import { Colors } from '@/constants/theme';
import { AppProvider } from '@/store/app-store';

SplashScreen.preventAutoHideAsync();
SystemUI.setBackgroundColorAsync(Colors.bg);

/** Navigation chrome painted in the app's own canvas colour, never white. */
const HustlrTheme: Theme = {
  dark: true,
  colors: {
    primary: Colors.brand,
    background: Colors.bg,
    card: Colors.bg,
    text: Colors.text,
    border: Colors.hairlineCard,
    notification: Colors.brand,
  },
  fonts: {
    regular: { fontFamily: 'Archivo_400Regular', fontWeight: '400' },
    medium: { fontFamily: 'Archivo_500Medium', fontWeight: '500' },
    bold: { fontFamily: 'Archivo_700Bold', fontWeight: '700' },
    heavy: { fontFamily: 'Archivo_800ExtraBold', fontWeight: '800' },
  },
};

export default function RootLayout() {
  const [loaded] = useFonts({
    BricolageGrotesque_800ExtraBold,
    GeistMono_400Regular,
    SpaceGrotesk_700Bold,
    Archivo_400Regular,
    Archivo_500Medium,
    Archivo_600SemiBold,
    Archivo_700Bold,
    Archivo_800ExtraBold,
    Archivo_900Black,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
    JetBrainsMono_600SemiBold,
    JetBrainsMono_700Bold,
    JetBrainsMono_800ExtraBold,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <SafeAreaProvider>
        <ThemeProvider value={HustlrTheme}>
          <AppProvider>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'fade',
                animationDuration: 180,
                contentStyle: { backgroundColor: Colors.bg },
              }}
            />
            <Toast />
          </AppProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
