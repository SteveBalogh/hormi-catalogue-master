import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ImageOff, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AdminDenied, AdminShell } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCategories } from "@/lib/catalog.functions";
import {
  adminDeleteProduct,
  adminListProducts,
  getMyAdminStatus,
} from "@/lib/admin.functions";
import { STATUS_LABELS, formatPrice, imageSrc, type ProductDTO } from "@/lib/catalog-types";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Správa produktov – administrácia HORMI" },
      { name: "description", content: "Interná správa produktového katalógu HORMI s.r.o." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminProducts,
});

const PAGE_SIZE = 20;

function AdminProducts() {
  const statusFn = useServerFn(getMyAdminStatus);
  const listFn = useServerFn(adminListProducts);
  const deleteFn = useServerFn(adminDeleteProduct);
  const categoriesFn = useServerFn(getCategories);
  const queryClient = useQueryClient();

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<ProductDTO | null>(null);
  const [creating, setCreating] = useState(false);

  const adminQuery = useQuery({ queryKey: ["admin-status"], queryFn: () => statusFn({}) });
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: () => categoriesFn({}) });

  const isAdmin = adminQuery.data?.admin === true;

  const productsQuery = useQuery({
    queryKey: ["admin-products", q, status, page],
    queryFn: () => listFn({ data: { q: q || undefined, status, page, pageSize: PAGE_SIZE } }),
    enabled: isAdmin,
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: async () => {
      toast.success("Produkt odstránený");
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (adminQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Načítavam…</div>
    );
  }
  if (!isAdmin) return <AdminDenied />;

  const total = productsQuery.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <AdminShell
      title="Produkty"
      description={`${total} produktov v katalógu`}
      actions={
        <Button onClick={() => setCreating(true)}>
          <Plus className="size-4" /> Nový produkt
        </Button>
      }
    >
      <div className="flex flex-wrap gap-3">
        <Input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Hľadať podľa názvu alebo kódu…"
          className="max-w-sm"
        />
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Všetky stavy</SelectItem>
            <SelectItem value="active">Aktívne</SelectItem>
            <SelectItem value="draft">Koncepty</SelectItem>
            <SelectItem value="archived">Archivované</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16" />
              <TableHead>Názov</TableHead>
              <TableHead className="hidden md:table-cell">Kategória</TableHead>
              <TableHead className="hidden sm:table-cell">Kód</TableHead>
              <TableHead>Cena</TableHead>
              <TableHead>Stav</TableHead>
              <TableHead className="text-right">Akcie</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productsQuery.isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  Načítavam produkty…
                </TableCell>
              </TableRow>
            )}
            {productsQuery.data?.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  Žiadne produkty nevyhovujú filtru.
                </TableCell>
              </TableRow>
            )}
            {productsQuery.data?.items.map((product) => {
              const src = imageSrc(product.main_image);
              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex size-11 items-center justify-center overflow-hidden rounded-md bg-secondary">
                      {src ? (
                        <img src={src} alt="" className="size-full object-cover" />
                      ) : (
                        <ImageOff className="size-4 text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {product.name}
                    {product.featured && (
                      <Badge variant="secondary" className="ml-2 align-middle">
                        Odporúčané
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {product.category_name ?? "—"}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">{product.sku ?? "—"}</TableCell>
                  <TableCell>{formatPrice(product.price, product.currency) ?? "Na vyžiadanie"}</TableCell>
                  <TableCell>
                    <Badge variant={product.status === "active" ? "default" : "outline"}>
                      {STATUS_LABELS[product.status] ?? product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="sm" onClick={() => setEditing(product)} aria-label="Upraviť">
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="Odstrániť"
                      onClick={() => {
                        if (confirm(`Odstrániť produkt "${product.name}"?`)) removeMutation.mutate(product.id);
                      }}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {pages > 1 && (
        <div className="mt-5 flex items-center justify-center gap-3 text-sm">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Predchádzajúca
          </Button>
          <span className="text-muted-foreground">
            Strana {page} z {pages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>
            Nasledujúca
          </Button>
        </div>
      )}

      <Dialog
        open={creating || editing !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCreating(false);
            setEditing(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Upraviť produkt" : "Nový produkt"}</DialogTitle>
          </DialogHeader>
          <ProductForm
            product={editing}
            categories={categoriesQuery.data ?? []}
            onSaved={async () => {
              setCreating(false);
              setEditing(null);
              await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
            }}
          />
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
