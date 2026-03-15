export type SourceKind = "youtube" | "reddit" | "news";

export interface SourceItem {
  id: string;
  source: SourceKind;
  title: string;
  summary?: string;
  url: string;
  author?: string;
  publishedAt?: string;
  stats: {
    score: number;
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
  };
  tags: string[];
}

export interface TopicPattern {
  label: string;
  count: number;
  rationale: string;
}

export interface HookPattern {
  label: string;
  example: string;
  rationale: string;
}

export interface StoryPattern {
  label: string;
  rationale: string;
}

export interface ContentIdea {
  hook: string;
  topic: string;
  angle: string;
  scriptOutline?: string[];
}

export interface PatternAnalysis {
  trendingTopics: TopicPattern[];
  hookPatterns: HookPattern[];
  storyPatterns: StoryPattern[];
  narratives: string[];
}

export interface GeneratedPlaybook {
  summary: string;
  viralHooks: string[];
  trendingTopics: string[];
  storytellingStructures: string[];
  reels: ContentIdea[];
  youtubeVideos: ContentIdea[];
  twitterThreads: ContentIdea[];
}

export interface GenerateRequest {
  topic: string;
  audience?: string;
  goal?: string;
}

export interface GenerateResponse {
  collectedAt: string;
  query: GenerateRequest;
  sources: SourceItem[];
  analysis: PatternAnalysis;
  playbook: GeneratedPlaybook;
  generator: {
    mode: "gemini" | "fallback";
    model: string;
  };
}
