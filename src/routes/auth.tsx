import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Prihlásenie do administrácie – HORMI" },
      { name: "description", content: "Prihlásenie do administrácie katalógu HORMI s.r.o. Správa produktov a importov." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Prihlásenie do administrácie – HORMI" },
      { property: "og:description", content: "Interná administrácia katalógu HORMI s.r.o." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Prihlásenie úspešné");
        await navigate({ to: "/admin", replace: true });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth` },
        });
        if (error) throw error;
        toast.success("Účet vytvorený. Skontrolujte e-mail pre potvrdenie.");
        setMode("signin");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Prihlásenie sa nepodarilo");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lift">
        <Link to="/" className="font-display text-2xl font-extrabold tracking-tight">
          HORMI
        </Link>
        <h1 className="font-display mt-6 text-2xl font-bold tracking-tight">
          {mode === "signin" ? "Prihlásenie do administrácie" : "Vytvoriť účet"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Správa katalógu, produktov a importov. Prístup majú len účty s rolou administrátora.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Heslo</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Spracúvam…" : mode === "signin" ? "Prihlásiť sa" : "Registrovať"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground hover:underline"
        >
          {mode === "signin" ? "Nemáte účet? Zaregistrujte sa" : "Už máte účet? Prihláste sa"}
        </button>

        <Link to="/" className="mt-6 block text-center text-xs text-muted-foreground hover:underline">
          Späť na stránku
        </Link>
      </div>
    </div>
  );
}
