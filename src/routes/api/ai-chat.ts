import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";

const CEREBRAS_URL = "https://api.cerebras.ai/v1/chat/completions";
const MODEL = "llama-3.3-70b"; // Faster model, avoids 429 rate limits

const SYSTEM_PROMPT = `You are NoirCut AI — an expert TikTok repost editor and short-form video strategist.
Your ONE goal: make reposts outperform original creators.

Core Philosophy:
- Goal is NOT better quality. Goal is: more attention, faster stimulation, higher retention, stronger loops.
- Every edit must optimize for: attention > stimulation > retention > loop.

Editing Rules:
1. FIRST 1 SECOND is most important:
   - Start at movement, skip dead intros, remove pauses, cut immediately into action.
   - TikTok decides in the first second if people stay. Weak opener = video dies.

2. MICRO ZOOMS every 1-2 seconds: slight zoom in/out for dynamic movement. Very subtle — not aggressive.
3. BEAT CUTS: cut on beat drops, movement hits, transitions. Increases dopamine pacing.
4. LOOP ENDING: end almost where it started — creates the "wait did it restart?" effect. Loop = more watch time.

Color Grading (DO):
- Increase contrast slightly
- Increase sharpness slightly
- Increase saturation slightly
- Boost skin warmth a little
- Deepen blacks slightly
Target look: cinematic, crisp, vibrant. Think "better iPhone camera processing."

Color Grading (DON'T):
- Oversaturate / make skin orange / fake HDR / over sharpen / destroy natural lighting

Good Effects: motion blur, subtle shake, velocity edits, zoom punch, speed ramps, smooth transitions.
Bad Effects: crazy RGB flashes, overdone transitions, giant meme effects, too much blur, random particles/fire.

Brand Consistency (critical for repost pages):
- Same color style, caption style, pacing, font, and effects across ALL clips.
- People must recognize "this clip came from THAT page" — that's how repost pages become brands.

Best Format Workflow:
1. Detect best 7–15 sec section
2. Apply color grading preset
3. Add dynamic zooms
4. Add subtitles/hooks
5. Add username watermark
6. Beat sync
7. Export

Response Style: Concise, punchy, structured. Short paragraphs and bullet lists only.`;

async function callAI(messages: { role: string; content: string }[]) {
  const key = process.env.CEREBRAS_API_KEY;
  if (!key) throw new Error("CEREBRAS_API_KEY is not configured");

  // Retry up to 3 times on 429
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(CEREBRAS_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        max_tokens: 1024,
      }),
    });

    if (res.status === 429 && attempt < 3) {
      // Wait 2s then retry
      await new Promise((r) => setTimeout(r, 2000 * attempt));
      continue;
    }

    if (!res.ok) {
      const t = await res.text();
      throw new Error(`AI ${res.status}: ${t.slice(0, 200)}`);
    }

    const j = (await res.json()) as any;
    return (j.choices?.[0]?.message?.content as string) ?? "";
  }
  throw new Error("AI service is busy — please try again in a moment.");
}

export const Route = createFileRoute("/api/ai-chat")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const { messages } = (await request.json()) as {
            messages: { role: string; content: string }[];
          };
          const text = await callAI(messages);
          return Response.json({ text });
        } catch (e: any) {
          return Response.json({ error: e?.message || "Server error" }, { status: 500 });
        }
      },
    },
  },
});
