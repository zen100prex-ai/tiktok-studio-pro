import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";

const CEREBRAS_URL = "https://api.cerebras.ai/v1/chat/completions";
const MODEL = "llama-3.3-70b"; // Faster model, avoids 429 rate limits

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

          const prompt = `You are a senior TikTok repost editor using the NoirCut system.

Your editing philosophy:
- Goal: more attention, faster stimulation, higher retention, stronger loops.
- First 1 second: start at movement, skip dead intros, cut into action immediately.
- Micro zooms every 1-2 seconds (subtle zoom in/out).
- Beat cuts: cut on beat drops and movement hits.
- Loop ending: end almost where it started — "wait did it restart?" effect.
- Color grade: slight contrast boost, slight saturation boost, slight sharpness boost, warm skin tones, deepen blacks.
- Best section: 7–15 seconds with peak action/movement.
- Brand consistency: same style across all clips.

Given this clip's metadata, produce an edit plan as STRICT JSON only (no markdown, no commentary, no thinking tags).

Clip:
- Title/caption: ${title}
- Author: @${author}
- Duration: ${duration} seconds

Return JSON with this exact shape:
{
  "hook": "string (punchy 1-line opener — starts at movement, first-second rule)",
  "caption": "string (rewritten viral caption optimized for attention, <140 chars)",
  "hashtags": ["string"] (6-10 relevant hashtags, no # symbol),
  "color_grade": {
    "contrast": "slight boost",
    "saturation": "slight boost",
    "sharpness": "slight boost",
    "skin_warmth": "slight warm",
    "blacks": "deepen slightly"
  },
  "best_section": {"start": "0:00", "end": "0:15", "reason": "string (why this section has peak attention/movement)"},
  "cuts": [{"label": "string", "start": "0:00", "end": "0:03", "reason": "string (beat/movement reason)"}],
  "effects": ["string (e.g. micro zoom, subtle shake, velocity edit, zoom punch — NO rgb flashes or meme effects)"],
  "loop_tip": "string (specific instruction for loop ending on this clip)"
}`;

          // Retry up to 3 times on 429
          let lastError = "";
          for (let attempt = 1; attempt <= 3; attempt++) {
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

            if (res.status === 429 && attempt < 3) {
              await new Promise((r) => setTimeout(r, 2000 * attempt));
              continue;
            }

            if (!res.ok) {
              const t = await res.text();
              lastError = `AI ${res.status}: ${t.slice(0, 200)}`;
              if (attempt < 3) { await new Promise((r) => setTimeout(r, 2000)); continue; }
              throw new Error(lastError);
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
          }
          throw new Error("AI service is busy — please try again in a moment.");
        } catch (e: any) {
          return Response.json({ error: e?.message || "Server error" }, { status: 500 });
        }
      },
    },
  },
});
