import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ImageOff, Mail, Phone } from "lucide-react";
import { useState } from "react";

import { ProductCard } from "@/components/site/ProductCard";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { imageSrc } from "@/lib/catalog-types";
import { getProductBySlug } from "@/lib/catalog.functions";
import { useLocale } from "@/lib/i18n";
import { SITE } from "@/lib/site";

function productQuery(slug: string) {
  return queryOptions({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug({ data: { slug } }),
  });
}

export const Route = createFileRoute("/produkty/$slug")({
  loader: async ({ context, params }) => {
    const result = await context.queryClient.ensureQueryData(productQuery(params.slug));
    if (!result) throw notFound();
    return { name: result.product.name, description: result.product.short_description };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Produkt nenájdený | HORMI" }, { name: "robots", content: "noindex" }] };
    }
    const desc =
      loaderData.description ?? `${loaderData.name} v katalógu HORMI s.r.o. Komárno – zváranie, OOPP a technické plyny.`;
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
  component: ProductPage,
  errorComponent: () => <ProductLoadError />,
  notFoundComponent: () => <ProductNotFound />,
});

function ProductLoadError() {
  const { t } = useLocale();
  return <div className="p-10 text-center text-muted-foreground">{t("product.loadError")}</div>;
}

function ProductNotFound() {
  const { t } = useLocale();
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-extrabold">{t("product.notFoundTitle")}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{t("product.notFoundText")}</p>
        <Button asChild className="mt-6">
          <Link to="/produkty">{t("product.backToCatalogue")}</Link>
        </Button>
      </main>
      <SiteFooter />
    </div>
  );
}

function ProductPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(productQuery(slug));
  const [active, setActive] = useState(0);
  const { t, formatPrice, categoryName, availability } = useLocale();

  if (!data) return null;
  const { product, related } = data;
  const gallery = [product.main_image, ...product.additional_images].filter(
    (v): v is string => typeof v === "string" && v.length > 0,
  );
  const current = imageSrc(gallery[active] ?? null);
  const price = formatPrice(product.price, product.currency);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <nav aria-label={t("common.breadcrumb")} className="text-xs text-muted-foreground">
          <Link to="/" className="hover:underline">
            {t("nav.home")}
          </Link>{" "}
          /{" "}
          <Link to="/produkty" className="hover:underline">
            {t("nav.products")}
          </Link>{" "}
          {product.category_slug && product.category_name ? (
            <>
              /{" "}
              <Link
                to="/kategorie/$slug"
                params={{ slug: product.category_slug }}
                className="hover:underline"
              >
                {categoryName(product.category_slug, product.category_name)}
              </Link>{" "}
            </>
          ) : null}
          / <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <div>
            <div className="aspect-4/3 overflow-hidden rounded-xl border border-border bg-secondary">
              {current ? (
                <img src={current} alt={product.name} className="size-full object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center text-muted-foreground">
                  <ImageOff className="size-10" />
                </div>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {gallery.map((img, i) => (
                  <button
                    key={`${img}-${i}`}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`${t("product.imageLabel")} ${i + 1}`}
                    className={`size-20 overflow-hidden rounded-md border ${i === active ? "border-accent" : "border-border"}`}
                  >
                    <img src={imageSrc(img) ?? ""} alt="" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            {product.category_name && (
              <p className="eyebrow">{categoryName(product.category_slug, product.category_name)}</p>
            )}
            <h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{product.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {product.sku && <Badge variant="outline">{t("product.sku")}: {product.sku}</Badge>}
              {product.availability && <Badge variant="secondary">{availability(product.availability)}</Badge>}
              {product.featured && <Badge>{t("product.featured")}</Badge>}
            </div>
            {product.short_description && (
              <p className="mt-4 text-base text-muted-foreground">{product.short_description}</p>
            )}

            <div className="mt-6 rounded-xl border border-border bg-card p-5">
              <p className="font-display text-3xl font-bold">
                {price ?? <span className="text-lg font-semibold text-muted-foreground">{t("product.priceOnRequest")}</span>}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{t("product.priceNote")}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild>
                  <a href={`tel:${SITE.phone.replace(/\s/g, "")}`}>
                    <Phone className="size-4" /> {SITE.phone}
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a href={`mailto:${SITE.email}?subject=${encodeURIComponent(`${t("quote.subject")}: ${product.name}`)}`}>
                    <Mail className="size-4" /> {t("product.requestQuote")}
                  </a>
                </Button>
              </div>
            </div>

            {product.specifications.length > 0 && (
              <section className="mt-8">
                <h2 className="font-display text-lg font-semibold">{t("product.specifications")}</h2>
                <dl className="mt-3 divide-y divide-border rounded-xl border border-border">
                  {product.specifications.map((s, i) => (
                    <div key={`${s.label}-${i}`} className="grid grid-cols-2 gap-4 px-4 py-2.5 text-sm">
                      <dt className="text-muted-foreground">{s.label}</dt>
                      <dd className="font-medium text-foreground">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {product.documents.length > 0 && (
              <section className="mt-8">
                <h2 className="font-display text-lg font-semibold">{t("product.documents")}</h2>
                <ul className="mt-3 space-y-2 text-sm">
                  {product.documents.map((d, i) => (
                    <li key={`${d.url}-${i}`}>
                      <a href={d.url} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                        {d.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>

        {product.description && (
          <section className="mt-14 max-w-3xl">
            <h2 className="font-display text-xl font-semibold">{t("product.descriptionTitle")}</h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
              {product.description.split(/\n+/).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-xl font-semibold">{t("product.related")}</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
