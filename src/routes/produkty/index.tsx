import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";

import { ProductCard } from "@/components/site/ProductCard";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SORT_OPTIONS } from "@/lib/catalog-types";
import { getCategories, getProducts } from "@/lib/catalog.functions";
import { useLocale } from "@/lib/i18n";

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  sort: z.string().optional(),
  featured: z.boolean().optional(),
  page: z.number().int().min(1).optional(),
});

type ProductSearch = z.infer<typeof searchSchema>;

const PAGE_SIZE = 12;

const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: () => getCategories(),
});

function productsQuery(search: ProductSearch) {
  return queryOptions({
    queryKey: ["products", search],
    queryFn: () =>
      getProducts({
        data: {
          ...(search.q ? { q: search.q } : {}),
          ...(search.category ? { category: search.category } : {}),
          ...(search.sort ? { sort: search.sort } : {}),
          ...(search.featured ? { featured: true } : {}),
          limit: PAGE_SIZE,
          page: search.page ?? 1,
        },
      }),
  });
}

export const Route = createFileRoute("/produkty/")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ context, deps }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(categoriesQuery),
      context.queryClient.ensureQueryData(productsQuery(deps)),
    ]);
  },
  head: () => ({
    meta: [
      { title: "Produkty – katalóg zváracej techniky a OOPP | HORMI" },
      {
        name: "description",
        content:
          "Prehľadný katalóg produktov HORMI Komárno: zváracia technika, ochranné pracovné prostriedky, technické plyny, závlahy a reklamný textil.",
      },
      { property: "og:title", content: "Produkty – katalóg HORMI" },
      {
        property: "og:description",
        content: "Vyhľadávajte a filtrujte v celom katalógu produktov HORMI s.r.o. Komárno.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductsPage,
  errorComponent: () => (
    <div className="p-10 text-center text-muted-foreground">Katalóg sa nepodarilo načítať.</div>
  ),
  notFoundComponent: () => <div className="p-10 text-center text-muted-foreground">Nenájdené.</div>,
});

function ProductsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const { data } = useSuspenseQuery(productsQuery(search));
  const { t, categoryName } = useLocale();
  const [term, setTerm] = useState(search.q ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setTerm(search.q ?? "");
  }, [search.q]);

  function update(next: Partial<ProductSearch>) {
    void navigate({ search: (prev) => ({ ...prev, page: undefined, ...next }) });
  }

  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  const page = search.page ?? 1;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <nav aria-label={t("common.breadcrumb")} className="text-xs text-muted-foreground">
          <Link to="/" className="hover:underline">
            {t("nav.home")}
          </Link>{" "}
          / <span className="text-foreground">{t("nav.products")}</span>
        </nav>
        <h1 className="font-display mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {t("products.title")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {data.total} {t("products.intro")}
        </p>

        <form
          className="mt-6 flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            update({ q: term || undefined });
          }}
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder={t("search.cataloguePlaceholder")}
              aria-label={t("search.catalogueLabel")}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit">{t("search.submit")}</Button>
            <Button
              type="button"
              variant="outline"
              className="lg:hidden"
              onClick={() => setFiltersOpen((v) => !v)}
              aria-expanded={filtersOpen}
            >
              <SlidersHorizontal className="size-4" /> {t("products.filters")}
            </Button>
          </div>
        </form>

        <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className={`${filtersOpen ? "block" : "hidden"} lg:block`}>
            <div className="rounded-xl border border-border bg-card p-4">
              <h2 className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">{t("products.categories")}</h2>
              <ul className="mt-3 space-y-1">
                <li>
                  <button
                    type="button"
                    onClick={() => update({ category: undefined })}
                    className={`w-full rounded-md px-2 py-1.5 text-left text-sm ${!search.category ? "bg-secondary font-semibold text-foreground" : "text-muted-foreground hover:bg-secondary/60"}`}
                  >
                    {t("products.all")}
                  </button>
                </li>
                {categories.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => update({ category: c.slug })}
                      className={`flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm ${search.category === c.slug ? "bg-secondary font-semibold text-foreground" : "text-muted-foreground hover:bg-secondary/60"}`}
                    >
                      <span>{categoryName(c.slug, c.name)}</span>
                      <span className="text-xs text-muted-foreground">{c.product_count}</span>
                    </button>
                  </li>
                ))}
              </ul>

              <h2 className="mt-6 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">{t("products.selection")}</h2>
              <label className="mt-3 flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={Boolean(search.featured)}
                  onChange={(e) => update({ featured: e.target.checked || undefined })}
                  className="size-4 accent-[var(--primary)]"
                />
                {t("products.onlyFeatured")}
              </label>
            </div>
          </aside>

          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {t("products.showing")} {data.items.length} {t("products.of")} {data.total}
              </p>
              <Select value={search.sort ?? "recommended"} onValueChange={(v) => update({ sort: v })}>
                <SelectTrigger className="w-56" aria-label={t("products.sortLabel")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {t(`sort.${o.value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {data.items.length === 0 ? (
              <div className="mt-10 rounded-xl border border-dashed border-border p-10 text-center">
                <p className="font-display text-lg font-semibold text-foreground">{t("products.emptyTitle")}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("products.emptyText")}
                </p>
              </div>
            ) : (
              <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {data.items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => void navigate({ search: (prev) => ({ ...prev, page: page - 1 }) })}
                >
                  {t("products.prev")}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => void navigate({ search: (prev) => ({ ...prev, page: page + 1 }) })}
                >
                  {t("products.next")}
                </Button>
              </div>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
