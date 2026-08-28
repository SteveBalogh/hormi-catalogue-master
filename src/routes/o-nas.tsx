import { Link, createFileRoute } from "@tanstack/react-router";
import { Award, Handshake, PackageCheck, Truck } from "lucide-react";

import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";

const VALUES = [
  {
    icon: Award,
    title: "Overené značky",
    text: "Dodávame len techniku a materiál od výrobcov, ktorí obstoja v každodennej prevádzke.",
  },
  {
    icon: Handshake,
    title: "Osobné poradenstvo",
    text: "Poradíme s výberom metódy zvárania, spotrebného materiálu aj ochranných prostriedkov.",
  },
  {
    icon: PackageCheck,
    title: "Sklad na mieste",
    text: "Bežný sortiment máme na predajni v Komárne, ostatné vieme zabezpečiť na objednávku.",
  },
  {
    icon: Truck,
    title: "Plyny a rozvoz",
    text: "Technické plyny aj propán-bután vrátane výmeny tlakových nádob a dopravy po okolí.",
  },
] as const;

export const Route = createFileRoute("/o-nas")({
  head: () => ({
    meta: [
      { title: "O nás – HORMI s.r.o. Komárno" },
      {
        name: "description",
        content:
          "HORMI s.r.o. je komárňanský dodávateľ zváracej techniky, ochranných pracovných prostriedkov, technických plynov a závlahových systémov.",
      },
      { property: "og:title", content: "O nás – HORMI s.r.o." },
      {
        property: "og:description",
        content: "Rodinná firma z Komárna so sortimentom pre zváranie, bezpečnosť práce a technické plyny.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border hairline-grid">
          <div className="mx-auto max-w-7xl px-4 py-14">
            <p className="eyebrow">O spoločnosti</p>
            <h1 className="font-display mt-2 max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl">
              Technika, materiál a poradenstvo pre zváranie a bezpečnosť práce
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {SITE.name} pôsobí v Komárne ako dodávateľ zváracej techniky, ochranných pracovných prostriedkov,
              technických plynov a propán-butánu. Zákazníkmi sú výrobné firmy, stavebné a montážne prevádzky, remeselníci
              aj domácnosti z okolia Komárna a celého Podunajska.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-xl border border-border bg-card p-5">
                <v.icon className="size-6 text-accent" />
                <h2 className="font-display mt-4 text-base font-semibold">{v.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{v.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-xl font-semibold">Čo u nás nájdete</h2>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>Zváracie invertory, MIG/MAG a TIG zdroje, elektródy a drôty</li>
                <li>Ochranné pracovné prostriedky: kukly, rukavice, obuv, odevy</li>
                <li>Technické plyny – argón, kyslík, CO₂, zmesi</li>
                <li>Propán-bután vrátane výmeny fliaš</li>
                <li>Závlahové systémy pre záhrady a verejnú zeleň</li>
                <li>Reklamný textil s možnosťou potlače a výšivky</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-surface p-6">
              <h2 className="font-display text-xl font-semibold">Navštívte nás</h2>
              <p className="mt-3 text-sm text-muted-foreground">{SITE.address}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {SITE.hours[0].day}: {SITE.hours[0].value}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button asChild>
                  <Link to="/kontakt">Kontakt a mapa</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/produkty">Katalóg produktov</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
