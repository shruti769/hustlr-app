import { Platform } from 'react-native';
import Purchases, { type CustomerInfo, type PurchasesPackage } from 'react-native-purchases';

/**
 * Subscriptions are sold only through Apple and Google (App Store / Play
 * Store rules), managed by RevenueCat. The RevenueCat webhook updates
 * `profiles.plan` on the server; this file only runs the purchase on device.
 *
 * RevenueCat setup this code expects:
 *  · entitlements `hustler` and `mogul`
 *  · a current offering with packages `hustler_monthly` and `mogul_monthly`
 */

export type PaidPlan = 'hustler' | 'mogul';

const apiKey = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
});

let configuredFor: string | null = null;

/** Whether this build can sell subscriptions at all. */
export const billingAvailable = Platform.OS !== 'web' && !!apiKey;

/** Ties purchases on this device to the signed-in Supabase user. */
export async function startBilling(userId: string) {
  if (!billingAvailable || configuredFor === userId) return;
  if (configuredFor === null) Purchases.configure({ apiKey: apiKey!, appUserID: userId });
  else await Purchases.logIn(userId);
  configuredFor = userId;
}

export async function stopBilling() {
  if (!billingAvailable || configuredFor === null) return;
  try {
    await Purchases.logOut();
  } catch {
    // already anonymous
  }
  configuredFor = null;
}

/** The plan the store currently entitles this user to. */
export function planFrom(info: CustomerInfo): PaidPlan | 'scout' {
  const active = info.entitlements.active;
  if (active.mogul) return 'mogul';
  if (active.hustler) return 'hustler';
  return 'scout';
}

export async function priceFor(plan: PaidPlan): Promise<string | null> {
  const pkg = await packageFor(plan);
  return pkg?.product.priceString ?? null;
}

async function packageFor(plan: PaidPlan): Promise<PurchasesPackage | null> {
  if (!billingAvailable || !configuredFor) return null;
  const offerings = await Purchases.getOfferings();
  const pkgs = offerings.current?.availablePackages ?? [];
  return pkgs.find((p) => p.identifier === `${plan}_monthly`)
    ?? pkgs.find((p) => p.product.identifier.toLowerCase().includes(plan))
    ?? null;
}

export type BillingResult = { plan?: PaidPlan | 'scout'; error?: string; cancelled?: boolean };

export async function buyPlan(plan: PaidPlan): Promise<BillingResult> {
  if (!billingAvailable) return { error: 'Subscriptions are available in the iPhone and Android apps.' };
  try {
    const pkg = await packageFor(plan);
    if (!pkg) return { error: 'This plan is not on sale yet. Try again later.' };
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { plan: planFrom(customerInfo) };
  } catch (e) {
    if ((e as { userCancelled?: boolean }).userCancelled) return { cancelled: true };
    return { error: (e as Error).message || 'The purchase did not go through.' };
  }
}

export async function restorePlans(): Promise<BillingResult> {
  if (!billingAvailable) return { error: 'Restore purchases from the iPhone or Android app.' };
  try {
    return { plan: planFrom(await Purchases.restorePurchases()) };
  } catch (e) {
    return { error: (e as Error).message || 'Could not restore purchases.' };
  }
}
