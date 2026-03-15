import type { SourceItem } from "@/lib/types";
import { uniqueBy } from "@/lib/utils";

interface RedditListing {
  data?: {
    children?: Array<{
      data?: {
        id?: string;
        title?: string;
        selftext?: string;
        permalink?: string;
        author?: string;
        created_utc?: number;
        score?: number;
        num_comments?: number;
        subreddit_name_prefixed?: string;
      };
    }>;
  };
}

export async function fetchRedditPosts(query: string): Promise<SourceItem[]> {
  const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(
    `${query} crypto`
  )}&sort=top&t=week&limit=10`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "viralchain/0.1"
    },
    next: { revalidate: 3600 }
  });

  if (!response.ok) {
    throw new Error(`Reddit collection failed: ${response.status}`);
  }

  const payload = (await response.json()) as RedditListing;

  return uniqueBy(
    (payload.data?.children ?? [])
      .map((entry) => entry.data)
      .filter(Boolean)
      .map((post) => {
        return {
          id: `reddit-${post?.id ?? crypto.randomUUID()}`,
          source: "reddit" as const,
          title: post?.title ?? "Untitled Reddit post",
          summary: post?.selftext?.slice(0, 220),
          url: `https://www.reddit.com${post?.permalink ?? ""}`,
          author: post?.author ?? "unknown",
          publishedAt: post?.created_utc ? new Date(post.created_utc * 1000).toISOString() : undefined,
          stats: {
            score: (post?.score ?? 0) + (post?.num_comments ?? 0) * 2,
            likes: post?.score ?? 0,
            comments: post?.num_comments ?? 0
          },
          tags: [post?.subreddit_name_prefixed ?? "r/cryptocurrency", query]
        } satisfies SourceItem;
      }),
    (item) => item.url
  );
}
