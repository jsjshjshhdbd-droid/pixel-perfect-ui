import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Circle, Heart, Lock, Play } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { getProduct, hasAccess } from "@/lib/content";
import { useFavorites } from "@/lib/favorites";

export const Route = createFileRoute("/conteudo/$id")({
  loader: ({ params }) => {
    const p = getProduct(params.id);
    if (!p) throw notFound();
    return { id: p.id, title: p.title, subtitle: p.subtitle };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Conteúdo"} — Bumbum Net` },
      { name: "description", content: loaderData?.subtitle ?? "Conteúdo Bumbum Net" },
      { property: "og:title", content: `${loaderData?.title ?? "Conteúdo"} — Bumbum Net` },
      { property: "og:description", content: loaderData?.subtitle ?? "Conteúdo Bumbum Net" },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const { id } = Route.useLoaderData();
  const p = getProduct(id)!;
  const { isFav, toggle } = useFavorites();
  const [done, setDone] = useState<number[]>([0]);
  const [current, setCurrent] = useState(0);

  if (!hasAccess(p.id)) {
    return (
      <AppShell title={p.title}>
        <div className="mx-auto max-w-md rounded-3xl border bg-card p-8 text-center shadow-card">
          <Lock className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">Conteúdo bloqueado</h2>
          <p className="mt-2 text-sm text-muted-foreground">Você ainda não tem acesso a este conteúdo.</p>
          <Link to="/treinos" className="mt-6 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Ver na biblioteca</Link>
        </div>
      </AppShell>
    );
  }

  const pct = Math.round((done.length / p.lessons.length) * 100);
  return (
    <AppShell title={p.title} subtitle={p.subtitle}>
      <Link to="/treinos" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" />Voltar</Link>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="relative overflow-hidden rounded-3xl shadow-soft">
            <img src={p.image} alt={p.title} className="aspect-video w-full object-cover" />
            <div className="absolute inset-0 grid place-items-center bg-ink/30">
              <button aria-label="Reproduzir" className="grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-soft"><Play className="h-7 w-7" /></button>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div><p className="text-xs text-muted-foreground">Aula {current + 1}</p><h2 className="text-xl font-semibold">{p.lessons[current]?.title}</h2></div>
            <div className="flex gap-2">
              <button onClick={() => toggle(p.id)} className="inline-flex items-center gap-1.5 rounded-full border bg-card px-4 py-2 text-sm">
                <Heart className={`h-4 w-4 ${isFav(p.id) ? "fill-primary text-primary" : ""}`} />Favoritar
              </button>
              <button onClick={() => setDone((d) => d.includes(current) ? d : [...d, current])}
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Concluir aula</button>
            </div>
          </div>
        </div>
        <aside className="rounded-3xl border bg-card p-5 shadow-card h-fit">
          <div className="flex justify-between text-sm"><span className="font-semibold">Progresso</span><span className="text-primary">{pct}%</span></div>
          <div className="mt-2 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} /></div>
          <ul className="mt-5 space-y-2">
            {p.lessons.map((l, i) => (
              <li key={l.title}>
                <button onClick={() => setCurrent(i)} className={`flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm ${current === i ? "bg-accent" : "hover:bg-secondary"}`}>
                  {done.includes(i) ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                  <span className="flex-1">{l.title}</span><span className="text-xs text-muted-foreground">{l.minutes} min</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </AppShell>
  );
}
