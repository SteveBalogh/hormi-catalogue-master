import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, ImageOff } from "lucide-react";

import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getCategories } from "@/lib/catalog.functions";
import { categoryImage } from "@/lib/category-images";
import { useLocale } from "@/lib/i18n";

const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: () => getCategories(),
});

export const Route = createFileRoute("/kategorie/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(categoriesQuery),
  head: () => ({
    meta: [
      { title: "Kategórie produktov | HORMI Komárno" },
      {
        name: "description",
        content:
          "Zváracia technika, ochranné pracovné prostriedky, technické plyny, propán-bután, závlahové systémy a reklamný textil od HORMI s.r.o.",
      },
      { property: "og:title", content: "Kategórie produktov | HORMI" },
      { property: "og:description", content: "Prehľad všetkých kategórií sortimentu HORMI s.r.o. Komárno." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CategoriesPage,
  errorComponent: () => <div className="p-10 text-center text-muted-foreground">Kategórie sa nepodarilo načítať.</div>,
  notFoundComponent: () => <div className="p-10 text-center text-muted-foreground">Nenájdené.</div>,
});

function CategoriesPage() {
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const { t, categoryName, categoryDescription } = useLocale();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10">
        <p className="eyebrow">{t("home.assortment")}</p>
        <h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {t("categories.title")}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{t("categories.intro")}</p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => {
            const src = categoryImage(c.slug, c.image_url);
            const label = categoryName(c.slug, c.name);
            const description = categoryDescription(c.slug, c.description);
            return (
              <Link
                key={c.id}
                to="/kategorie/$slug"
                params={{ slug: c.slug }}
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
              >
                <div className="aspect-16/9 overflow-hidden bg-secondary">
                  {src ? (
                    <img
                      src={src}
                      alt={`HORMI ${label}`}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-muted-foreground">
                      <ImageOff className="size-8" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="font-display text-lg font-semibold">{label}</h2>
                  {description && <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{description}</p>}
                  <span className="mt-auto flex items-center gap-2 pt-4 text-sm font-medium text-accent">
                    {c.product_count} {t("categories.productsCount")}
                    <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
