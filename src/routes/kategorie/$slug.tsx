import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";

import { ProductCard } from "@/components/site/ProductCard";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Button } from "@/components/ui/button";
import { getCategoryBySlug, getProducts } from "@/lib/catalog.functions";
import { categoryImage } from "@/lib/category-images";
import { useLocale } from "@/lib/i18n";

function categoryQuery(slug: string) {
  return queryOptions({
    queryKey: ["category", slug],
    queryFn: () => getCategoryBySlug({ data: { slug } }),
  });
}

function categoryProductsQuery(slug: string) {
  return queryOptions({
    queryKey: ["products", { category: slug, limit: 24 }],
    queryFn: () => getProducts({ data: { category: slug, limit: 24 } }),
  });
}

export const Route = createFileRoute("/kategorie/$slug")({
  loader: async ({ context, params }) => {
    const [category] = await Promise.all([
      context.queryClient.ensureQueryData(categoryQuery(params.slug)),
      context.queryClient.ensureQueryData(categoryProductsQuery(params.slug)),
    ]);
    if (!category) throw notFound();
    return { name: category.name, description: category.description };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Kategória nenájdená | HORMI" }, { name: "robots", content: "noindex" }] };
    }
    const desc = loaderData.description ?? `${loaderData.name} – sortiment HORMI s.r.o. Komárno.`;
    return {
      meta: [
        { title: `${loaderData.name} | HORMI Komárno` },
        { name: "description", content: desc.slice(0, 158) },
        { property: "og:title", content: `${loaderData.name} | HORMI` },
        { property: "og:description", content: desc.slice(0, 158) },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CategoryPage,
  errorComponent: () => <div className="p-10 text-center text-muted-foreground">Kategóriu sa nepodarilo načítať.</div>,
  notFoundComponent: () => <CategoryNotFound />,
});

function CategoryNotFound() {
  const { t } = useLocale();
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-extrabold">{t("category.notFoundTitle")}</h1>
        <Button asChild className="mt-6">
          <Link to="/kategorie">{t("home.allCategories")}</Link>
        </Button>
      </main>
      <SiteFooter />
    </div>
  );
}

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data: category } = useSuspenseQuery(categoryQuery(slug));
  const { data: products } = useSuspenseQuery(categoryProductsQuery(slug));
  const { t, categoryName, categoryDescription } = useLocale();

  if (!category) return null;
  const label = categoryName(category.slug, category.name);
  const description = categoryDescription(category.slug, category.description);
  const src = categoryImage(category.slug, category.image_url);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <nav aria-label={t("common.breadcrumb")} className="text-xs text-muted-foreground">
          <Link to="/" className="hover:underline">
            {t("nav.home")}
          </Link>{" "}
          /{" "}
          <Link to="/kategorie" className="hover:underline">
            {t("nav.categories")}
          </Link>{" "}
          / <span className="text-foreground">{label}</span>
        </nav>

        <div className="mt-4 grid gap-6 sm:grid-cols-[minmax(0,1fr)_260px] sm:items-center">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{label}</h1>
            {description && <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{description}</p>}
            <div className="mt-5">
              <Button asChild variant="outline" size="sm">
                <Link to="/produkty" search={{ category: slug }}>
                  {t("category.filterInCatalogue")}
                </Link>
              </Button>
            </div>
          </div>
          {src && (
            <div className="aspect-4/3 overflow-hidden rounded-xl border border-border bg-secondary">
              <img src={src} alt={`HORMI ${label}`} loading="lazy" className="size-full object-cover" />
            </div>
          )}
        </div>

        {products.items.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            {t("category.empty")}
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
