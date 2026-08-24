import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Phone, Search, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SITE } from "@/lib/site";

const NAV = [
  { to: "/", label: "Domov" },
  { to: "/produkty", label: "Produkty" },
  { to: "/kategorie", label: "Kategórie" },
  { to: "/o-nas", label: "O nás" },
  { to: "/kontakt", label: "Kontakt" },
] as const;

export function SiteHeader() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setOpen(false);
    void navigate({ to: "/produkty", search: { q: term || undefined } });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="hidden bg-ink text-ink-foreground md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-xs">
          <span className="tracking-wide uppercase">{SITE.tagline}</span>
          <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 hover:underline">
            <Phone className="size-3.5" /> {SITE.phone}
          </a>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-extrabold tracking-tight text-foreground">HORMI</span>
          <span className="hidden text-[0.7rem] font-medium tracking-[0.2em] text-muted-foreground uppercase sm:inline">
            Komárno
          </span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground [&.active]:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={submit} className="ml-auto hidden w-64 items-center gap-2 md:flex">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Hľadať produkt…"
              aria-label="Hľadať produkt"
              className="pl-9"
            />
          </div>
        </form>

        <Button asChild size="sm" className="ml-auto md:ml-2">
          <Link to="/kontakt">Cenová ponuka</Link>
        </Button>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          className="rounded-md p-2 text-foreground lg:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-4 pb-4 lg:hidden">
          <form onSubmit={submit} className="py-3">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Hľadať produkt…"
                aria-label="Hľadať produkt"
                className="pl-9"
              />
            </div>
          </form>
          <nav className="flex flex-col">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="border-b border-border/60 py-3 text-sm font-medium text-foreground last:border-0"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
