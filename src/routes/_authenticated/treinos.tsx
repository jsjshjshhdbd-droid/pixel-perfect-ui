import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ProductCard } from "@/components/ProductCard";
import { useCatalog } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/treinos")({
  head: () => ({
    meta: [
      { title: "Biblioteca de treinos — Bumbum Net" },
      { name: "description", content: "Todos os treinos e protocolos da Bumbum Net." },
      { property: "og:title", content: "Biblioteca de treinos — Bumbum Net" },
      { property: "og:description", content: "Protocolos de glúteos, pernas e superiores." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

const FILTERS = [["todos", "Todos"], ["liberados", "Liberados"], ["treino", "Treinos"], ["protocolo", "Protocolos"], ["receitas", "Receitas"], ["premium", "Premium"]] as const;

function Page() {
  const [f, setF] = useState<string>("todos");
  const { data: PRODUCTS = [], isLoading } = useCatalog();
  const hasAccess = (id: string) => !!PRODUCTS.find((p) => p.id === id)?.unlocked;
  const list = PRODUCTS.filter((p) =>
    f === "todos" ? true : f === "liberados" ? hasAccess(p.id) : f === "premium" ? !hasAccess(p.id) : p.kind === f);
  return (
    <AppShell title="Biblioteca" subtitle="Treinos, protocolos e conteúdos exclusivos">
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(([k, label]) => (
          <button key={k} onClick={() => setF(k)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${f === k ? "bg-primary text-primary-foreground shadow-soft" : "border bg-card"}`}>
            {label}
          </button>
        ))}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((p) => <ProductCard key={p.id} product={p} />)}
        {!isLoading && list.length === 0 && <p className="text-sm text-muted-foreground">Nenhum conteúdo nesta categoria.</p>}
        {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      </div>
    </AppShell>
  );
}
