// Run: deno test --no-lock supabase/functions/tests/
import { assert, assertEquals } from 'jsr:@std/assert@1.0.13';

import {
  economics, finalBadge, median, priceKey, rejectReason, ruleBadge, ruleScore, sourceLine,
} from '../_shared/pricing.ts';
import { dealRow, scoreListing } from '../_shared/score.ts';
import { SampleSource } from '../_shared/sources.ts';

const term = { id: 1, query: 'Air Jordan 4 Retro', category: 'Sneakers', marketplace: 'eBay', min_price: 80, max_price: 600 };

Deno.test('profit is resale minus cost, eBay fees and outbound postage', () => {
  const e = economics({ price: 200, shipping: 10, category: 'Sneakers' }, 410);
  assertEquals(e.cost, 210);
  assertEquals(e.fees, 54.33); // 13.25% of 410
  assertEquals(e.shipping, 15);
  assertEquals(e.profit, 130.67);
});

Deno.test('cheap filter rejects thin deals and thin data', () => {
  assertEquals(rejectReason(economics({ price: 300, shipping: 0, category: 'Toys' }, 330), 20), 'profit under $20');
  assertEquals(rejectReason(economics({ price: 400, shipping: 0, category: 'Home' }, 540), 20), 'margin under 15%');
  assertEquals(rejectReason(economics({ price: 100, shipping: 0, category: 'Toys' }, 300), 2), 'too few comparable sales');
  assertEquals(rejectReason(economics({ price: 100, shipping: 0, category: 'Toys' }, 300), 20), null);
});

Deno.test('rule badges follow margin and profit', () => {
  assertEquals(ruleBadge(economics({ price: 150, shipping: 0, category: 'Sneakers' }, 410)), 'STEAL');
  assertEquals(ruleBadge(economics({ price: 280, shipping: 0, category: 'Sneakers' }, 410)), 'CAUTION');
  assertEquals(ruleBadge(economics({ price: 400, shipping: 0, category: 'Sneakers' }, 410)), 'RISK');
  const s = ruleScore(economics({ price: 150, shipping: 0, category: 'Sneakers' }, 410));
  assert(s > 7 && s <= 9.6, `score ${s}`);
});

Deno.test('the numbers cap what the AI can say', () => {
  const loss = economics({ price: 400, shipping: 0, category: 'Sneakers' }, 410);
  assertEquals(finalBadge('STEAL', loss), 'RISK');
  const thin = economics({ price: 300, shipping: 0, category: 'Sneakers' }, 410);
  assertEquals(finalBadge('STEAL', thin), 'CAUTION');
  const good = economics({ price: 150, shipping: 0, category: 'Sneakers' }, 410);
  assertEquals(finalBadge('CAUTION', good), 'CAUTION');
});

Deno.test('helpers', () => {
  assertEquals(median([5, 1, 3]), 3);
  assertEquals(median([4, 1, 3, 2]), 2.5);
  assertEquals(median([]), null);
  assertEquals(priceKey('Air  Jordan 4 Retro jordan!'), '4 air jordan retro');
  assertEquals(sourceLine({ marketplace: 'eBay', location: 'Austin, TX' }), 'EBAY · AUSTIN, TX');
  assertEquals(sourceLine({ marketplace: 'eBay', location: null }), 'EBAY · ONLINE');
});

Deno.test('sample source → rules scoring → a valid deal row, without any keys', async () => {
  Deno.env.delete('ANTHROPIC_API_KEY');
  const source = new SampleSource();
  const listings = await source.search(term);
  assertEquals(listings.length, 6);
  const resale = await source.resale(term.query);
  assert(resale && resale.resale > 0);

  const kept = listings.filter((l) => !rejectReason(economics(l, resale.resale), resale.sampleSize));
  for (const l of kept) {
    const s = await scoreListing(l, resale.resale);
    assertEquals(s.by, 'rules');
    const row = dealRow(l, s);
    assert(['STEAL', 'CAUTION', 'RISK'].includes(row.badge));
    assertEquals(row.marketplace, 'eBay');
    assert(row.listing_url.startsWith('https://www.ebay.com/'));
    assert(row.buy_price < row.resale_price);
    assert(new Date(row.expires_at).getTime() > Date.now());
  }
});

Deno.test('unknown search terms produce nothing from the sample source', async () => {
  assertEquals((await new SampleSource().search({ ...term, query: 'vintage typewriter' })).length, 0);
});
