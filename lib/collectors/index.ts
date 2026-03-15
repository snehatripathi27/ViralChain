import type { SourceItem } from "@/lib/types";

import { fetchNewsArticles } from "@/lib/collectors/news";
import { fetchRedditPosts } from "@/lib/collectors/reddit";
import { fetchYouTubeVideos } from "@/lib/collectors/youtube";
import { uniqueBy } from "@/lib/utils";

async function settleCollector<T>(label: string, action: () => Promise<T[]>) {
  try {
    return await action();
  } catch (error) {
    console.warn(`${label} collector failed`, error);
    return [];
  }
}

export async function collectViralCryptoContent(query: string): Promise<SourceItem[]> {
  const [youtube, reddit, news] = await Promise.all([
    settleCollector("youtube", () => fetchYouTubeVideos(query)),
    settleCollector("reddit", () => fetchRedditPosts(query)),
    settleCollector("news", () => fetchNewsArticles(query))
  ]);

  return uniqueBy(
    [...youtube, ...reddit, ...news]
      .filter((item) => item.title && item.url)
      .sort((a, b) => b.stats.score - a.stats.score),
    (item) => item.url
  ).slice(0, 18);
}
