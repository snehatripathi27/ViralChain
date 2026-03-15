import { XMLParser } from "fast-xml-parser";

import type { SourceItem } from "@/lib/types";
import { uniqueBy } from "@/lib/utils";

interface RssItem {
  title?: string;
  link?: string;
  pubDate?: string;
  source?: {
    "#text"?: string;
  };
}

interface RssFeed {
  rss?: {
    channel?: {
      item?: RssItem | RssItem[];
    };
  };
}

const parser = new XMLParser({
  ignoreAttributes: false
});

export async function fetchNewsArticles(query: string): Promise<SourceItem[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(
    `${query} crypto when:7d`
  )}&hl=en-US&gl=US&ceid=US:en`;

  const response = await fetch(url, {
    next: { revalidate: 3600 }
  });

  if (!response.ok) {
    throw new Error(`News collection failed: ${response.status}`);
  }

  const xml = await response.text();
  const payload = parser.parse(xml) as RssFeed;
  const rawItems = payload.rss?.channel?.item;
  const items = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];

  return uniqueBy(
    items.slice(0, 10).map((item, index) => {
      return {
        id: `news-${index}`,
        source: "news" as const,
        title: item.title ?? "Untitled article",
        url: item.link ?? "https://news.google.com",
        publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : undefined,
        author: item.source?.["#text"] ?? "Google News",
        stats: {
          score: 120 - index * 7
        },
        tags: [query, "news"]
      } satisfies SourceItem;
    }),
    (item) => item.url
  );
}
