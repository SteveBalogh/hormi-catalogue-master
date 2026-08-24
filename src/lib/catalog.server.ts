import { createClient } from "@supabase/supabase-js";

import type { CategoryDTO, DocLink, ProductDTO, Spec } from "./catalog-types";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const url = process.env["SUPABASE_URL"]!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

const PRODUCT_COLUMNS =
  "id, sku, name, slug, category_id, short_description, description, price, currency, status, availability, featured, main_image, additional_images, specifications, documents, sort_order, created_at, updated_at, categories(name, slug)";

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

function toSpecs(value: unknown): Spec[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const r = row as Record<string, unknown>;
      const label = typeof r["label"] === "string" ? r["label"] : null;
      const val = typeof r["value"] === "string" ? r["value"] : r["value"] != null ? String(r["value"]) : null;
      if (!label || val === null) return null;
      return { label, value: val };
    })
    .filter((s): s is Spec => s !== null);
}

function toDocs(value: unknown): DocLink[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const r = row as Record<string, unknown>;
      const url = typeof r["url"] === "string" ? r["url"] : null;
      if (!url) return null;
      return { label: typeof r["label"] === "string" ? r["label"] : url, url };
    })
    .filter((d): d is DocLink => d !== null);
}

type Row = Record<string, unknown> & { categories?: { name: string; slug: string } | null };

export function mapProduct(row: Row): ProductDTO {
  const category = (row.categories ?? null) as { name: string; slug: string } | null;
  return {
    id: String(row["id"]),
    sku: (row["sku"] as string | null) ?? null,
    name: String(row["name"]),
    slug: String(row["slug"]),
    category_id: (row["category_id"] as string | null) ?? null,
    category_name: category?.name ?? null,
    category_slug: category?.slug ?? null,
    short_description: (row["short_description"] as string | null) ?? null,
    description: (row["description"] as string | null) ?? null,
    price: row["price"] === null || row["price"] === undefined ? null : Number(row["price"]),
    currency: (row["currency"] as string) ?? "EUR",
    status: (row["status"] as string) ?? "active",
    availability: (row["availability"] as string | null) ?? null,
    featured: Boolean(row["featured"]),
    main_image: (row["main_image"] as string | null) ?? null,
    additional_images: toStringArray(row["additional_images"]),
    specifications: toSpecs(row["specifications"]),
    documents: toDocs(row["documents"]),
    sort_order: Number(row["sort_order"] ?? 0),
    created_at: row["created_at"] as string | undefined,
    updated_at: row["updated_at"] as string | undefined,
  };
}

export type ProductListResult = {
  items: ProductDTO[];
  total: number;
  page: number;
  pageSize: number;
};

export const fetchCatalog = {
  async categories(): Promise<CategoryDTO[]> {
    const supabase = publicClient();
    const [{ data: cats, error }, { data: products }] = await Promise.all([
      supabase.from("categories").select("id, name, slug, description, image_url, sort_order").order("sort_order"),
      supabase.from("products").select("category_id").eq("status", "active"),
    ]);
    if (error) throw error;
    const counts = new Map<string, number>();
    for (const p of products ?? []) {
      if (!p.category_id) continue;
      counts.set(p.category_id, (counts.get(p.category_id) ?? 0) + 1);
    }
    return (cats ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      image_url: c.image_url,
      sort_order: c.sort_order,
      product_count: counts.get(c.id) ?? 0,
    }));
  },

  async products(input: {
    q?: string | undefined;
    category?: string | undefined;
    sort?: string | undefined;
    featured?: boolean | undefined;
    limit?: number | undefined;
    page?: number | undefined;
  }): Promise<ProductListResult> {
    const supabase = publicClient();
    const pageSize = input.limit ?? 12;
    const page = input.page ?? 1;

    let categoryId: string | null = null;
    if (input.category) {
      const { data } = await supabase.from("categories").select("id").eq("slug", input.category).maybeSingle();
      categoryId = data?.id ?? null;
      if (!categoryId) return { items: [], total: 0, page, pageSize };
    }

    let query = supabase
      .from("products")
      .select(PRODUCT_COLUMNS, { count: "exact" })
      .eq("status", "active");

    if (categoryId) query = query.eq("category_id", categoryId);
    if (input.featured) query = query.eq("featured", true);
    if (input.q) {
      const term = input.q.replace(/[%,()]/g, " ").trim();
      if (term) {
        query = query.or(
          `name.ilike.%${term}%,short_description.ilike.%${term}%,description.ilike.%${term}%,sku.ilike.%${term}%`,
        );
      }
    }

    switch (input.sort) {
      case "name-asc":
        query = query.order("name", { ascending: true });
        break;
      case "name-desc":
        query = query.order("name", { ascending: false });
        break;
      case "price-asc":
        query = query.order("price", { ascending: true, nullsFirst: false });
        break;
      case "price-desc":
        query = query.order("price", { ascending: false, nullsFirst: false });
        break;
      case "newest":
        query = query.order("created_at", { ascending: false });
        break;
      default:
        query = query
          .order("featured", { ascending: false })
          .order("sort_order", { ascending: true })
          .order("name", { ascending: true });
    }

    const from = (page - 1) * pageSize;
    const { data, error, count } = await query.range(from, from + pageSize - 1);
    if (error) throw error;
    return {
      items: (data ?? []).map((row) => mapProduct(row as Row)),
      total: count ?? 0,
      page,
      pageSize,
    };
  },

  async product(slug: string): Promise<{ product: ProductDTO; related: ProductDTO[] } | null> {
    const supabase = publicClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("slug", slug)
      .eq("status", "active")
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const product = mapProduct(data as Row);

    let related: ProductDTO[] = [];
    if (product.category_id) {
      const { data: rel } = await supabase
        .from("products")
        .select(PRODUCT_COLUMNS)
        .eq("status", "active")
        .eq("category_id", product.category_id)
        .neq("id", product.id)
        .limit(4);
      related = (rel ?? []).map((row) => mapProduct(row as Row));
    }
    return { product, related };
  },

  async category(slug: string): Promise<CategoryDTO | null> {
    const supabase = publicClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, description, image_url, sort_order")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return { ...data };
  },
};
