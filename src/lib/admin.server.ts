import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import type { ProductDTO } from "./catalog-types";
import { mapProduct } from "./catalog.server";

type Client = SupabaseClient<Database>;

const PRODUCT_COLUMNS =
  "id, sku, name, slug, category_id, short_description, description, price, currency, status, availability, featured, main_image, additional_images, specifications, documents, sort_order, created_at, updated_at, categories(name, slug)";

export async function assertAdmin(supabase: Client, _userId: string): Promise<void> {
  const { data, error } = await supabase.rpc("current_user_has_role", { _role: "admin" });
  if (error) throw new Error("Nepodarilo sa overiť oprávnenia.");
  if (!data) throw new Error("Prístup zamietnutý: chýba rola admin.");
}

export async function isAdmin(supabase: Client, _userId: string): Promise<boolean> {
  const { data } = await supabase.rpc("current_user_has_role", { _role: "admin" });
  return Boolean(data);
}

export type AdminProductInput = {
  id?: string | undefined;
  sku?: string | null | undefined;
  name: string;
  slug: string;
  category_id?: string | null | undefined;
  short_description?: string | null | undefined;
  description?: string | null | undefined;
  price?: number | null | undefined;
  currency?: string | undefined;
  status: string;
  availability?: string | null | undefined;
  featured: boolean;
  main_image?: string | null | undefined;
  additional_images: string[];
  specifications: { label: string; value: string }[];
  documents: { label: string; url: string }[];
  sort_order: number;
};

export async function listProducts(
  supabase: Client,
  input: { q?: string | undefined; status?: string | undefined; category?: string | undefined; page: number; pageSize: number },
): Promise<{ items: ProductDTO[]; total: number }> {
  let query = supabase.from("products").select(PRODUCT_COLUMNS, { count: "exact" });
  if (input.status && input.status !== "all") query = query.eq("status", input.status);
  if (input.category) query = query.eq("category_id", input.category);
  if (input.q) {
    const term = input.q.replace(/[%,()]/g, " ").trim();
    if (term) query = query.or(`name.ilike.%${term}%,sku.ilike.%${term}%`);
  }
  const from = (input.page - 1) * input.pageSize;
  const { data, error, count } = await query
    .order("updated_at", { ascending: false })
    .range(from, from + input.pageSize - 1);
  if (error) throw error;
  return {
    items: (data ?? []).map((row) => mapProduct(row as never)),
    total: count ?? 0,
  };
}

export async function saveProduct(supabase: Client, input: AdminProductInput): Promise<{ id: string }> {
  const payload = {
    sku: input.sku ?? null,
    name: input.name,
    slug: input.slug,
    category_id: input.category_id ?? null,
    short_description: input.short_description ?? null,
    description: input.description ?? null,
    price: input.price ?? null,
    currency: input.currency ?? "EUR",
    status: input.status,
    availability: input.availability ?? null,
    featured: input.featured,
    main_image: input.main_image ?? null,
    additional_images: input.additional_images,
    specifications: input.specifications,
    documents: input.documents,
    sort_order: input.sort_order,
  };

  if (input.id) {
    const { error } = await supabase.from("products").update(payload).eq("id", input.id);
    if (error) throw error;
    return { id: input.id };
  }
  const { data, error } = await supabase.from("products").insert(payload).select("id").single();
  if (error) throw error;
  return { id: data.id };
}

export async function removeProduct(supabase: Client, id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export type ImportRow = Record<string, string>;

export type ImportOutcome = {
  total: number;
  created: number;
  updated: number;
  errors: { row: number; message: string }[];
};

function slugifyServer(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function parsePrice(value: string | undefined): number | null {
  if (!value) return null;
  const normalized = value.replace(/\s|€/g, "").replace(",", ".");
  const num = Number(normalized);
  return Number.isFinite(num) ? num : null;
}

export async function importProducts(
  supabase: Client,
  userId: string,
  input: { filename: string; rows: ImportRow[] },
): Promise<ImportOutcome> {
  const { data: cats } = await supabase.from("categories").select("id, name, slug");
  const catByKey = new Map<string, string>();
  for (const c of cats ?? []) {
    catByKey.set(c.slug.toLowerCase(), c.id);
    catByKey.set(c.name.toLowerCase().trim(), c.id);
  }

  const outcome: ImportOutcome = { total: input.rows.length, created: 0, updated: 0, errors: [] };

  for (let i = 0; i < input.rows.length; i++) {
    const row = input.rows[i]!;
    const rowNumber = i + 2;
    const name = (row["name"] ?? "").trim();
    if (!name) {
      outcome.errors.push({ row: rowNumber, message: "Chýba názov produktu." });
      continue;
    }
    const sku = (row["sku"] ?? "").trim() || null;
    const slug = ((row["slug"] ?? "").trim() || slugifyServer(name)) || slugifyServer(sku ?? "produkt");
    const categoryKey = (row["category"] ?? "").trim().toLowerCase();
    const categoryId = categoryKey ? (catByKey.get(categoryKey) ?? null) : null;
    if (categoryKey && !categoryId) {
      outcome.errors.push({ row: rowNumber, message: `Neznáma kategória "${row["category"]}" – produkt uložený bez kategórie.` });
    }
    const status = ["active", "draft", "archived"].includes((row["status"] ?? "").trim())
      ? (row["status"] ?? "").trim()
      : "active";

    const specifications: { label: string; value: string }[] = [];
    const specRaw = (row["specifications"] ?? "").trim();
    if (specRaw) {
      for (const part of specRaw.split(/[;\n]/)) {
        const [label, ...rest] = part.split(":");
        if (label && rest.length) specifications.push({ label: label.trim(), value: rest.join(":").trim() });
      }
    }

    const payload = {
      sku,
      name,
      slug,
      category_id: categoryId,
      short_description: (row["short_description"] ?? "").trim() || null,
      description: (row["description"] ?? "").trim() || null,
      price: parsePrice(row["price"]),
      currency: (row["currency"] ?? "").trim() || "EUR",
      status,
      availability: (row["availability"] ?? "").trim() || null,
      featured: /^(1|true|ano|áno|yes)$/i.test((row["featured"] ?? "").trim()),
      main_image: (row["main_image"] ?? "").trim() || null,
      additional_images: (row["additional_images"] ?? "")
        .split(/[;,\n]/)
        .map((s) => s.trim())
        .filter(Boolean),
      specifications,
      documents: [],
      sort_order: Number((row["sort_order"] ?? "").trim()) || 0,
    };

    let existingId: string | null = null;
    if (sku) {
      const { data } = await supabase.from("products").select("id").eq("sku", sku).maybeSingle();
      existingId = data?.id ?? null;
    }
    if (!existingId) {
      const { data } = await supabase.from("products").select("id").eq("slug", slug).maybeSingle();
      existingId = data?.id ?? null;
    }

    if (existingId) {
      const { error } = await supabase.from("products").update(payload).eq("id", existingId);
      if (error) outcome.errors.push({ row: rowNumber, message: error.message });
      else outcome.updated += 1;
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) outcome.errors.push({ row: rowNumber, message: error.message });
      else outcome.created += 1;
    }
  }

  await supabase.from("import_logs").insert({
    filename: input.filename,
    total_rows: outcome.total,
    created_count: outcome.created,
    updated_count: outcome.updated,
    error_count: outcome.errors.length,
    warnings: outcome.errors,
    imported_by: userId,
  });

  return outcome;
}

export async function listImportLogs(supabase: Client) {
  const { data, error } = await supabase
    .from("import_logs")
    .select("id, filename, total_rows, created_count, updated_count, error_count, created_at")
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data ?? [];
}
