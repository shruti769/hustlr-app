// AI Deal Score: Claude reads the listing (and its photo) next to the profit
// maths and returns a badge, a 0–10 score, a one-line reason and short checks.
// Without ANTHROPIC_API_KEY the pipeline falls back to the rules in pricing.ts.

import Anthropic from 'npm:@anthropic-ai/sdk@1.14.0';
import { z } from 'npm:zod@4.6.7';

import type { Badge, Economics, Listing } from './pricing.ts';

export type AiVerdict = {
  badge: Badge;
  score: number;
  reason: string;
  checks: { ok: boolean; text: string }[];
};

const MODEL = Deno.env.get('AI_MODEL') ?? 'claude-opus-5-5';

const Verdict = z.object({
  badge: z.enum(['STEAL', 'CAUTION', 'RISK']),
  score: z.number(),
  reason: z.string(),
  checks: z.array(z.object({ ok: z.boolean(), text: z.string() })),
});

const SCHEMA = {
  type: 'object',
  properties: {
    badge: { type: 'string', enum: ['STEAL', 'CAUTION', 'RISK'] },
    score: { type: 'number', description: 'Deal quality from 0 to 10' },
    reason: { type: 'string', description: 'One sentence, under 120 characters' },
    checks: {
      type: 'array',
      description: 'Three or four short checks; ok=false for anything the buyer should verify',
      items: {
        type: 'object',
        properties: { ok: { type: 'boolean' }, text: { type: 'string' } },
        required: ['ok', 'text'],
        additionalProperties: false,
      },
    },
  },
  required: ['badge', 'score', 'reason', 'checks'],
  additionalProperties: false,
};

const SYSTEM = `You score second-hand listings for resellers ("flippers") who buy an item and resell it.
You get the listing and an estimated profit already worked out from recent prices, after fees and postage.

Badges:
- STEAL: clearly underpriced, strong margin, nothing suspicious.
- CAUTION: profitable but something needs checking first (condition, authenticity, thin comparable data, vague listing).
- RISK: likely loss, or strong signs of a counterfeit, scam, damage, or a mismatched title/photo.

Judge from the title, condition, photo and numbers only. Counterfeits are common for sneakers, AirPods,
trading cards and luxury goods: when the price is far below market for these, prefer CAUTION or RISK
unless the listing gives reasons to trust it. Keep checks concrete (what to ask the seller or look for).
Write for a busy reseller: plain words, no hype.`;

let client: Anthropic | null = null;

export function aiEnabled(): boolean {
  return !!Deno.env.get('ANTHROPIC_API_KEY');
}

export async function scoreWithAi(listing: Listing, e: Economics): Promise<AiVerdict | null> {
  if (!aiEnabled()) return null;
  client ??= new Anthropic();

  const facts = [
    `Title: ${listing.title}`,
    `Marketplace: ${listing.marketplace}`,
    `Category: ${listing.category ?? 'unknown'}`,
    `Condition: ${listing.condition ?? 'not stated'}`,
    `Location: ${listing.location ?? 'not stated'}`,
    `Asking price: $${listing.price}${listing.shipping ? ` + $${listing.shipping} postage` : ''}`,
    `Estimated resale: $${e.resale}`,
    `Estimated fees: $${e.fees}, outbound postage: $${e.shipping}`,
    `Estimated profit: $${e.profit} (${Math.round(e.margin * 100)}% on cost)`,
  ].join('\n');

  const content: Anthropic.Beta.BetaContentBlockParam[] = [];
  if (listing.imageUrl) content.push({ type: 'image', source: { type: 'url', url: listing.imageUrl } });
  content.push({ type: 'text', text: facts });

  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 2000,
      system: SYSTEM,
      messages: [{ role: 'user', content }],
      output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
      // If a safety classifier declines, the API retries on another model in the same call.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
    });
    if (response.stop_reason === 'refusal' || response.stop_reason === 'max_tokens') return null;
    const text = response.content.find((b) => b.type === 'text');
    if (!text || text.type !== 'text') return null;
    const parsed = Verdict.safeParse(JSON.parse(text.text));
    if (!parsed.success) return null;
    const v = parsed.data;
    return {
      badge: v.badge,
      score: Math.max(0, Math.min(10, Math.round(v.score * 10) / 10)),
      reason: v.reason.slice(0, 160),
      checks: v.checks.slice(0, 4).map((c) => ({ ok: c.ok, text: c.text.slice(0, 90) })),
    };
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) console.warn('AI rate limited; using rules for this listing');
    else if (err instanceof Anthropic.APIError) console.warn(`AI error ${err.status}: ${err.message}`);
    else console.warn('AI scoring failed', err);
    return null;
  }
}
