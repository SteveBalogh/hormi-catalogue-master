import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Clock, MapPin, Phone, ShieldCheck, Truck, Wrench } from "lucide-react";

import { ProductCard } from "@/components/site/ProductCard";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Button } from "@/components/ui/button";
import { getCategories, getProducts } from "@/lib/catalog.functions";
import { imageSrc } from "@/lib/catalog-types";
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
    ],
  }),
  component: Home,
});

const HIGHLIGHTS = [
  { icon: ShieldCheck, title: "Overené značky", text: "Zváracia technika a OOPP od výrobcov s certifikáciou." },
  { icon: Wrench, title: "Odborné poradenstvo", text: "Pomôžeme vybrať správnu technológiu aj spotrebný materiál." },
  { icon: Truck, title: "Plyny a rozvoz", text: "Technické plyny a propán-bután s výmenou fliaš na predajni." },
];

function Home() {
  const categories = useSuspenseQuery(categoriesQuery).data;
  const featured = useSuspenseQuery(featuredQuery).data;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-ink text-ink-foreground">
          <div className="container-page grid gap-10 py-16 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <span className="eyebrow text-primary">{SITE.tagline}</span>
              <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Technika a materiál pre profesionálov v Komárne
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed opacity-80 sm:text-lg">
                {SITE.name} dodáva zváracie stroje, spotrebný materiál, ochranné pracovné prostriedky, technické plyny,
                propán-bután, závlahové systémy a reklamný textil — s poradenstvom a zásobou na predajni.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/produkty">
                    Prezrieť katalóg <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/25 bg-transparent text-ink-foreground hover:bg-white/10">
                  <Link to="/kontakt">Kontaktovať nás</Link>
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
                  <Clock className="mt-0.5 size-4 text-primary" /> {SITE.hours[0].value} (Po – Pi)
                </div>
              </dl>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {categories.slice(0, 4).map((category) => {
                const src = imageSrc(category.image_url);
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
                          alt={category.name}
                          loading="lazy"
                          className="size-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="size-full bg-white/5" />
                      )}
                    </div>
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-sm font-semibold">
                      {category.name}
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
              <div key={item.title} className="flex gap-3">
                <item.icon className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <h3 className="font-display text-base font-bold">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="container-page py-14 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="eyebrow">Sortiment</span>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight">Kategórie produktov</h2>
            </div>
            <Link to="/kategorie" className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
              Všetky kategórie <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                to="/kategorie/$slug"
                params={{ slug: category.slug }}
                className="rise rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
              >
                <h3 className="font-display text-lg font-bold">{category.name}</h3>
                {category.description && (
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{category.description}</p>
                )}
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  Zobraziť <ArrowRight className="size-4" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {featured.items.length > 0 && (
          <section className="bg-surface py-14 sm:py-20">
            <div className="container-page">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="eyebrow">Výber</span>
                  <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight">Odporúčané produkty</h2>
                </div>
                <Link to="/produkty" className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  Celý katalóg <ArrowRight className="size-4" />
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
              <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                Potrebujete cenovú ponuku?
              </h2>
              <p className="mt-2 max-w-xl text-sm opacity-80">
                Napíšte nám alebo zavolajte — pripravíme ponuku na zváraciu techniku, plyny aj ochranné prostriedky.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href={`tel:${SITE.phone.replace(/\s/g, "")}`}>Zavolať</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/25 bg-transparent text-ink-foreground hover:bg-white/10">
                <Link to="/kontakt">Kontakt</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
