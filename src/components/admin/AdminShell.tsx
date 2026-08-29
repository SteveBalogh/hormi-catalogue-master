import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, PackageSearch, Upload } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export function AdminShell({ title, description, actions, children }: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="border-b border-border bg-ink text-ink-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
          <Link to="/" className="font-display text-lg font-extrabold tracking-tight">
            HORMI
          </Link>
          <span className="text-xs tracking-[0.18em] uppercase opacity-70">Administrácia</span>
          <nav className="ml-auto flex items-center gap-1">
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium opacity-80 transition-opacity hover:opacity-100 [&.active]:opacity-100"
            >
              <PackageSearch className="size-4" /> Produkty
            </Link>
            <Link
              to="/admin/import"
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium opacity-80 transition-opacity hover:opacity-100 [&.active]:opacity-100"
            >
              <Upload className="size-4" /> Import
            </Link>
            <button
              type="button"
              onClick={() => void signOut()}
              className="ml-2 inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium opacity-80 hover:opacity-100"
            >
              <LogOut className="size-4" /> Odhlásiť
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions}
        </div>
        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}

export function AdminDenied() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="max-w-md rounded-xl border border-border bg-card p-8 text-center">
        <h1 className="font-display text-xl font-bold">Prístup zamietnutý</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tento účet nemá rolu administrátora. Požiadajte správcu o pridelenie prístupu.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="outline" onClick={() => void navigate({ to: "/" })}>
            Na stránku
          </Button>
          <Button
            onClick={async () => {
              await supabase.auth.signOut();
              await navigate({ to: "/auth", replace: true });
            }}
          >
            Odhlásiť sa
          </Button>
        </div>
      </div>
    </div>
  );
}
