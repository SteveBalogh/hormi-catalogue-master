import { Link } from "@tanstack/react-router";
import { ImageOff } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatPrice, imageSrc, type ProductDTO } from "@/lib/catalog-types";

export function ProductCard({ product }: { product: ProductDTO }) {
  const src = imageSrc(product.main_image);
  const price = formatPrice(product.price, product.currency);

  return (
    <Link
      to="/produkty/$slug"
      params={{ slug: product.slug }}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-secondary">
        {src ? (
          <img
            src={src}
            alt={product.name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <ImageOff className="size-8" />
          </div>
        )}
        {product.featured && (
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">Odporúčané</Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.category_name && (
          <span className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            {product.category_name}
          </span>
        )}
        <h3 className="font-display text-base leading-snug font-semibold text-foreground">{product.name}</h3>
        {product.short_description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{product.short_description}</p>
        )}
        <div className="mt-auto flex items-end justify-between pt-3">
          <span className="font-display text-lg font-bold text-foreground">
            {price ?? <span className="text-sm font-medium text-muted-foreground">Cena na vyžiadanie</span>}
          </span>
          {product.availability && <span className="text-xs text-muted-foreground">{product.availability}</span>}
        </div>
      </div>
    </Link>
  );
}
