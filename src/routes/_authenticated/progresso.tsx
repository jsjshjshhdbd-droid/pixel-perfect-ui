import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PRODUCTS, USER, hasAccess } from "@/lib/content";

export const Route = createFileRoute("/_authenticated/progresso")({
  head: () => ({
    meta: [
      { title: "Meu progresso — Bumbum Net" },
      { name: "description", content: "Acompanhe sua evolução na Bumbum Net." },
      { property: "og:title", content: "Meu progresso — Bumbum Net" },
      { property: "og:description", content: "Treinos concluídos, medidas e evolução." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

const POINTS = [300, 280, 340, 400, 320, 290, 360, 410];

function Page() {
  const max = 450;
  const d = POINTS.map((v, i) => `${i === 0 ? "M" : "L"} ${(i / (POINTS.length - 1)) * 100} ${100 - (v / max) * 100}`).join(" ");
  return (
    <AppShell title="Progresso" subtitle="Sua evolução semana a semana">
      <div className="grid gap-4 sm:grid-cols-3">
        {[["Treinos", USER.workouts], ["Minutos", USER.minutes], ["Dias seguidos", USER.streak]].map(([l, v]) => (
          <div key={l} className="rounded-3xl border bg-card p-5 shadow-card"><p className="text-sm text-muted-foreground">{l}</p><p className="mt-1 text-3xl font-bold text-primary">{v}</p></div>
        ))}
      </div>
      <div className="mt-6 rounded-3xl border bg-card p-6 shadow-card">
        <h3 className="font-semibold">Calorias queimadas</h3>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="mt-4 h-48 w-full">
          <path d={d} fill="none" stroke="var(--primary)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      <div className="mt-6 rounded-3xl border bg-card p-6 shadow-card">
        <h3 className="mb-4 font-semibold">Protocolos</h3>
        <div className="space-y-4">
          {PRODUCTS.filter((p) => hasAccess(p.id)).map((p, i) => {
            const pct = [80, 45, 60, 20, 10, 35, 90][i] ?? 0;
            return (
              <div key={p.id}>
                <div className="flex justify-between text-sm"><span>{p.title}</span><span className="text-primary">{pct}%</span></div>
                <div className="mt-1.5 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} /></div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
