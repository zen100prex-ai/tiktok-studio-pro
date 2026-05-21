import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";

const CEREBRAS_URL = "https://api.cerebras.ai/v1/chat/completions";
const MODEL = "qwen-3-235b-a22b-instruct-2507";

export const Route = createFileRoute("/api/ai-edit")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const { title, author, duration } = (await request.json()) as {
            title: string;
            author: string;
            duration: number;
          };

          const key = process.env.CEREBRAS_API_KEY;
          if (!key) throw new Error("CEREBRAS_API_KEY is not configured");

          const prompt = `You are a senior TikTok video editor using the NoirCut system. Given a clip's metadata, produce an edit plan as STRICT JSON only (no markdown, no commentary).

Clip:
- Title/caption: ${title}
- Author: @${author}
- Duration: ${duration} seconds

Return JSON with this exact shape:
{
  "hook": "string (a punchy 1-line opener using the first-1-second rule)",
  "caption": "string (rewritten viral caption, <140 chars)",
  "hashtags": ["string"] (6-10 relevant hashtags, no # symbol),
  "color_grade": {
    "contrast": "slight boost",
    "saturation": "slight boost",
    "sharpness": "slight boost",
    "skin_warmth": "slight warm",
    "blacks": "deepen slightly"
  },
  "best_section": {"start": "0:00", "end": "0:15", "reason": "string"},
  "cuts": [{"label": "string", "start": "0:00", "end": "0:03", "reason": "string"}],
  "effects": ["string"],
  "loop_tip": "string"
}`;

          const res = await fetch(CEREBRAS_URL, {
            method: "POST",
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${key}`,
            },
            body: JSON.stringify({
              model: MODEL,
              messages: [{ role: "user", content: prompt }],
              max_tokens: 1024,
            }),
          });

          if (!res.ok) {
            const t = await res.text();
            throw new Error(`AI ${res.status}: ${t.slice(0, 200)}`);
          }

          const j = (await res.json()) as any;
          const raw = (j.choices?.[0]?.message?.content as string) || "{}";
          let parsed: any;
          try {
            parsed = JSON.parse(raw);
          } catch {
            const m = raw.match(/\{[\s\S]*\}/);
            parsed = m ? JSON.parse(m[0]) : {};
          }
          return Response.json(parsed);
        } catch (e: any) {
          return Response.json({ error: e?.message || "Server error" }, { status: 500 });
        }
      },
    },
  },
});
