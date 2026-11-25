// Where listings come from. Each source finds live listings for a search term
// and estimates what the item resells for.
//
//  · eBay — Browse API for live listings; Marketplace Insights for sold prices
//    once eBay approves it (EBAY_INSIGHTS=true), otherwise the median asking
//    price of comparable live listings.
//  · sample — made-up listings so the pipeline runs end to end before any
//    marketplace keys exist. Used only when no eBay keys are set.

import { median, priceKey, type Listing } from './pricing.ts';

export type SearchTerm = {
  id: number;
  query: string;
  category: string;
  marketplace: string;
  min_price: number;
  max_price: number;
};

export type Resale = { resale: number; sampleSize: number; source: string };

export interface Source {
  name: string;
  search(term: SearchTerm): Promise<Listing[]>;
  /** `livePrices` are asking prices seen in the same search, used when sold data is unavailable. */
  resale(query: string, livePrices: number[]): Promise<Resale | null>;
}

export function pickSource(): Source {
  const id = Deno.env.get('EBAY_CLIENT_ID');
  const secret = Deno.env.get('EBAY_CLIENT_SECRET');
  return id && secret ? new EbaySource(id, secret) : new SampleSource();
}

// ─────────────────────────────────────────────────────────────────── eBay

type EbayItem = {
  itemId: string;
  title: string;
  price?: { value: string; currency: string };
  image?: { imageUrl?: string };
  itemWebUrl: string;
  itemAffiliateWebUrl?: string;
  condition?: string;
  itemLocation?: { city?: string; stateOrProvince?: string; country?: string };
  shippingOptions?: { shippingCost?: { value: string } }[];
  itemCreationDate?: string;
};

export class EbaySource implements Source {
  name = 'eBay';
  private token: { value: string; expires: number } | null = null;
  private host: string;
  private marketplaceId: string;
  private campaignId: string | undefined;
  private insights: boolean;

  constructor(private clientId: string, private clientSecret: string) {
    this.host = Deno.env.get('EBAY_ENV') === 'sandbox' ? 'https://api.sandbox.ebay.com' : 'https://api.ebay.com';
    this.marketplaceId = Deno.env.get('EBAY_MARKETPLACE_ID') ?? 'EBAY_US';
    this.campaignId = Deno.env.get('EBAY_CAMPAIGN_ID');
    this.insights = Deno.env.get('EBAY_INSIGHTS') === 'true';
  }

  private async accessToken(): Promise<string> {
    if (this.token && this.token.expires > Date.now() + 60_000) return this.token.value;
    const scopes = ['https://api.ebay.com/oauth/api_scope'];
    if (this.insights) scopes.push('https://api.ebay.com/oauth/api_scope/buy.marketplace.insights');
    const res = await fetch(`${this.host}/identity/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + btoa(`${this.clientId}:${this.clientSecret}`),
      },
      body: new URLSearchParams({ grant_type: 'client_credentials', scope: scopes.join(' ') }),
    });
    if (!res.ok) throw new Error(`eBay token ${res.status}: ${await res.text()}`);
    const body = await res.json();
    this.token = { value: body.access_token, expires: Date.now() + body.expires_in * 1000 };
    return this.token.value;
  }

  private async get(path: string, params: Record<string, string>) {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${await this.accessToken()}`,
      'X-EBAY-C-MARKETPLACE-ID': this.marketplaceId,
    };
    // With an eBay Partner Network campaign, results carry tracked affiliate links.
    if (this.campaignId) headers['X-EBAY-C-ENDUSERCTX'] = `affiliateCampaignId=${this.campaignId}`;
    const res = await fetch(`${this.host}${path}?${new URLSearchParams(params)}`, { headers });
    if (!res.ok) throw new Error(`eBay ${path} ${res.status}: ${(await res.text()).slice(0, 300)}`);
    return res.json();
  }

  async search(term: SearchTerm): Promise<Listing[]> {
    const body = await this.get('/buy/browse/v1/item_summary/search', {
      q: term.query,
      limit: '50',
      sort: 'newlyListed',
      filter: `buyingOptions:{FIXED_PRICE},price:[${term.min_price}..${term.max_price}],priceCurrency:USD`,
    });
    return ((body.itemSummaries ?? []) as EbayItem[]).map((i) => toListing(i, term.category));
  }

  async resale(query: string, livePrices: number[]): Promise<Resale | null> {
    if (this.insights) {
      try {
        const body = await this.get('/buy/marketplace_insights/v1_beta/item_sales/search', { q: query, limit: '50' });
        const sold = ((body.itemSales ?? []) as { lastSoldPrice?: { value: string } }[])
          .map((s) => Number(s.lastSoldPrice?.value));
        const m = median(sold);
        if (m) return { resale: m, sampleSize: sold.length, source: 'ebay-sold' };
      } catch (e) {
        console.warn('marketplace insights failed, falling back to live prices', e);
      }
    }
    // Without sold data: what comparable listings ask, discounted for haggling.
    const m = median(livePrices);
    return m ? { resale: m * 0.92, sampleSize: livePrices.length, source: 'ebay-live' } : null;
  }

  /** Looks up one listing by its eBay URL, for user-shared links. */
  async itemFromUrl(url: string, category: string | null): Promise<Listing | null> {
    const legacy = url.match(/\/itm\/(?:[^/]+\/)?(\d{9,15})/)?.[1];
    if (!legacy) return null;
    const item = await this.get('/buy/browse/v1/item/get_item_by_legacy_id', { legacy_item_id: legacy });
    return toListing(item as EbayItem, category);
  }
}

function toListing(i: EbayItem, category: string | null): Listing {
  const loc = i.itemLocation;
  return {
    marketplace: 'eBay',
    externalId: i.itemId,
    title: i.title,
    price: Number(i.price?.value ?? 0),
    shipping: i.shippingOptions?.[0]?.shippingCost ? Number(i.shippingOptions[0].shippingCost.value) : null,
    condition: i.condition ?? null,
    imageUrl: i.image?.imageUrl ?? null,
    imageKey: null,
    listingUrl: i.itemAffiliateWebUrl ?? i.itemWebUrl,
    location: loc ? [loc.city, loc.stateOrProvince].filter(Boolean).join(', ') || loc.country || null : null,
    category,
    listedAt: i.itemCreationDate ?? null,
  };
}

// ───────────────────────────────────────────────────────────────── sample

type CatalogItem = { match: string[]; titles: string[]; resale: number; imageKey: string | null };

const CATALOG: CatalogItem[] = [
  { match: ['jordan'], titles: ['Air Jordan 4 Retro White Cement', 'Air Jordan 4 Military Black', 'Air Jordan 4 Bred Reimagined'], resale: 360, imageKey: 'jordan' },
  { match: ['dunk'], titles: ['Nike Dunk Low Panda', 'Nike Dunk Low Grey Fog', 'Nike Dunk Low UNC'], resale: 150, imageKey: 'jordan' },
  { match: ['pokemon'], titles: ['Pokémon 151 Booster Box Sealed', 'Pokémon 151 Elite Trainer Box', 'Pokémon 151 Booster Bundle'], resale: 290, imageKey: 'pokemon' },
  { match: ['switch'], titles: ['Nintendo Switch OLED White', 'Nintendo Switch OLED Neon', 'Nintendo Switch OLED Mario Edition'], resale: 300, imageKey: 'nswitch' },
  { match: ['airpods'], titles: ['Apple AirPods Pro 2 USB-C', 'AirPods Pro 2nd Gen MagSafe'], resale: 185, imageKey: null },
  { match: ['dyson'], titles: ['Dyson V11 Torque Drive', 'Dyson V11 Animal', 'Dyson V11 Outsize'], resale: 330, imageKey: 'dyson' },
  { match: ['lego'], titles: ['LEGO Star Wars UCS Millennium Falcon', 'LEGO UCS AT-AT 75313', 'LEGO UCS Razor Crest'], resale: 620, imageKey: 'lego' },
  { match: ['sony', 'xm5'], titles: ['Sony WH-1000XM5 Black', 'Sony WH-1000XM5 Silver'], resale: 270, imageKey: null },
];

const CITIES = ['Los Angeles, CA', 'Austin, TX', 'Brooklyn, NY', 'Seattle, WA', 'Miami, FL', 'Denver, CO', null];
const CONDITIONS = ['New', 'Used', 'Open box', 'Used'];

export class SampleSource implements Source {
  name = 'sample';

  private find(query: string): CatalogItem | undefined {
    const q = query.toLowerCase();
    return CATALOG.find((c) => c.match.some((m) => q.includes(m)));
  }

  search(term: SearchTerm): Promise<Listing[]> {
    const item = this.find(term.query);
    if (!item) return Promise.resolve([]);
    const now = Date.now();
    const out: Listing[] = [];
    for (let n = 0; n < 6; n++) {
      // Asking 40%–105% of resale, so some are steals and most are not.
      const price = Math.round(item.resale * (0.4 + Math.random() * 0.65));
      const id = `sample-${priceKey(term.query).replace(/ /g, '-')}-${now}-${n}`;
      out.push({
        marketplace: 'eBay',
        externalId: id,
        title: item.titles[n % item.titles.length],
        price,
        shipping: Math.random() < 0.5 ? 0 : 12,
        condition: CONDITIONS[n % CONDITIONS.length],
        imageUrl: null,
        imageKey: item.imageKey,
        listingUrl: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(item.titles[n % item.titles.length])}`,
        location: CITIES[n % CITIES.length],
        category: term.category,
        listedAt: new Date(now - n * 7 * 60_000).toISOString(),
      });
    }
    return Promise.resolve(out);
  }

  resale(query: string): Promise<Resale | null> {
    const item = this.find(query);
    return Promise.resolve(item ? { resale: item.resale, sampleSize: 25, source: 'sample' } : null);
  }
}
