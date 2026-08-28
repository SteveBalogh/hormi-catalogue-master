import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";

import { ProductCard } from "@/components/site/ProductCard";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Button } from "@/components/ui/button";
import { getCategoryBySlug, getProducts } from "@/lib/catalog.functions";

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
  errorComponent: () => (
    <div className="p-10 text-center text-muted-foreground">Kategóriu sa nepodarilo načítať.</div>
  ),
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-extrabold">Kategóriu sme nenašli</h1>
        <Button asChild className="mt-6">
          <Link to="/kategorie">Všetky kategórie</Link>
        </Button>
      </main>
      <SiteFooter />
    </div>
  ),
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data: category } = useSuspenseQuery(categoryQuery(slug));
  const { data: products } = useSuspenseQuery(categoryProductsQuery(slug));

  if (!category) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <nav aria-label="Navigácia" className="text-xs text-muted-foreground">
          <Link to="/" className="hover:underline">
            Domov
          </Link>{" "}
          /{" "}
          <Link to="/kategorie" className="hover:underline">
            Kategórie
          </Link>{" "}
          / <span className="text-foreground">{category.name}</span>
        </nav>

        <h1 className="font-display mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">{category.name}</h1>
        {category.description && (
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{category.description}</p>
        )}
        <div className="mt-5">
          <Button asChild variant="outline" size="sm">
            <Link to="/produkty" search={{ category: slug }}>
              Filtrovať v katalógu
            </Link>
          </Button>
        </div>

        {products.items.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            V tejto kategórii momentálne nemáme zverejnené produkty.
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
