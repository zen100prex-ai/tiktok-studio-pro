import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Nav } from "@/components/Nav";

export const Route = createFileRoute("/ai")({
  component: AIPage,
  head: () => ({ meta: [{ title: "AI Editor — NoirCut" }] }),
});

type Msg = { role: "user" | "assistant"; content: string };

function AIPage() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi — I'm your AI video editor. Tell me about the clip you want to make (vibe, audience, message) and I'll write hooks, captions, cut ideas and hashtag packs.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI failed");
      setMessages([...next, { role: "assistant", content: data.text }]);
    } catch (e: any) {
      setMessages([...next, { role: "assistant", content: `⚠️ ${e.message}` }]);
    } finally {
      setLoading(false);
      requestAnimationFrame(() =>
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }),
      );
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Nav />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-10">
        <h1 className="font-display text-4xl font-semibold">
          <span className="text-gradient-gold">AI</span> Editor
        </h1>
        <p className="mt-2 text-muted-foreground">
          Ask for hooks, captions, cut ideas, viral angles or hashtag packs.
        </p>

        <div
          ref={scrollRef}
          className="mt-6 flex-1 space-y-4 overflow-y-auto rounded-xl border border-border bg-card/40 p-5"
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                m.role === "user"
                  ? "ml-auto bg-gold/10 text-foreground ring-1 ring-gold/30"
                  : "mr-auto bg-background ring-1 ring-border"
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
            </div>
          ))}
          {loading && (
            <div className="mr-auto inline-flex items-center gap-2 rounded-2xl bg-background px-4 py-3 text-sm ring-1 ring-border">
              <span className="h-2 w-2 animate-pulse rounded-full bg-gold" />
              Thinking…
            </div>
          )}
        </div>

        <form onSubmit={send} className="mt-4 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. give me 3 hook variations for a fitness creator…"
            className="flex-1 rounded-md bg-card px-4 py-3 text-sm outline-none ring-1 ring-border focus:ring-gold"
          />
          <button
            disabled={loading}
            className="rounded-md bg-gradient-to-b from-[#f0d78c] to-[#c9a84c] px-5 py-3 text-sm font-medium text-background disabled:opacity-60"
          >
            Send
          </button>
        </form>
      </main>
    </div>
  );
}
