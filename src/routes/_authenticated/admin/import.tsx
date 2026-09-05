import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AlertTriangle, CheckCircle2, FileSpreadsheet, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

import { AdminDenied, AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  adminImportProducts,
  adminListImportLogs,
  getMyAdminStatus,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/import")({
  head: () => ({
    meta: [
      { title: "Import produktov – administrácia HORMI" },
      { name: "description", content: "Import produktového katalógu z Excelu alebo CSV." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminImport,
});

const TARGET_FIELDS = [
  { key: "name", label: "Názov produktu *" },
  { key: "sku", label: "Kód (SKU)" },
  { key: "slug", label: "URL slug" },
  { key: "category", label: "Kategória" },
  { key: "short_description", label: "Krátky popis" },
  { key: "description", label: "Podrobný popis" },
  { key: "price", label: "Cena" },
  { key: "currency", label: "Mena" },
  { key: "status", label: "Stav (active/draft/archived)" },
  { key: "availability", label: "Dostupnosť" },
  { key: "featured", label: "Odporúčaný (1/áno)" },
  { key: "main_image", label: "Hlavný obrázok" },
  { key: "additional_images", label: "Ďalšie obrázky" },
  { key: "specifications", label: "Parametre (názov:hodnota; …)" },
  { key: "sort_order", label: "Poradie" },
] as const;

const NONE = "__none__";

function autoMatch(header: string): string | null {
  const key = header.trim().toLowerCase();
  const dict: Record<string, string> = {
    "názov": "name",
    nazov: "name",
    name: "name",
    produkt: "name",
    sku: "sku",
    "kód": "sku",
    kod: "sku",
    slug: "slug",
    "kategória": "category",
    kategoria: "category",
    category: "category",
    popis: "description",
    description: "description",
    "krátky popis": "short_description",
    short_description: "short_description",
    cena: "price",
    price: "price",
    mena: "currency",
    currency: "currency",
    stav: "status",
    status: "status",
    "dostupnosť": "availability",
    dostupnost: "availability",
    availability: "availability",
    "odporúčané": "featured",
    featured: "featured",
    obrazok: "main_image",
    "obrázok": "main_image",
    main_image: "main_image",
    obrazky: "additional_images",
    additional_images: "additional_images",
    parametre: "specifications",
    specifications: "specifications",
    poradie: "sort_order",
    sort_order: "sort_order",
  };
  return dict[key] ?? null;
}

function AdminImport() {
  const statusFn = useServerFn(getMyAdminStatus);
  const importFn = useServerFn(adminImportProducts);
  const logsFn = useServerFn(adminListImportLogs);
  const queryClient = useQueryClient();

  const adminQuery = useQuery({ queryKey: ["admin-status"], queryFn: () => statusFn({}) });
  const isAdmin = adminQuery.data?.admin === true;
  const logsQuery = useQuery({ queryKey: ["import-logs"], queryFn: () => logsFn({}), enabled: isAdmin });

  const [filename, setFilename] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [parsing, setParsing] = useState(false);

  const importMutation = useMutation({
    mutationFn: async () => {
      const nameCol = mapping["name"];
      if (!nameCol) throw new Error("Namapujte stĺpec s názvom produktu.");
      const mapped = rows
        .map((row) => {
          const out: Record<string, string> = {};
          for (const field of TARGET_FIELDS) {
            const col = mapping[field.key];
            if (!col) continue;
            const index = headers.indexOf(col);
            if (index >= 0) out[field.key] = String(row[index] ?? "").trim();
          }
          return out;
        })
        .filter((row) => (row["name"] ?? "").length > 0);
      if (mapped.length === 0) throw new Error("Súbor neobsahuje žiadne použiteľné riadky.");
      return importFn({ data: { filename: filename || "import.xlsx", rows: mapped } });
    },
    onSuccess: async (result) => {
      toast.success(`Import hotový: ${result.created} nových, ${result.updated} aktualizovaných`);
      await queryClient.invalidateQueries({ queryKey: ["import-logs"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setParsing(true);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) throw new Error("Súbor neobsahuje žiadny list.");
      const sheet = workbook.Sheets[sheetName]!;
      const matrix = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, blankrows: false, raw: false });
      const head = (matrix[0] ?? []).map((value) => String(value ?? "").trim());
      if (head.length === 0) throw new Error("Chýba hlavička so názvami stĺpcov.");
      const body = matrix.slice(1).map((row) => head.map((_, i) => String(row[i] ?? "")));
      const next: Record<string, string> = {};
      for (const column of head) {
        const target = autoMatch(column);
        if (target && !next[target]) next[target] = column;
      }
      setFilename(file.name);
      setHeaders(head);
      setRows(body.slice(0, 2000));
      setMapping(next);
      importMutation.reset();
      toast.success(`Načítaných ${body.length} riadkov`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Súbor sa nepodarilo prečítať");
    } finally {
      setParsing(false);
    }
  }

  if (adminQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Načítavam…</div>
    );
  }
  if (!isAdmin) return <AdminDenied />;

  const validRows = rows.filter((row) => {
    const col = mapping["name"];
    if (!col) return false;
    const index = headers.indexOf(col);
    return index >= 0 && String(row[index] ?? "").trim().length > 0;
  }).length;
  const result = importMutation.data;

  return (
    <AdminShell
      title="Import produktov"
      description="Nahrajte Excel (.xlsx) alebo CSV, priraďte stĺpce a spustite import."
    >
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center gap-4">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
            {parsing ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            Vybrať súbor
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => void handleFile(e.target.files?.[0])}
            />
          </label>
          {filename && (
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <FileSpreadsheet className="size-4" /> {filename} — {rows.length} riadkov, {headers.length} stĺpcov
            </span>
          )}
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Produkty sa párujú podľa kódu (SKU), inak podľa slug-u — existujúce záznamy sa aktualizujú, nové sa vytvoria.
          Potrebujete vzor?{" "}
          <a href="/import-vzor.xlsx" download className="font-semibold text-primary hover:underline">
            Stiahnuť vzorový súbor (.xlsx)
          </a>
        </p>
      </div>

      {headers.length > 0 && (
        <div className="mt-6 rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold">Priradenie stĺpcov</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TARGET_FIELDS.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label>{field.label}</Label>
                <Select
                  value={mapping[field.key] ?? NONE}
                  onValueChange={(value) =>
                    setMapping((prev) => {
                      const next = { ...prev };
                      if (value === NONE) delete next[field.key];
                      else next[field.key] = value;
                      return next;
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Nepoužiť" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>Nepoužiť</SelectItem>
                    {headers.map((header) => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Button onClick={() => importMutation.mutate()} disabled={importMutation.isPending || validRows === 0}>
              {importMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              Importovať {validRows} riadkov
            </Button>
            {!mapping["name"] && (
              <span className="inline-flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="size-4" /> Namapujte stĺpec s názvom produktu.
              </span>
            )}
          </div>
        </div>
      )}

      {rows.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((header) => (
                  <TableHead key={header} className="whitespace-nowrap">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.slice(0, 5).map((row, index) => (
                <TableRow key={index}>
                  {headers.map((header, i) => (
                    <TableCell key={header} className="max-w-56 truncate text-sm text-muted-foreground">
                      {row[i]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {result && (
        <div className="mt-6 rounded-xl border border-border bg-card p-6">
          <h2 className="inline-flex items-center gap-2 font-display text-lg font-bold">
            <CheckCircle2 className="size-5 text-success" /> Výsledok importu
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Spracovaných {result.total} riadkov — {result.created} vytvorených, {result.updated} aktualizovaných,{" "}
            {result.errors.length} upozornení.
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-4 space-y-1 text-sm">
              {result.errors.slice(0, 30).map((error, index) => (
                <li key={index} className="text-warning-foreground">
                  Riadok {error.row}: {error.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-bold">História importov</h2>
        {logsQuery.data?.length === 0 && <p className="mt-2 text-sm text-muted-foreground">Zatiaľ žiadne importy.</p>}
        {logsQuery.data && logsQuery.data.length > 0 && (
          <Table className="mt-3">
            <TableHeader>
              <TableRow>
                <TableHead>Súbor</TableHead>
                <TableHead>Riadky</TableHead>
                <TableHead>Nové</TableHead>
                <TableHead>Aktualizované</TableHead>
                <TableHead>Chyby</TableHead>
                <TableHead>Dátum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logsQuery.data.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.filename}</TableCell>
                  <TableCell>{log.total_rows}</TableCell>
                  <TableCell>{log.created_count}</TableCell>
                  <TableCell>{log.updated_count}</TableCell>
                  <TableCell>{log.error_count}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(log.created_at).toLocaleString("sk-SK")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </AdminShell>
  );
}
