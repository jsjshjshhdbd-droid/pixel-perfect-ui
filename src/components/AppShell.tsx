import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutGrid, Dumbbell, Salad, TrendingUp, Heart, User, LogOut, Bell, Search, Shield } from "lucide-react";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/lib/data";

const NAV = [
  { to: "/", label: "Início", icon: LayoutGrid },
  { to: "/treinos", label: "Treinos", icon: Dumbbell },
  { to: "/receitas", label: "Receitas", icon: Salad },
  { to: "/progresso", label: "Progresso", icon: TrendingUp },
  { to: "/favoritos", label: "Favoritos", icon: Heart },
  { to: "/perfil", label: "Perfil", icon: User },
] as const;

export function useSignOut() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  return async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };
}

export function AppShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const { data: me } = useMe();
  const signOut = useSignOut();
  const name = me?.profile?.full_name || me?.email || "";
  return (
    <div className="min-h-screen lg:flex">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-sidebar px-6 py-8 sticky top-0 h-screen">
        <Link to="/" className="text-2xl font-bold tracking-tight">bumbum<span className="text-primary">.net</span></Link>
        <nav className="mt-10 flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} activeOptions={{ exact: to === "/" }}
              className="relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              activeProps={{ className: "text-primary bg-card shadow-card before:absolute before:-left-6 before:top-2 before:bottom-2 before:w-1 before:rounded-r before:bg-primary" }}>
              <Icon className="h-5 w-5" />{label}
            </Link>
          ))}
          {me?.isAdmin && (
            <Link to="/admin" className="mt-4 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-primary hover:bg-accent">
              <Shield className="h-5 w-5" />Painel ADM
            </Link>
          )}
        </nav>
        <button onClick={signOut} className="mt-auto flex items-center gap-3 px-3 py-3 text-sm font-medium text-muted-foreground hover:text-foreground">
          <LogOut className="h-5 w-5" />Sair
        </button>
      </aside>

      <div className="flex-1 min-w-0 pb-24 lg:pb-10">
        <header className="flex items-center justify-between gap-4 px-5 pt-6 lg:px-10 lg:pt-8">
          <div>
            <h1 className="text-xl font-semibold lg:text-2xl">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3">
            <label className="hidden md:flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input placeholder="Buscar" className="w-40 bg-transparent outline-none" />
            </label>
            <button aria-label="Notificações" className="relative grid h-10 w-10 place-items-center rounded-full bg-primary-soft">
              <Bell className="h-5 w-5" />
            </button>
            {me?.isAdmin && (
              <Link to="/admin" aria-label="Painel ADM" className="grid h-10 w-10 place-items-center rounded-full bg-primary-soft lg:hidden"><Shield className="h-5 w-5" /></Link>
            )}
            <button onClick={signOut} aria-label="Sair" className="grid h-10 w-10 place-items-center rounded-full bg-primary-soft lg:hidden"><LogOut className="h-5 w-5" /></button>
            <Link to="/perfil" className="grid h-10 w-10 place-items-center rounded-full bg-gradient-pink font-semibold uppercase text-primary-foreground">
              {name[0] ?? "?"}
            </Link>
          </div>
        </header>
        <main className="px-5 pt-6 lg:px-10">{children}</main>
      </div>

      <nav className="fixed inset-x-3 bottom-3 z-40 flex justify-around rounded-2xl border bg-card/95 p-2 shadow-soft backdrop-blur lg:hidden">
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} activeOptions={{ exact: to === "/" }}
            className="flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] text-muted-foreground"
            activeProps={{ className: "text-primary bg-accent" }}>
            <Icon className="h-5 w-5" />{label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
