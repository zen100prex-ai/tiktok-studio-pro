import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

async function callAI(messages: { role: string; content: string }[]) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY is not configured");
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages,
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
            {
              role: "system",
              content:
                "You are NoirCut AI, an expert short-form video editor and TikTok strategist. Be concise, punchy, and structured. Give specific hooks, captions, cut suggestions, hashtag packs and viral angles. Use short paragraphs and bullet lists.",
            },
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
