import { Link, createFileRoute } from "@tanstack/react-router";
import { Award, Handshake, PackageCheck, Truck } from "lucide-react";

import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n";
import { SITE } from "@/lib/site";

const VALUES = [
  { icon: Award, titleKey: "about.v1", textKey: "about.v1Text" },
  { icon: Handshake, titleKey: "about.v2", textKey: "about.v2Text" },
  { icon: PackageCheck, titleKey: "about.v3", textKey: "about.v3Text" },
  { icon: Truck, titleKey: "about.v4", textKey: "about.v4Text" },
] as const;

const OFFER_KEYS = ["about.offer1", "about.offer2", "about.offer3", "about.offer4", "about.offer5", "about.offer6"];

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
  const { t } = useLocale();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border hairline-grid">
          <div className="mx-auto max-w-7xl px-4 py-14">
            <p className="eyebrow">{t("about.eyebrow")}</p>
            <h1 className="font-display mt-2 max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t("about.h1")}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {SITE.name} {t("about.intro")}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <div key={v.titleKey} className="rounded-xl border border-border bg-card p-5">
                <v.icon className="size-6 text-accent" />
                <h2 className="font-display mt-4 text-base font-semibold">{t(v.titleKey)}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{t(v.textKey)}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-xl font-semibold">{t("about.offerTitle")}</h2>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {OFFER_KEYS.map((key) => (
                  <li key={key}>{t(key)}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-surface p-6">
              <h2 className="font-display text-xl font-semibold">{t("about.visitTitle")}</h2>
              <p className="mt-3 text-sm text-muted-foreground">{SITE.address}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("hours.0")}: {SITE.hours[0].value}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button asChild>
                  <Link to="/kontakt">{t("about.contactMap")}</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/produkty">{t("about.catalogue")}</Link>
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
