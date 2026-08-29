import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  assertAdmin,
  importProducts,
  isAdmin,
  listImportLogs,
  listProducts,
  removeProduct,
  saveProduct,
} from "./admin.server";

const productSchema = z.object({
  id: z.string().uuid().optional(),
  sku: z.string().max(80).nullable().optional(),
  name: z.string().min(2).max(200),
  slug: z.string().min(1).max(120),
  category_id: z.string().uuid().nullable().optional(),
  short_description: z.string().max(400).nullable().optional(),
  description: z.string().max(8000).nullable().optional(),
  price: z.number().nonnegative().nullable().optional(),
  currency: z.string().max(6).optional(),
  status: z.enum(["active", "draft", "archived"]),
  availability: z.string().max(80).nullable().optional(),
  featured: z.boolean(),
  main_image: z.string().max(500).nullable().optional(),
  additional_images: z.array(z.string().max(500)).max(12),
  specifications: z.array(z.object({ label: z.string().max(120), value: z.string().max(300) })).max(60),
  documents: z.array(z.object({ label: z.string().max(160), url: z.string().max(500) })).max(20),
  sort_order: z.number().int().min(0).max(9999),
});

const listSchema = z.object({
  q: z.string().max(120).optional(),
  status: z.string().max(20).optional(),
  category: z.string().uuid().optional(),
  page: z.number().int().min(1).max(500).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

export const getMyAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => ({
    admin: await isAdmin(context.supabase, context.userId),
  }));

export const adminListProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => listSchema.parse(input ?? {}))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    return listProducts(context.supabase, data);
  });

export const adminSaveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => productSchema.parse(input))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    return saveProduct(context.supabase, data);
  });

export const adminDeleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    await removeProduct(context.supabase, data.id);
    return { ok: true };
  });

export const adminImportProducts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        filename: z.string().max(200),
        rows: z.array(z.record(z.string(), z.string())).min(1).max(2000),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    return importProducts(context.supabase, context.userId, data);
  });

export const adminListImportLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    return listImportLogs(context.supabase);
  });
