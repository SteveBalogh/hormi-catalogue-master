import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ImageOff, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminSaveProduct } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import {
  PRODUCT_STATUSES,
  STATUS_LABELS,
  imageSrc,
  slugify,
  type CategoryDTO,
  type DocLink,
  type ProductDTO,
  type Spec,
} from "@/lib/catalog-types";

const BUCKET = "product-images";

type FormState = {
  sku: string;
  name: string;
  slug: string;
  category_id: string;
  short_description: string;
  description: string;
  price: string;
  price_on_request: boolean;
  currency: string;
  status: string;
  availability: string;
  featured: boolean;
  main_image: string;
  additional_images: string[];
  specifications: Spec[];
  documents: DocLink[];
  sort_order: string;
};

function toForm(product: ProductDTO | null): FormState {
  return {
    sku: product?.sku ?? "",
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    category_id: product?.category_id ?? "",
    short_description: product?.short_description ?? "",
    description: product?.description ?? "",
    price: product?.price != null ? String(product.price) : "",
    price_on_request: product?.price == null,
    currency: product?.currency ?? "EUR",
    status: product?.status ?? "active",
    availability: product?.availability ?? "",
    featured: product?.featured ?? false,
    main_image: product?.main_image ?? "",
    additional_images: product?.additional_images ?? [],
    specifications: product?.specifications ?? [],
    documents: product?.documents ?? [],
    sort_order: String(product?.sort_order ?? 0),
  };
}

export function ProductForm({
  product,
  categories,
  onSaved,
}: {
  product: ProductDTO | null;
  categories: CategoryDTO[];
  onSaved: () => void | Promise<void>;
}) {
  const saveFn = useServerFn(adminSaveProduct);
  const [form, setForm] = useState<FormState>(() => toForm(product));
  const [uploading, setUploading] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const name = form.name.trim();
      if (name.length < 2) throw new Error("Zadajte názov produktu.");
      const slug = (form.slug.trim() || slugify(name)).slice(0, 120);
      const price = form.price_on_request
        ? null
        : form.price.trim() === ""
          ? null
          : Number(form.price.replace(",", "."));
      if (price !== null && (Number.isNaN(price) || price < 0)) throw new Error("Neplatná cena.");

      return saveFn({
        data: {
          ...(product?.id ? { id: product.id } : {}),
          sku: form.sku.trim() || null,
          name,
          slug,
          category_id: form.category_id || null,
          short_description: form.short_description.trim() || null,
          description: form.description.trim() || null,
          price,
          currency: form.currency.trim() || "EUR",
          status: form.status as (typeof PRODUCT_STATUSES)[number],
          availability: form.availability.trim() || null,
          featured: form.featured,
          main_image: form.main_image.trim() || null,
          additional_images: form.additional_images.filter(Boolean),
          specifications: form.specifications.filter((s) => s.label.trim() && s.value.trim()),
          documents: form.documents.filter((d) => d.label.trim() && d.url.trim()),
          sort_order: Number(form.sort_order) || 0,
        },
      });
    },
    onSuccess: async () => {
      toast.success(product ? "Produkt uložený" : "Produkt vytvorený");
      await onSaved();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  async function uploadFiles(files: FileList | null, target: "main" | "additional") {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const paths: string[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path = `produkty/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
          cacheControl: "31536000",
          upsert: false,
        });
        if (error) throw new Error(error.message);
        paths.push(path);
      }
      if (target === "main" && paths[0]) set("main_image", paths[0]);
      else setForm((prev) => ({ ...prev, additional_images: [...prev.additional_images, ...paths].slice(0, 12) }));
      toast.success("Obrázky nahrané");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nahrávanie zlyhalo");
    } finally {
      setUploading(false);
    }
  }

  const mainSrc = imageSrc(form.main_image);

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        saveMutation.mutate();
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Názov produktu *</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => {
              const value = e.target.value;
              setForm((prev) => ({
                ...prev,
                name: value,
                slug: product ? prev.slug : slugify(value),
              }));
            }}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">URL slug</Label>
          <Input id="slug" value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="nazov-produktu" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sku">Kód (SKU)</Label>
          <Input id="sku" value={form.sku} onChange={(e) => set("sku", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Kategória</Label>
          <Select value={form.category_id || "none"} onValueChange={(v) => set("category_id", v === "none" ? "" : v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Bez kategórie</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Stav</Label>
          <Select value={form.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Cena (EUR)</Label>
          <Input
            id="price"
            inputMode="decimal"
            value={form.price}
            disabled={form.price_on_request}
            onChange={(e) => set("price", e.target.value)}
            placeholder="0,00"
          />
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Switch
              checked={form.price_on_request}
              onCheckedChange={(v) => set("price_on_request", v)}
            />
            Cena na dopyt (bez ceny)
          </label>
        </div>
        <div className="space-y-2">
          <Label htmlFor="availability">Dostupnosť</Label>
          <Input
            id="availability"
            value={form.availability}
            onChange={(e) => set("availability", e.target.value)}
            placeholder="Na sklade"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="short">Krátky popis</Label>
          <Textarea
            id="short"
            rows={2}
            value={form.short_description}
            onChange={(e) => set("short_description", e.target.value)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Podrobný popis</Label>
          <Textarea
            id="description"
            rows={5}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sort">Poradie</Label>
          <Input id="sort" inputMode="numeric" value={form.sort_order} onChange={(e) => set("sort_order", e.target.value)} />
        </div>
        <div className="flex items-center gap-3 pt-6">
          <Switch id="featured" checked={form.featured} onCheckedChange={(v) => set("featured", v)} />
          <Label htmlFor="featured">Odporúčaný produkt</Label>
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-border p-4">
        <div className="flex items-center justify-between">
          <Label>Obrázky</Label>
          {uploading && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
        </div>
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex size-24 items-center justify-center overflow-hidden rounded-md border border-border bg-secondary">
            {mainSrc ? (
              <img src={mainSrc} alt="" className="size-full object-cover" />
            ) : (
              <ImageOff className="size-5 text-muted-foreground" />
            )}
          </div>
          <div className="space-y-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm font-medium hover:bg-accent">
              <Upload className="size-4" /> Hlavný obrázok
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => void uploadFiles(e.target.files, "main")}
              />
            </label>
            <label className="ml-2 inline-flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm font-medium hover:bg-accent">
              <Plus className="size-4" /> Ďalšie obrázky
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => void uploadFiles(e.target.files, "additional")}
              />
            </label>
            <Input
              value={form.main_image}
              onChange={(e) => set("main_image", e.target.value)}
              placeholder="Cesta v úložisku alebo URL"
              className="mt-2 w-72"
            />
          </div>
        </div>
        {form.additional_images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {form.additional_images.map((path, index) => {
              const src = imageSrc(path);
              return (
                <div key={`${path}-${index}`} className="relative size-16 overflow-hidden rounded-md border border-border">
                  {src && <img src={src} alt="" className="size-full object-cover" />}
                  <button
                    type="button"
                    aria-label="Odstrániť obrázok"
                    className="absolute top-0 right-0 bg-destructive p-0.5 text-destructive-foreground"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        additional_images: prev.additional_images.filter((_, i) => i !== index),
                      }))
                    }
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-3 rounded-lg border border-border p-4">
        <div className="flex items-center justify-between">
          <Label>Technické parametre</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setForm((prev) => ({ ...prev, specifications: [...prev.specifications, { label: "", value: "" }] }))}
          >
            <Plus className="size-4" /> Pridať
          </Button>
        </div>
        {form.specifications.length === 0 && (
          <p className="text-sm text-muted-foreground">Žiadne parametre.</p>
        )}
        {form.specifications.map((spec, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={spec.label}
              placeholder="Parameter"
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  specifications: prev.specifications.map((s, i) =>
                    i === index ? { ...s, label: e.target.value } : s,
                  ),
                }))
              }
            />
            <Input
              value={spec.value}
              placeholder="Hodnota"
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  specifications: prev.specifications.map((s, i) =>
                    i === index ? { ...s, value: e.target.value } : s,
                  ),
                }))
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label="Odstrániť parameter"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  specifications: prev.specifications.filter((_, i) => i !== index),
                }))
              }
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-3 rounded-lg border border-border p-4">
        <div className="flex items-center justify-between">
          <Label>Dokumenty (katalógy, certifikáty)</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setForm((prev) => ({ ...prev, documents: [...prev.documents, { label: "", url: "" }] }))}
          >
            <Plus className="size-4" /> Pridať
          </Button>
        </div>
        {form.documents.map((doc, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={doc.label}
              placeholder="Názov dokumentu"
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  documents: prev.documents.map((d, i) => (i === index ? { ...d, label: e.target.value } : d)),
                }))
              }
            />
            <Input
              value={doc.url}
              placeholder="https://…"
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  documents: prev.documents.map((d, i) => (i === index ? { ...d, url: e.target.value } : d)),
                }))
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label="Odstrániť dokument"
              onClick={() =>
                setForm((prev) => ({ ...prev, documents: prev.documents.filter((_, i) => i !== index) }))
              }
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={saveMutation.isPending || uploading}>
          {saveMutation.isPending && <Loader2 className="size-4 animate-spin" />}
          {product ? "Uložiť zmeny" : "Vytvoriť produkt"}
        </Button>
      </div>
    </form>
  );
}
