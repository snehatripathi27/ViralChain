"use client";

import { useEffect, useRef, useState } from "react";
import {
  BookText,
  Eraser,
  Menu,
  LoaderCircle,
  MoreHorizontal,
  Sparkles,
  TrendingUp,
  Video
} from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { ResultsView } from "@/components/results/results-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarInset, SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import type { GenerateResponse } from "@/lib/types";

type ChatTurn = {
  id: string;
  prompt: string;
  audience: string;
  goal: string;
  createdAt: string;
  status: "pending" | "success" | "error";
  data?: GenerateResponse;
  error?: string;
};

const defaultPrompt = "Give me viral Instagram reel ideas about Solana meme coins for crypto-curious retail traders.";

const promptIdeas = [
  {
    id: "bitcoin-etf",
    label: "Bitcoin ETF momentum",
    prompt: "Find content ideas around Bitcoin ETF momentum for first-time crypto viewers.",
    meta: "Beginner friendly hooks"
  },
  {
    id: "airdrop-mistakes",
    label: "Airdrop farming",
    prompt: "Give me short-form hooks about airdrop farming and user mistakes.",
    meta: "High-urgency shorts"
  },
  {
    id: "ai-crypto",
    label: "AI x crypto tokens",
    prompt: "Create YouTube ideas about AI x crypto tokens with a strong story angle.",
    meta: "Long-form narratives"
  },
  {
    id: "meme-threads",
    label: "Meme coin cycles",
    prompt: "Write Twitter thread ideas about meme coin cycles and exit liquidity.",
    meta: "Reply-bait threads"
  }
];

function createTurnId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function GeneratorForm() {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [audience, setAudience] = useState("crypto-curious retail traders");
  const [goal, setGoal] = useState("find short-form content ideas with strong hooks");
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const hasPendingTurn = turns.some((turn) => turn.status === "pending");

  useEffect(() => {
    const container = scrollAreaRef.current;

    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth"
    });
  }, [turns]);

  function applyPrompt(value: string) {
    setPrompt(value);
  }

  function resetThread() {
    setTurns([]);
    setPrompt(defaultPrompt);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextPrompt = prompt.trim();

    if (nextPrompt.length < 2) {
      return;
    }

    const turnId = createTurnId();
    const createdAt = new Date().toISOString();

    setTurns((currentTurns) => [
      ...currentTurns,
      {
        id: turnId,
        prompt: nextPrompt,
        audience,
        goal,
        createdAt,
        status: "pending"
      }
    ]);
    setPrompt("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          topic: nextPrompt,
          audience,
          goal
        })
      });

      if (!response.ok) {
        throw new Error("Generation failed");
      }

      const payload = (await response.json()) as GenerateResponse;

      setTurns((currentTurns) =>
        currentTurns.map((turn) => {
          if (turn.id !== turnId) {
            return turn;
          }

          return {
            ...turn,
            status: "success",
            data: payload
          };
        })
      );
    } catch (submissionError) {
      console.error(submissionError);

      setTurns((currentTurns) =>
        currentTurns.map((turn) => {
          if (turn.id !== turnId) {
            return turn;
          }

          return {
            ...turn,
            status: "error",
            error: "Could not generate ideas right now. Try a broader prompt."
          };
        })
      );
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar onNewThread={resetThread} onUsePrompt={applyPrompt} promptIdeas={promptIdeas} />

      <SidebarInset>
        <div className="flex h-screen flex-col">
          <div ref={scrollAreaRef} className="flex-1 overflow-y-auto">
            <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col px-4 pb-56 pt-6 sm:px-6 lg:px-8">
              <ChatActions hasTurns={turns.length > 0} onClearChat={resetThread} />

              {turns.length ? (
                <div className="mx-auto mt-6 w-full max-w-3xl space-y-5">
                  {turns.map((turn) => (
                    <div key={turn.id} className="space-y-4">
                      <div className="flex justify-end">
                        <div className="max-w-2xl rounded-[24px] border border-white/65 bg-white px-4 py-3 text-black shadow-panel">
                          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-black/55">You</p>
                          <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-black">{turn.prompt}</p>
                        </div>
                      </div>

                      <div className="max-w-3xl space-y-2.5">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          {turn.status === "pending" ? (
                            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="h-3.5 w-3.5" />
                          )}
                          Assistant
                        </div>

                        {turn.status === "pending" ? (
                          <div className="rounded-[24px] border border-border/60 bg-card/92 px-4 py-4 shadow-panel">
                            <p className="text-sm font-medium text-foreground">Analyzing current signals and shaping the playbook.</p>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                              I&apos;m pulling recent crypto content, looking for repeated hooks, and turning it into reel, video, and thread ideas.
                            </p>
                          </div>
                        ) : null}

                        {turn.status === "error" ? (
                          <div className="rounded-[24px] border border-border/60 bg-card/92 px-4 py-4 text-sm leading-6 text-muted-foreground shadow-panel">
                            {turn.error}
                          </div>
                        ) : null}

                        {turn.status === "success" && turn.data ? <ResultsView data={turn.data} /> : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-1 items-center justify-center py-10">
                  <div className="w-full max-w-2xl text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[20px] border border-border/70 bg-card/80 shadow-panel">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">Let&apos;s build ViralChain</h1>
                    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                      Ask for reel ideas, YouTube concepts, or thread hooks. The response stays chat-first and clean instead of exploding
                      into a dashboard for no reason.
                    </p>
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-3 py-1.5 text-muted-foreground">
                        <Video className="h-3.5 w-3.5 text-foreground" />
                        Reels
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-3 py-1.5 text-muted-foreground">
                        <TrendingUp className="h-3.5 w-3.5 text-foreground" />
                        YouTube
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-3 py-1.5 text-muted-foreground">
                        <BookText className="h-3.5 w-3.5 text-foreground" />
                        Threads
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="sticky bottom-0 z-20 bg-gradient-to-t from-background via-background/96 to-transparent px-4 pb-4 pt-10 sm:px-6">
            <div className="mx-auto max-w-3xl">
              <form onSubmit={onSubmit} className="rounded-[26px] border border-border/70 bg-card/95 p-3 shadow-panel backdrop-blur">
                <div className="mb-2 flex flex-wrap gap-2 px-1">
                  <Input
                    value={audience}
                    onChange={(event) => setAudience(event.target.value)}
                    placeholder="Audience"
                    className="h-9 min-w-[180px] flex-1 rounded-full bg-secondary/80 px-3 text-xs"
                  />
                  <Input
                    value={goal}
                    onChange={(event) => setGoal(event.target.value)}
                    placeholder="Goal"
                    className="h-9 min-w-[180px] flex-1 rounded-full bg-secondary/80 px-3 text-xs"
                  />
                </div>
                <label className="block">
                  <span className="sr-only">Prompt</span>
                  <textarea
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    placeholder="Ask for viral crypto content ideas..."
                    rows={3}
                    className="min-h-[88px] w-full resize-none rounded-[20px] bg-transparent px-3 py-3 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </label>

                <div className="mt-2 flex justify-end border-t border-border/60 px-1 pt-2.5">
                  <Button type="submit" disabled={hasPendingTurn || prompt.trim().length < 2} className="h-10 rounded-full px-5 text-sm">
                    {hasPendingTurn ? <LoaderCircle className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-2 h-3.5 w-3.5" />}
                    {hasPendingTurn ? "Generating" : "Send"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function ChatActions({ hasTurns, onClearChat }: { hasTurns: boolean; onClearChat: () => void }) {
  const { toggleSidebar, isMobile } = useSidebar();

  return (
    <div className="mx-auto flex w-full max-w-3xl justify-end gap-2">
      {isMobile ? (
        <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-card/70" onClick={toggleSidebar}>
          <Menu className="h-4 w-4" />
          <span className="sr-only">Open sidebar</span>
        </Button>
      ) : null}

      <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-card/70" disabled={!hasTurns} onClick={onClearChat}>
        <Eraser className="h-3.5 w-3.5" />
        <span className="sr-only">Clear chat</span>
      </Button>

      <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-card/70" disabled>
        <MoreHorizontal className="h-3.5 w-3.5" />
        <span className="sr-only">More actions</span>
      </Button>
    </div>
  );
}
