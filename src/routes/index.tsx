import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Clock, ImageOff, MapPin, Phone, ShieldCheck, Truck, Wrench } from "lucide-react";

import { ProductCard } from "@/components/site/ProductCard";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Button } from "@/components/ui/button";
import { getCategories, getProducts } from "@/lib/catalog.functions";
import { categoryImage } from "@/lib/category-images";
import { useLocale } from "@/lib/i18n";
import { SITE } from "@/lib/site";

const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: () => getCategories(),
});

const featuredQuery = queryOptions({
  queryKey: ["products", { featured: true, limit: 8 }],
  queryFn: () => getProducts({ data: { featured: true, limit: 8, sort: "recommended" } }),
});

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(categoriesQuery),
      context.queryClient.ensureQueryData(featuredQuery),
    ]);
  },
  head: () => ({
    meta: [
      { title: "HORMI Komárno – zváracia technika, OOPP a technické plyny" },
      {
        name: "description",
        content:
          "Predaj zváracej techniky, ochranných pracovných prostriedkov, technických plynov, propán-butánu a závlahových systémov v Komárne. Overené značky a odborné poradenstvo.",
      },
      { property: "og:title", content: "HORMI Komárno – zváracia technika, OOPP a technické plyny" },
      {
        property: "og:description",
        content:
          "Produktový katalóg HORMI s.r.o. – zváracia technika, ochranné prostriedky, technické plyny a závlahy z Komárna.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const HIGHLIGHTS = [
  { icon: ShieldCheck, titleKey: "home.h1.brands", textKey: "home.h1.brandsText" },
  { icon: Wrench, titleKey: "home.h2.advice", textKey: "home.h2.adviceText" },
  { icon: Truck, titleKey: "home.h3.gas", textKey: "home.h3.gasText" },
];

function Home() {
  const categories = useSuspenseQuery(categoriesQuery).data;
  const featured = useSuspenseQuery(featuredQuery).data;
  const { t, categoryName, categoryDescription } = useLocale();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-ink text-ink-foreground">
          <div className="container-page grid gap-10 py-16 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <span className="eyebrow text-primary">{SITE.tagline}</span>
              <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                {t("home.heroTitle")}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed opacity-80 sm:text-lg">
                {SITE.name} {t("home.heroText")}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/produkty">
                    {t("home.browseCatalogue")} <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/25 bg-transparent text-ink-foreground hover:bg-white/10">
                  <Link to="/kontakt">{t("home.contactUs")}</Link>
                </Button>
              </div>
              <dl className="mt-10 grid gap-4 text-sm sm:grid-cols-3">
                <div className="flex items-start gap-2 opacity-80">
                  <MapPin className="mt-0.5 size-4 text-primary" /> {SITE.address}
                </div>
                <div className="flex items-start gap-2 opacity-80">
                  <Phone className="mt-0.5 size-4 text-primary" /> {SITE.phone}
                </div>
                <div className="flex items-start gap-2 opacity-80">
                  <Clock className="mt-0.5 size-4 text-primary" /> {SITE.hours[0].value} {t("home.hoursNote")}
                </div>
              </dl>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {categories.slice(0, 4).map((category) => {
                const src = categoryImage(category.slug, category.image_url);
                const label = categoryName(category.slug, category.name);
                return (
                  <Link
                    key={category.id}
                    to="/kategorie/$slug"
                    params={{ slug: category.slug }}
                    className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5"
                  >
                    <div className="aspect-4/3 overflow-hidden">
                      {src ? (
                        <img
                          src={src}
                          alt={`HORMI ${label}`}
                          loading="lazy"
                          className="size-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="size-full bg-white/5" />
                      )}
                    </div>
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-sm font-semibold">
                      {label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-surface">
          <div className="container-page grid gap-6 py-10 sm:grid-cols-3">
            {HIGHLIGHTS.map((item) => (
              <div key={item.titleKey} className="flex gap-3">
                <item.icon className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <h3 className="font-display text-base font-bold">{t(item.titleKey)}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t(item.textKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="container-page py-14 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="eyebrow">{t("home.assortment")}</span>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight">{t("home.categoriesTitle")}</h2>
            </div>
            <Link to="/kategorie" className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
              {t("home.allCategories")} <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const src = categoryImage(category.slug, category.image_url);
              const label = categoryName(category.slug, category.name);
              const description = categoryDescription(category.slug, category.description);
              return (
                <Link
                  key={category.id}
                  to="/kategorie/$slug"
                  params={{ slug: category.slug }}
                  className="group flex gap-4 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
                >
                  <div className="aspect-square w-[38%] shrink-0 overflow-hidden rounded-lg bg-secondary">
                    {src ? (
                      <img
                        src={src}
                        alt={`HORMI ${label}`}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-muted-foreground">
                        <ImageOff className="size-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <h3 className="font-display text-base leading-snug font-bold">{label}</h3>
                    {description && <p className="mt-1.5 line-clamp-3 text-sm text-muted-foreground">{description}</p>}
                    <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-semibold text-primary">
                      {t("home.view")}
                      <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {featured.items.length > 0 && (
          <section className="bg-surface py-14 sm:py-20">
            <div className="container-page">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="eyebrow">{t("home.selection")}</span>
                  <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight">
                    {t("home.featuredTitle")}
                  </h2>
                </div>
                <Link to="/produkty" className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  {t("home.wholeCatalogue")} <ArrowRight className="size-4" />
                </Link>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {featured.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="container-page py-14 sm:py-20">
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-border bg-ink p-8 text-ink-foreground sm:flex-row sm:items-center sm:p-10">
            <div>
              <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{t("home.ctaTitle")}</h2>
              <p className="mt-2 max-w-xl text-sm opacity-80">{t("home.ctaText")}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href={`tel:${SITE.phone.replace(/\s/g, "")}`}>{t("home.call")}</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/25 bg-transparent text-ink-foreground hover:bg-white/10">
                <Link to="/kontakt">{t("nav.contact")}</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
