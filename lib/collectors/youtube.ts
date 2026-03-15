import type { SourceItem } from "@/lib/types";
import { uniqueBy } from "@/lib/utils";

function safeJsonParse<T>(input: string): T | null {
  try {
    return JSON.parse(input) as T;
  } catch {
    return null;
  }
}

function walkForVideos(node: unknown, results: unknown[] = []): unknown[] {
  if (!node) {
    return results;
  }

  if (Array.isArray(node)) {
    node.forEach((entry) => walkForVideos(entry, results));
    return results;
  }

  if (typeof node === "object") {
    const record = node as Record<string, unknown>;

    if ("videoRenderer" in record) {
      results.push(record.videoRenderer);
    }

    Object.values(record).forEach((value) => walkForVideos(value, results));
  }

  return results;
}

function parseViewCount(text?: string) {
  if (!text) {
    return 0;
  }

  const normalized = text.toLowerCase().replace(/views?/g, "").trim();
  const match = normalized.match(/([\d.,]+)\s*([kmb])?/i);

  if (!match) {
    return 0;
  }

  const raw = Number.parseFloat(match[1].replace(/,/g, ""));
  const suffix = match[2]?.toLowerCase();
  const multiplier = suffix === "k" ? 1_000 : suffix === "m" ? 1_000_000 : suffix === "b" ? 1_000_000_000 : 1;

  return Math.round(raw * multiplier);
}

export async function fetchYouTubeVideos(query: string): Promise<SourceItem[]> {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${query} crypto`)}`;
  const response = await fetch(url, {
    next: { revalidate: 3600 },
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });

  if (!response.ok) {
    throw new Error(`YouTube collection failed: ${response.status}`);
  }

  const html = await response.text();
  const match =
    html.match(/var ytInitialData = ([\s\S]*?);<\/script>/) ??
    html.match(/"ytInitialData"\s*:\s*(\{[\s\S]*?\})\s*,\s*"responseContext"/);
  const payload = match ? safeJsonParse<Record<string, unknown>>(match[1]) : null;

  if (!payload) {
    return [];
  }

  const videos = walkForVideos(payload).slice(0, 10) as Array<Record<string, unknown>>;

  return uniqueBy(
    videos.map((video, index) => {
      const videoId = String(video.videoId ?? `unknown-${index}`);
      const titleRuns = (video.title as { runs?: Array<{ text?: string }> } | undefined)?.runs ?? [];
      const ownerRuns = (video.ownerText as { runs?: Array<{ text?: string }> } | undefined)?.runs ?? [];
      const viewRuns = (video.viewCountText as { simpleText?: string } | undefined)?.simpleText;
      const publishedRuns = (video.publishedTimeText as { simpleText?: string } | undefined)?.simpleText;

      return {
        id: `youtube-${videoId}`,
        source: "youtube" as const,
        title: titleRuns.map((entry) => entry.text).join("") || "Untitled YouTube video",
        url: `https://www.youtube.com/watch?v=${videoId}`,
        author: ownerRuns.map((entry) => entry.text).join(""),
        publishedAt: publishedRuns,
        stats: {
          score: Math.round(parseViewCount(viewRuns) / 500),
          views: parseViewCount(viewRuns)
        },
        tags: [query, "youtube"]
      } satisfies SourceItem;
    }),
    (item) => item.url
  );
}
