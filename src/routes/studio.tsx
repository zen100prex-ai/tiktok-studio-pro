import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Nav } from "@/components/Nav";

export const Route = createFileRoute("/studio")({
  component: Studio,
  head: () => ({ meta: [{ title: "Studio — NoirCut" }] }),
});

type Clip = {
  videoUrl: string;
  cover: string;
  title: string;
  author: string;
  duration: number;
};

type EditPlan = {
  hook: string;
  caption: string;
  hashtags: string[];
  cuts: { label: string; start: string; end: string; reason: string }[];
};

function Studio() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [clip, setClip] = useState<Clip | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<EditPlan | null>(null);
  const [planning, setPlanning] = useState(false);

  async function fetchClip(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setClip(null);
    setPlan(null);
    if (!/tiktok\.com|vm\.tiktok|vt\.tiktok/.test(url)) {
      setError("Please paste a valid TikTok URL.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/fetch-tiktok", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch clip.");
      setClip(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function generatePlan() {
    if (!clip) return;
    setPlanning(true);
    setPlan(null);
    try {
      const res = await fetch("/api/ai-edit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: clip.title,
          author: clip.author,
          duration: clip.duration,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI failed.");
      setPlan(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setPlanning(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-semibold">
            <span className="text-gradient-gold">Studio</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Paste any TikTok link to import the clip and let AI plan the edit.
          </p>
        </div>

        <form
          onSubmit={fetchClip}
          className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 md:flex-row"
        >
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.tiktok.com/@user/video/..."
            className="flex-1 rounded-md bg-background px-4 py-3 text-sm outline-none ring-1 ring-border focus:ring-gold"
          />
          <button
            disabled={loading}
            className="rounded-md bg-gradient-to-b from-[#f0d78c] to-[#c9a84c] px-6 py-3 text-sm font-medium text-background disabled:opacity-60"
          >
            {loading ? "Fetching…" : "Import clip"}
          </button>
        </form>
        {error && (
          <p className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive-foreground">
            {error}
          </p>
        )}

        {clip && (
          <div className="mt-10 grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <div className="overflow-hidden rounded-xl border border-border bg-card ring-gold">
                <video
                  src={clip.videoUrl}
                  poster={clip.cover}
                  controls
                  playsInline
                  className="aspect-[9/16] w-full bg-black object-cover"
                />
                <div className="p-4">
                  <p className="line-clamp-2 text-sm">{clip.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    @{clip.author} · {clip.duration}s
                  </p>
                  <a
                    href={clip.videoUrl}
                    download
                    className="mt-3 inline-block rounded-md border border-gold/40 px-3 py-1.5 text-xs text-gold hover:bg-gold/10"
                  >
                    Download MP4
                  </a>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl">AI edit plan</h2>
                <button
                  onClick={generatePlan}
                  disabled={planning}
                  className="rounded-md bg-gold/10 px-4 py-2 text-sm text-gold ring-1 ring-gold/40 hover:bg-gold/20 disabled:opacity-60"
                >
                  {planning ? "Thinking…" : plan ? "Regenerate" : "Generate plan"}
                </button>
              </div>

              {!plan && !planning && (
                <div className="mt-4 rounded-xl border border-dashed border-border bg-card/40 p-10 text-center text-sm text-muted-foreground">
                  Generate an AI edit plan with hook, captions, cuts and hashtags.
                </div>
              )}

              {plan && (
                <div className="mt-4 space-y-4">
                  <div className="rounded-xl border border-gold/30 bg-gold/5 p-5">
                    <p className="text-xs uppercase tracking-widest text-gold">Hook</p>
                    <p className="mt-2 font-display text-xl">{plan.hook}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-5">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      Caption
                    </p>
                    <p className="mt-2">{plan.caption}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {plan.hashtags.map((h) => (
                        <span
                          key={h}
                          className="rounded-full bg-background px-3 py-1 text-xs text-gold ring-1 ring-gold/30"
                        >
                          {h.startsWith("#") ? h : `#${h}`}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-5">
                    <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
                      Cut list
                    </p>
                    <div className="space-y-2">
                      {plan.cuts.map((c, i) => (
                        <div
                          key={i}
                          className="flex items-start justify-between gap-4 rounded-md border border-border bg-background/60 p-3 text-sm"
                        >
                          <div>
                            <p className="font-display text-gold">{c.label}</p>
                            <p className="text-xs text-muted-foreground">{c.reason}</p>
                          </div>
                          <span className="whitespace-nowrap rounded bg-gold/10 px-2 py-1 text-xs text-gold">
                            {c.start} → {c.end}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
