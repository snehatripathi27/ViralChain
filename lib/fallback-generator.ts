import type { ContentIdea, GenerateRequest, GeneratedPlaybook, PatternAnalysis, SourceItem } from "@/lib/types";

function createIdeas(type: "reel" | "youtube" | "thread", count: number, request: GenerateRequest, analysis: PatternAnalysis) {
  const topics = analysis.trendingTopics.map((topic) => topic.label);
  const narratives = analysis.narratives.length > 0 ? analysis.narratives : ["Retail FOMO", "Institutional adoption", "Security and trust"];
  const hooks = analysis.hookPatterns.map((hook) => hook.label);
  const defaultHooks = [
    `Everyone is looking at the wrong ${request.topic} signal`,
    `${request.topic} looks boring until this metric shows up`,
    `If I had to make ${request.topic} content this week, I would start here`
  ];

  return Array.from({ length: count }, (_, index) => {
    const topic = topics[index % Math.max(topics.length, 1)] ?? request.topic;
    const narrative = narratives[index % narratives.length];
    const hook = hooks[index % Math.max(hooks.length, 1)] ?? defaultHooks[index % defaultHooks.length];
    const anglePrefix =
      type === "reel"
        ? "Fast-cut myth busting"
        : type === "youtube"
          ? "Longer-form breakdown"
          : "Thread that escalates from proof to punchline";

    return {
      hook: typeof hook === "string" ? hook : defaultHooks[index % defaultHooks.length],
      topic,
      angle: `${anglePrefix} around ${narrative.toLowerCase()} with a specific takeaway for ${request.audience || "crypto-native viewers"}.`,
      scriptOutline: [
        "Open with the tension or misconception.",
        "Show the data point, post, or narrative driving attention.",
        "Translate the implication into a creator-friendly takeaway."
      ]
    } satisfies ContentIdea;
  });
}

export function buildFallbackPlaybook(
  request: GenerateRequest,
  items: SourceItem[],
  analysis: PatternAnalysis
): GeneratedPlaybook {
  const fallbackHooks = [
    `The ${request.topic} signal most creators are missing`,
    `Why ${request.topic} suddenly matters again`,
    `The real story behind this ${request.topic} narrative`,
    `What smart crypto creators are noticing before the crowd`,
    `The ${request.topic} chart that changes the whole story`
  ];

  return {
    summary: `Collected ${items.length} high-signal crypto items and converted the repeating hooks into a content plan. Because the API key is missing or Gemini failed, this version uses local heuristics instead of model synthesis.`,
    viralHooks: analysis.hookPatterns.length > 0 ? analysis.hookPatterns.map((pattern) => pattern.label).slice(0, 5) : fallbackHooks,
    trendingTopics: analysis.trendingTopics.map((pattern) => pattern.label),
    storytellingStructures: analysis.storyPatterns.map((pattern) => pattern.label),
    reels: createIdeas("reel", 5, request, analysis),
    youtubeVideos: createIdeas("youtube", 3, request, analysis),
    twitterThreads: createIdeas("thread", 3, request, analysis)
  };
}
