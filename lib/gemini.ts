import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

import { buildFallbackPlaybook } from "@/lib/fallback-generator";
import type { GenerateRequest, GeneratedPlaybook, PatternAnalysis, SourceItem } from "@/lib/types";

const ideaSchema = z.object({
  hook: z.string(),
  topic: z.string(),
  angle: z.string(),
  scriptOutline: z.array(z.string()).optional()
});

const playbookSchema = z.object({
  summary: z.string(),
  viralHooks: z.array(z.string()).length(5),
  trendingTopics: z.array(z.string()).min(3).max(6),
  storytellingStructures: z.array(z.string()).min(3).max(5),
  reels: z.array(ideaSchema).length(5),
  youtubeVideos: z.array(ideaSchema).length(3),
  twitterThreads: z.array(ideaSchema).length(3)
});

function buildPrompt(request: GenerateRequest, items: SourceItem[], analysis: PatternAnalysis) {
  const compactSources = items.slice(0, 12).map((item) => ({
    source: item.source,
    title: item.title,
    author: item.author,
    url: item.url,
    stats: item.stats,
    tags: item.tags
  }));

  return `
You are helping a creator build viral crypto content from current high-engagement source material.

User request:
- Topic: ${request.topic}
- Audience: ${request.audience ?? "Crypto-curious audience"}
- Goal: ${request.goal ?? "Generate viral, high-retention content ideas"}

Observed source items:
${JSON.stringify(compactSources, null, 2)}

Detected patterns:
${JSON.stringify(analysis, null, 2)}

Return only valid JSON with this exact shape:
{
  "summary": "string",
  "viralHooks": ["5 hooks"],
  "trendingTopics": ["3-6 topics"],
  "storytellingStructures": ["3-5 structures"],
  "reels": [{ "hook": "string", "topic": "string", "angle": "string", "scriptOutline": ["optional bullet"] }],
  "youtubeVideos": [{ "hook": "string", "topic": "string", "angle": "string", "scriptOutline": ["optional bullet"] }],
  "twitterThreads": [{ "hook": "string", "topic": "string", "angle": "string", "scriptOutline": ["optional bullet"] }]
}

Requirements:
- Make ideas specific to crypto and current narratives, not generic motivational sludge.
- Hooks should sound like creator hooks, not analyst report headlines.
- Each angle should explain the storyline or tension.
- Script outlines should be short and practical.
`;
}

export async function generatePlaybook(
  request: GenerateRequest,
  items: SourceItem[],
  analysis: PatternAnalysis
): Promise<{ mode: "gemini" | "fallback"; model: string; playbook: GeneratedPlaybook }> {
  // agar key na ho to local fallback use karna hai
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

  if (!apiKey) {
    return {
      mode: "fallback",
      model,
      playbook: buildFallbackPlaybook(request, items, analysis)
    };
  }

  try {
    const client = new GoogleGenerativeAI(apiKey);
    const response = await client.getGenerativeModel({ model }).generateContent(buildPrompt(request, items, analysis));
    const rawText = response.response.text().trim();
    const cleaned = rawText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    const parsed = playbookSchema.parse(JSON.parse(cleaned));

    return {
      mode: "gemini",
      model,
      playbook: parsed
    };
  } catch (error) {
    console.warn("Gemini generation failed", error);

    // API fail hone par bhi app output de sake
    return {
      mode: "fallback",
      model,
      playbook: buildFallbackPlaybook(request, items, analysis)
    };
  }
}
