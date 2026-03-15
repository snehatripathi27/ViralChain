import { clamp, titleCase } from "@/lib/utils";
import type { HookPattern, PatternAnalysis, SourceItem, StoryPattern, TopicPattern } from "@/lib/types";

const STOP_WORDS = new Set([
  "the",
  "and",
  "that",
  "with",
  "from",
  "into",
  "your",
  "this",
  "what",
  "have",
  "just",
  "they",
  "their",
  "about",
  "after",
  "before",
  "where",
  "when",
  "will",
  "would",
  "could",
  "should",
  "crypto",
  "bitcoin",
  "ethereum",
  "today",
  "week",
  "month",
  "price",
  "market"
]);

const NARRATIVE_RULES = [
  { label: "Institutional adoption", test: /(etf|blackrock|institution|bank|wall street|treasury)/i },
  { label: "Regulation shock", test: /(sec|lawsuit|regulation|policy|government|ban)/i },
  { label: "Meme coin mania", test: /(meme|doge|pepe|sol meme|altcoin season)/i },
  { label: "AI x crypto convergence", test: /(ai|agent|inference|depin|compute)/i },
  { label: "Retail FOMO", test: /(surge|explodes|100x|moon|breakout|bull run)/i },
  { label: "Security and trust", test: /(hack|exploit|wallet|rug|liquidation|scam)/i }
];

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function detectHookPatterns(items: SourceItem[]): HookPattern[] {
  const patterns: Array<{ label: string; test: RegExp; rationale: string }> = [
    {
      label: "Urgent breaking-news framing",
      test: /(breaking|just in|update|alert)/i,
      rationale: "Urgency performs because it signals the viewer might miss a market-moving change."
    },
    {
      label: "Contrarian prediction",
      test: /(nobody|everyone is wrong|don.t buy|don.t sell|ignore)/i,
      rationale: "Contrarian language creates tension and invites debate in comments."
    },
    {
      label: "Number-led promise",
      test: /\b\d+(\.\d+)?(x|%| ways| signs| reasons| charts?)\b/i,
      rationale: "Specific numbers make the payoff feel concrete instead of vague guru fog."
    },
    {
      label: "Open-loop curiosity",
      test: /(why|here.s what|the reason|this is how|watch before)/i,
      rationale: "Open loops keep attention because the resolution is withheld until later."
    }
  ];

  return patterns
    .map((pattern) => {
      const match = items.find((item) => pattern.test.test(item.title));
      return match
        ? {
            label: pattern.label,
            example: match.title,
            rationale: pattern.rationale
          }
        : null;
    })
    .filter((pattern): pattern is HookPattern => Boolean(pattern));
}

function detectStoryPatterns(items: SourceItem[]): StoryPattern[] {
  const titles = items.map((item) => item.title).join(" || ");
  const patterns: StoryPattern[] = [];

  if (/(before|next|coming|soon|future)/i.test(titles)) {
    patterns.push({
      label: "Prediction then payoff",
      rationale: "Creators frame a near-future claim, then explain what viewers should do before everyone else catches on."
    });
  }

  if (/(why|because|reason)/i.test(titles)) {
    patterns.push({
      label: "Event then explanation",
      rationale: "A surprising claim lands first, followed by the underlying mechanism or catalyst."
    });
  }

  if (/(chart|data|metrics|on-chain|volume)/i.test(titles)) {
    patterns.push({
      label: "Data proof structure",
      rationale: "Screenshots, charts, and on-chain stats are used as receipts before the creator makes the prediction."
    });
  }

  if (patterns.length === 0) {
    patterns.push({
      label: "Hook, context, actionable takeaway",
      rationale: "Even when titles are messy, high-engagement crypto content usually compresses into this three-step format."
    });
  }

  return patterns;
}

function detectTrendingTopics(items: SourceItem[]): TopicPattern[] {
  const scores = new Map<string, number>();

  items.forEach((item) => {
    const weight = clamp(item.stats.score / 1000, 1, 25);

    tokenize(`${item.title} ${item.summary ?? ""} ${item.tags.join(" ")}`).forEach((token) => {
      scores.set(token, (scores.get(token) ?? 0) + weight);
    });
  });

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, count]) => ({
      label: titleCase(label),
      count: Math.round(count),
      rationale: `${label} kept reappearing across high-engagement items instead of showing up as a one-off headline.`
    }));
}

function detectNarratives(items: SourceItem[]) {
  const combined = items.map((item) => `${item.title} ${item.summary ?? ""}`).join(" || ");

  return NARRATIVE_RULES.filter((rule) => rule.test.test(combined)).map((rule) => rule.label);
}

export function analyzePatterns(items: SourceItem[]): PatternAnalysis {
  return {
    trendingTopics: detectTrendingTopics(items),
    hookPatterns: detectHookPatterns(items),
    storyPatterns: detectStoryPatterns(items),
    narratives: detectNarratives(items)
  };
}
