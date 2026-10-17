import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import heroGym from "@/assets/hero-gym.jpg";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar — Bumbum Net" },
      { name: "description", content: "Acesse sua área de membros Bumbum Net." },
      { property: "og:title", content: "Entrar — Bumbum Net" },
      { property: "og:description", content: "Acesse sua área de membros Bumbum Net." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

const input = "mt-1 w-full rounded-xl border bg-background px-4 py-2.5 outline-none focus:border-primary";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg(null);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        setMsg({ ok: true, text: "Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha." });
        return;
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw new Error(error.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : error.message);
      const [{ data: roles }, { data: profile }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", data.user.id),
        supabase.from("profiles").select("status").eq("id", data.user.id).maybeSingle(),
      ]);
      const admin = !!roles?.some((r) => r.role === "admin");
      if (profile?.status === "suspended" && !admin) {
        await supabase.auth.signOut();
        throw new Error("Seu acesso está suspenso. Fale com o suporte.");
      }
      navigate({ to: admin ? "/admin" : "/", replace: true });
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Não foi possível entrar." });
    } finally { setLoading(false); }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img src={heroGym} alt="Treino de glúteos" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-scrim" />
        <div className="absolute bottom-12 left-12 max-w-sm text-ink-foreground">
          <h2 className="text-4xl font-bold">Mais forte a cada dia.</h2>
          <p className="mt-2 opacity-90">Treinos, protocolos e receitas em um só lugar.</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-6 py-12">
        <form onSubmit={submit} className="w-full max-w-sm rounded-3xl border bg-card p-8 shadow-card">
          <p className="text-2xl font-bold tracking-tight">bumbum<span className="text-primary">.net</span></p>
          <h1 className="mt-6 text-xl font-semibold">{mode === "login" ? "Entrar na sua conta" : "Recuperar senha"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login" ? "Use o e-mail cadastrado na sua compra." : "Enviaremos um link para o seu e-mail."}
          </p>
          <label className="mt-6 block text-sm">E-mail
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={input} autoComplete="email" />
          </label>
          {mode === "login" && (
            <label className="mt-4 block text-sm">Senha
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={input} autoComplete="current-password" />
            </label>
          )}
          {msg && <p className={`mt-4 text-sm ${msg.ok ? "text-primary" : "text-destructive"}`}>{msg.text}</p>}
          <button disabled={loading} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft disabled:opacity-60">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}{mode === "login" ? "Entrar" : "Enviar link"}
          </button>
          <button type="button" onClick={() => { setMode(mode === "login" ? "forgot" : "login"); setMsg(null); }} className="mt-4 w-full text-center text-sm text-primary">
            {mode === "login" ? "Esqueci minha senha" : "Voltar para o login"}
          </button>
        </form>
      </div>
    </div>
  );
}
