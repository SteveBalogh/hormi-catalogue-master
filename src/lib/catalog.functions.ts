import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { fetchCatalog } from "./catalog.server";

const listSchema = z.object({
  q: z.string().max(120).optional(),
  category: z.string().max(120).optional(),
  sort: z.string().max(30).optional(),
  featured: z.boolean().optional(),
  limit: z.number().int().min(1).max(48).optional(),
  page: z.number().int().min(1).max(500).optional(),
});

export const getCategories = createServerFn({ method: "GET" }).handler(async () => {
  return fetchCatalog.categories();
});

export const getProducts = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => listSchema.parse(input ?? {}))
  .handler(async ({ data }) => {
    return fetchCatalog.products(data);
  });

export const getProductBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: z.string().max(120) }).parse(input))
  .handler(async ({ data }) => {
    return fetchCatalog.product(data.slug);
  });

export const getCategoryBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: z.string().max(120) }).parse(input))
  .handler(async ({ data }) => {
    return fetchCatalog.category(data.slug);
  });
