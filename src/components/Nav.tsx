import { Link } from "@tanstack/react-router";

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-[#f0d78c] to-[#8a6f2a] text-background">
            ◆
          </span>
          <span>
            Noir<span className="text-gradient-gold">Cut</span>
          </span>
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          {[
            { to: "/", label: "Home" },
            { to: "/studio", label: "Studio" },
            { to: "/ai", label: "AI" },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: true }}
              className="px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground [&.active]:text-gold"
            >
              {l.label}
            </Link>
          ))}
        </div>
        <Link
          to="/studio"
          className="rounded-md bg-gradient-to-b from-[#f0d78c] to-[#c9a84c] px-4 py-2 text-sm font-medium text-background shadow-lg shadow-[#c9a84c]/20 transition hover:brightness-110"
        >
          Open Studio
        </Link>
      </nav>
    </header>
  );
}
