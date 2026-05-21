import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/Nav";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "NoirCut — AI TikTok Video Editor" },
      {
        name: "description",
        content:
          "Paste any TikTok link. NoirCut imports the clip and helps you edit it with AI — captions, cuts, hooks, hashtags.",
      },
    ],
  }),
});

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />

      {/* Hero */}
      <section className="bg-noir-grid relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-32 md:pt-32 md:pb-40">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 text-xs uppercase tracking-widest text-gold">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
              AI Studio for short-form video
            </div>
            <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
              Drop a TikTok link.
              <br />
              <span className="text-gradient-gold">Edit like a studio.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              NoirCut pulls the clip in seconds and pairs it with an AI editor that writes hooks,
              captions, cut lists and viral hashtags — all in one quiet, premium workspace.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/studio"
                className="rounded-md bg-gradient-to-b from-[#f0d78c] to-[#c9a84c] px-6 py-3 text-sm font-medium text-background shadow-xl shadow-[#c9a84c]/20 transition hover:brightness-110"
              >
                Start editing — free
              </Link>
              <Link
                to="/ai"
                className="rounded-md border border-border bg-card/60 px-6 py-3 text-sm font-medium text-foreground transition hover:border-gold/50"
              >
                Talk to AI editor →
              </Link>
            </div>
          </div>

          {/* Mock app preview */}
          <div className="ring-gold mx-auto mt-20 max-w-5xl rounded-2xl border border-border bg-card/60 p-2 backdrop-blur">
            <div className="grid grid-cols-12 gap-2 rounded-xl bg-background/60 p-6">
              <div className="col-span-12 md:col-span-4">
                <div className="aspect-[9/16] w-full rounded-lg bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] ring-1 ring-gold/20" />
              </div>
              <div className="col-span-12 space-y-3 md:col-span-8">
                {["Hook · 0:00–0:03", "Cut · 0:03–0:11", "B-roll · 0:11–0:18", "CTA · 0:18–0:22"].map(
                  (s, i) => (
                    <div
                      key={s}
                      className="flex items-center justify-between rounded-md border border-border bg-card/80 px-4 py-3 text-sm"
                    >
                      <span className="text-muted-foreground">{s}</span>
                      <span className="font-display text-gold">AI-suggested</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs">{0.92 - i * 0.07}</span>
                    </div>
                  ),
                )}
                <div className="mt-2 rounded-md border border-gold/30 bg-gold/5 p-4 text-sm text-foreground/90">
                  <span className="font-display text-gold">Suggested caption:</span>{" "}
                  "The 3-second hook nobody is using in 2025 👀"
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              t: "Instant import",
              d: "Paste a TikTok URL. We fetch the clip, watermark-free, in a couple of seconds.",
            },
            {
              t: "AI editor",
              d: "Smart cuts, viral hooks, captions and hashtag packs powered by Lovable AI.",
            },
            {
              t: "Studio workspace",
              d: "A focused, noir interface built for editing — no clutter, no ads.",
            },
          ].map((f) => (
            <div
              key={f.t}
              className="group rounded-xl border border-border bg-card p-6 transition hover:border-gold/40"
            >
              <div className="mb-4 grid h-10 w-10 place-items-center rounded-md bg-gold/10 text-gold">
                ◆
              </div>
              <h3 className="font-display text-xl">{f.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-8 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} NoirCut</span>
          <span>Crafted with Lovable AI</span>
        </div>
      </footer>
    </div>
  );
}
