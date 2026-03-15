import { NextResponse } from "next/server";
import { z } from "zod";

import { analyzePatterns } from "@/lib/analysis/patterns";
import { collectViralCryptoContent } from "@/lib/collectors";
import { generatePlaybook } from "@/lib/gemini";
import type { GenerateResponse } from "@/lib/types";

const requestSchema = z.object({
  topic: z.string().min(2).max(80),
  audience: z.string().max(80).optional(),
  goal: z.string().max(120).optional()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const query = requestSchema.parse(body);
    const sources = await collectViralCryptoContent(query.topic);
    const analysis = analyzePatterns(sources);
    const generator = await generatePlaybook(query, sources, analysis);

    const payload: GenerateResponse = {
      collectedAt: new Date().toISOString(),
      query,
      sources,
      analysis,
      playbook: generator.playbook,
      generator: {
        mode: generator.mode,
        model: generator.model
      }
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: error instanceof z.ZodError ? "Invalid request payload." : "Failed to generate the viral content playbook."
      },
      {
        status: 400
      }
    );
  }
}
