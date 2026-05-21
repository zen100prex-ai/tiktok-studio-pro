import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/fetch-tiktok")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const { url } = (await request.json()) as { url?: string };
          if (!url || typeof url !== "string") {
            return Response.json({ error: "Missing url" }, { status: 400 });
          }
          const res = await fetch("https://www.tikwm.com/api/", {
            method: "POST",
            headers: { "content-type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ url, hd: "1" }).toString(),
          });
          const j = (await res.json()) as any;
          if (!j?.data?.play) {
            return Response.json(
              { error: j?.msg || "Could not fetch this TikTok." },
              { status: 502 },
            );
          }
          return Response.json({
            videoUrl: j.data.hdplay || j.data.play,
            cover: j.data.cover,
            title: j.data.title || "Untitled",
            author: j.data.author?.unique_id || j.data.author?.nickname || "unknown",
            duration: j.data.duration ?? 0,
          });
        } catch (e: any) {
          return Response.json({ error: e?.message || "Server error" }, { status: 500 });
        }
      },
    },
  },
});
