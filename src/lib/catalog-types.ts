export type Spec = { label: string; value: string };
export type DocLink = { label: string; url: string };

export type ProductDTO = {
  id: string;
  sku: string | null;
  name: string;
  slug: string;
  category_id: string | null;
  category_name: string | null;
  category_slug: string | null;
  short_description: string | null;
  description: string | null;
  price: number | null;
  currency: string;
  status: string;
  availability: string | null;
  featured: boolean;
  main_image: string | null;
  additional_images: string[];
  specifications: Spec[];
  documents: DocLink[];
  sort_order: number;
  created_at?: string | undefined;
  updated_at?: string | undefined;
};

export type CategoryDTO = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  product_count?: number;
};

export const PRODUCT_STATUSES = ["active", "draft", "archived"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const STATUS_LABELS: Record<string, string> = {
  active: "Aktívny",
  draft: "Koncept",
  archived: "Archivovaný",
};

export const SORT_OPTIONS = [
  { value: "recommended", label: "Odporúčané" },
  { value: "name-asc", label: "Názov A – Z" },
  { value: "name-desc", label: "Názov Z – A" },
  { value: "price-asc", label: "Cena od najnižšej" },
  { value: "price-desc", label: "Cena od najvyššej" },
  { value: "newest", label: "Najnovšie" },
] as const;

export function formatPrice(price: number | null, currency = "EUR"): string | null {
  if (price === null || price === undefined) return null;
  return new Intl.NumberFormat("sk-SK", {
    style: "currency",
    currency: currency || "EUR",
    minimumFractionDigits: 2,
  }).format(price);
}

/** Storage paths are proxied through a cached public media route; external URLs pass through. */
export function imageSrc(value: string | null | undefined): string | null {
  if (!value) return null;
  if (/^(https?:)?\/\//i.test(value) || value.startsWith("data:")) return value;
  return `/api/public/media/${value.replace(/^\/+/, "")}`;
}

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
