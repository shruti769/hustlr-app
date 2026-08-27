import { Stack } from 'expo-router';

import { Colors } from '@/constants/theme';

/** Login / sign-up / reset. No bottom nav here. */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: Colors.bg },
      }}
    />
  );
}
