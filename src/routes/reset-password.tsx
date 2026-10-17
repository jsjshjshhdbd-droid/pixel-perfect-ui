import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Definir senha — Bumbum Net" },
      { name: "description", content: "Crie ou redefina a senha da sua conta Bumbum Net." },
      { property: "og:title", content: "Definir senha — Bumbum Net" },
      { property: "og:description", content: "Crie ou redefina a senha da sua conta." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw !== pw2) return setErr("As senhas não coincidem.");
    setLoading(true); setErr(null);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setLoading(false);
    if (error) return setErr(error.message.includes("session") ? "Link expirado. Solicite um novo na tela de login." : error.message);
    navigate({ to: "/", replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl border bg-card p-8 shadow-card">
        <p className="text-2xl font-bold tracking-tight">bumbum<span className="text-primary">.net</span></p>
        <h1 className="mt-6 text-xl font-semibold">Definir nova senha</h1>
        {["Nova senha", "Confirmar senha"].map((l, i) => (
          <label key={l} className="mt-4 block text-sm">{l}
            <input type="password" required minLength={8} value={i ? pw2 : pw} onChange={(e) => (i ? setPw2 : setPw)(e.target.value)}
              className="mt-1 w-full rounded-xl border bg-background px-4 py-2.5 outline-none focus:border-primary" autoComplete="new-password" />
          </label>
        ))}
        {err && <p className="mt-4 text-sm text-destructive">{err}</p>}
        <button disabled={loading} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}Salvar senha
        </button>
      </form>
    </div>
  );
}
