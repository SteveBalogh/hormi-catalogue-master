import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";

import { SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-2xl font-extrabold tracking-tight">HORMI</p>
          <p className="mt-3 text-sm text-ink-foreground/70">{SITE.tagline}</p>
        </div>
        <div>
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase">Katalóg</h2>
          <ul className="mt-4 space-y-2 text-sm text-ink-foreground/80">
            <li>
              <Link to="/produkty" className="hover:underline">
                Všetky produkty
              </Link>
            </li>
            <li>
              <Link to="/kategorie" className="hover:underline">
                Kategórie
              </Link>
            </li>
            <li>
              <Link to="/produkty" search={{ featured: true }} className="hover:underline">
                Odporúčané
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase">Spoločnosť</h2>
          <ul className="mt-4 space-y-2 text-sm text-ink-foreground/80">
            <li>
              <Link to="/o-nas" className="hover:underline">
                O nás
              </Link>
            </li>
            <li>
              <Link to="/kontakt" className="hover:underline">
                Kontakt
              </Link>
            </li>
            <li>
              <Link to="/auth" className="hover:underline">
                Prihlásenie do správy
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase">Kontakt</h2>
          <ul className="mt-4 space-y-3 text-sm text-ink-foreground/80">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              {SITE.address}
            </li>
            <li className="flex gap-2">
              <Phone className="mt-0.5 size-4 shrink-0" />
              <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="hover:underline">
                {SITE.phone}
              </a>
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 size-4 shrink-0" />
              <a href={`mailto:${SITE.email}`} className="hover:underline">
                {SITE.email}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-foreground/15 px-4 py-5">
        <p className="mx-auto max-w-7xl text-xs text-ink-foreground/60">
          © {new Date().getFullYear()} {SITE.name}. Všetky práva vyhradené.
        </p>
      </div>
    </footer>
  );
}
