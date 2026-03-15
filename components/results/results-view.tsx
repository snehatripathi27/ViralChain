import { ArrowUpRight, BookText, Newspaper, Sparkles, TrendingUp, Video } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatCompactNumber } from "@/lib/utils";
import type { ContentIdea, GenerateResponse } from "@/lib/types";

function AssistantBubble({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`rounded-[22px] border border-border/60 bg-card/92 px-4 py-4 shadow-panel ${className}`}>{children}</section>;
}

function IdeaBubble({
  title,
  description,
  icon: Icon,
  items
}: {
  title: string;
  description: string;
  icon: typeof Video;
  items: ContentIdea[];
}) {
  return (
    <AssistantBubble className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Icon className="h-3.5 w-3.5" />
        {title}
      </div>
      <p className="text-sm leading-5 text-muted-foreground">{description}</p>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={`${title}-${item.hook}-${item.topic}`} className="rounded-[18px] bg-secondary/70 px-3.5 py-3.5">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Hook</p>
            <p className="mt-1 text-sm font-semibold leading-6">{item.hook}</p>
            <div className="mt-2.5 space-y-1.5 text-sm leading-5 text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Topic:</span> {item.topic}
              </p>
              <p>
                <span className="font-medium text-foreground">Angle:</span> {item.angle}
              </p>
            </div>

            {item.scriptOutline?.length ? (
              <div className="mt-3 rounded-[16px] border border-border/60 bg-card/80 px-3 py-2.5">
                <p className="text-sm font-medium text-foreground">Script outline</p>
                <div className="mt-1.5 space-y-1 text-sm leading-5 text-muted-foreground">
                  {item.scriptOutline.map((step) => (
                    <p key={step}>{step}</p>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </AssistantBubble>
  );
}

export function ResultsView({ data }: { data: GenerateResponse }) {
  const sourceCounts = data.sources.reduce<Record<string, number>>((accumulator, item) => {
    accumulator[item.source] = (accumulator[item.source] ?? 0) + 1;
    return accumulator;
  }, {});

  return (
    <div className="max-w-3xl space-y-2.5">
      <AssistantBubble className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          Generated with {data.generator.model} in {data.generator.mode} mode on {new Date(data.collectedAt).toLocaleString()}
        </div>
        <p className="text-sm leading-6 text-foreground/92">{data.playbook.summary}</p>
        <div className="flex flex-wrap gap-2">
          {data.playbook.viralHooks.map((hook) => (
            <Badge key={hook}>{hook}</Badge>
          ))}
        </div>
      </AssistantBubble>

      <AssistantBubble className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[18px] bg-secondary/70 px-3.5 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Signals</p>
          <p className="mt-1.5 text-xl font-semibold">{data.sources.length}</p>
        </div>
        <div className="rounded-[18px] bg-secondary/70 px-3.5 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Narratives</p>
          <p className="mt-1.5 text-xl font-semibold">{data.analysis.narratives.length}</p>
        </div>
        <div className="rounded-[18px] bg-secondary/70 px-3.5 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Sources</p>
          <p className="mt-1.5 text-sm leading-5 text-muted-foreground">
            {sourceCounts.youtube ?? 0} YouTube, {sourceCounts.reddit ?? 0} Reddit, {sourceCounts.news ?? 0} news
          </p>
        </div>
        <div className="rounded-[18px] bg-secondary/70 px-3.5 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Structures</p>
          <p className="mt-1.5 text-sm leading-5 text-muted-foreground">{data.playbook.storytellingStructures.slice(0, 2).join(" · ")}</p>
        </div>
      </AssistantBubble>

      <IdeaBubble
        title="Instagram Reels"
        description="Short-form concepts optimized for hook speed and retention."
        icon={Video}
        items={data.playbook.reels}
      />

      <IdeaBubble
        title="YouTube Videos"
        description="Longer narratives with a clearer story spine."
        icon={TrendingUp}
        items={data.playbook.youtubeVideos}
      />

      <IdeaBubble
        title="Twitter Threads"
        description="Thread concepts designed to stack evidence and provoke replies."
        icon={BookText}
        items={data.playbook.twitterThreads}
      />

      <AssistantBubble className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <TrendingUp className="h-3.5 w-3.5" />
          Pattern snapshot
        </div>

        <div className="flex flex-wrap gap-2">
          {data.analysis.narratives.map((narrative) => (
            <Badge key={narrative} variant="outline">
              {narrative}
            </Badge>
          ))}
        </div>

        <div className="grid gap-2.5 lg:grid-cols-3">
          {data.analysis.hookPatterns.slice(0, 3).map((hook) => (
            <div key={hook.label} className="rounded-[18px] bg-secondary/70 px-3.5 py-3">
              <p className="text-sm font-medium text-foreground">{hook.label}</p>
              <p className="mt-1.5 text-sm leading-5 text-muted-foreground">{hook.rationale}</p>
              <p className="mt-1.5 text-sm text-foreground">Example: {hook.example}</p>
            </div>
          ))}
        </div>
      </AssistantBubble>

      <AssistantBubble className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Newspaper className="h-3.5 w-3.5" />
          Source snapshot
        </div>

        <div className="space-y-3">
          {data.sources.slice(0, 4).map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="block rounded-[18px] bg-secondary/70 px-3.5 py-3.5 transition-colors hover:bg-accent"
            >
              <div className="flex items-start justify-between gap-3">
                <Badge variant="outline">{item.source}</Badge>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <p className="mt-2.5 text-sm font-medium leading-5 text-foreground">{item.title}</p>
              <div className="mt-2.5 flex flex-wrap gap-2 text-xs text-muted-foreground">
                {item.stats.views ? <span>{formatCompactNumber(item.stats.views)} views</span> : null}
                {item.stats.likes ? <span>{formatCompactNumber(item.stats.likes)} likes</span> : null}
                {item.stats.comments ? <span>{formatCompactNumber(item.stats.comments)} comments</span> : null}
              </div>
            </a>
          ))}
        </div>
      </AssistantBubble>
    </div>
  );
}
