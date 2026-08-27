import { router } from 'expo-router';
import { useCallback } from 'react';

import { useApp } from '@/store/app-store';

/**
 * Back behaviour for sub-screens. Pops the stack when there is something to
 * pop, otherwise lands on the tab the user was last inside — the prototype's
 * `goBackTab`.
 */
export function useBack(fallback?: string) {
  const { tab } = useApp();
  return useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace((fallback ?? `/${tab}`) as never);
  }, [fallback, tab]);
}
