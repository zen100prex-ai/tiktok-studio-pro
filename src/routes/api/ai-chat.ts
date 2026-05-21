import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";

const CEREBRAS_URL = "https://api.cerebras.ai/v1/chat/completions";
const MODEL = "qwen-3-235b-a22b-instruct-2507";

const SYSTEM_PROMPT = `You are NoirCut AI — an expert TikTok repost editor and short-form video strategist.
Your ONE goal: make reposts outperform original creators.

Core Philosophy:
- Goal is NOT better quality. Goal is: more attention, faster stimulation, higher retention, stronger loops.
- Every edit must optimize for: attention > stimulation > retention > loop.

Editing Rules:
1. FIRST 1 SECOND is most important:
   - Start at movement, skip dead intros, remove pauses, cut immediately into action.
   - TikTok decides in the first second if people stay. Weak opener = video dies.

2. MICRO ZOOMS every 1-2 seconds: slight zoom in/out for dynamic movement.
3. BEAT CUTS: cut on beat drops, movement hits, transitions. Increases dopamine pacing.
4. LOOP ENDING: end almost where it started — creates the "wait did it restart?" effect.

Color Grading: slight contrast/saturation/sharpness boost, warm skin tones, deepen blacks.
Target look: cinematic, crisp, vibrant. NOT oversaturated, NOT fake HDR.
Good Effects: motion blur, subtle shake, velocity edits, zoom punch, speed ramps.
Bad Effects: crazy RGB flashes, overdone transitions, meme effects, heavy blur.

Brand Consistency: same color style, caption style, pacing, font, effects across ALL clips.
Response Style: Concise, punchy, structured. Short paragraphs and bullet lists.`;

async function callAI(messages: { role: string; content: string }[]) {
  const key = process.env.CEREBRAS_API_KEY;
  if (!key) throw new Error("CEREBRAS_API_KEY is not configured");

  const res = await fetch(CEREBRAS_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`AI error ${res.status}: ${t.slice(0, 200)}`);
  }
  const j = (await res.json()) as any;
  return (j.choices?.[0]?.message?.content as string) || "";
}

export const Route = createFileRoute("/api/ai-chat")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const { messages } = (await request.json()) as {
            messages: { role: string; content: string }[];
          };
          if (!Array.isArray(messages))
            return Response.json({ error: "messages required" }, { status: 400 });

          const text = await callAI([
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ]);
          return Response.json({ text });
        } catch (e: any) {
          return Response.json({ error: e?.message || "Server error" }, { status: 500 });
        }
      },
    },
  },
});
