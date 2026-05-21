import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

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
          const key = process.env.LOVABLE_API_KEY;
          if (!key) throw new Error("LOVABLE_API_KEY is not configured");

          const prompt = `You are a senior TikTok video editor. Given a clip's metadata, produce an edit plan as STRICT JSON only (no markdown, no commentary).

Clip:
- Title/caption: ${title}
- Author: @${author}
- Duration: ${duration} seconds

Return JSON with this exact shape:
{
  "hook": "string (a punchy 1-line opener)",
  "caption": "string (rewritten viral caption, <140 chars)",
  "hashtags": ["string", "..."] (6-10 relevant hashtags, no # symbol),
  "cuts": [
    {"label": "string", "start": "0:00", "end": "0:03", "reason": "string"}
  ] (4-6 cuts spanning 0:00 to the duration)
}`;

          const res = await fetch(GATEWAY, {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "Lovable-API-Key": key,
              "X-Lovable-AIG-SDK": "fetch",
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [{ role: "user", content: prompt }],
              response_format: { type: "json_object" },
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
