import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Flame, Timer, Zap } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ProductCard } from "@/components/ProductCard";
import { PRODUCTS, USER, hasAccess } from "@/lib/content";
import heroGym from "@/assets/hero-gym.jpg";
import athlete from "@/assets/athlete.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Início — Bumbum Net" },
      { name: "description", content: "Sua área de membros Bumbum Net: treinos, protocolos e receitas proteicas." },
      { property: "og:title", content: "Início — Bumbum Net" },
      { property: "og:description", content: "Treinos, protocolos e receitas para glúteos e corpo definidos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const QUICK = [
  { title: "Sequência Ativadora", text: "Comece seu treino ativando os glúteos.", to: "sequencia-ativadora", cls: "bg-gradient-pink" },
  { title: "Quadríceps Proporcional", text: "Coxas definidas e equilibradas.", to: "quadriceps-proporcional", cls: "bg-gradient-orchid" },
  { title: "Treino Express", text: "Resultados em apenas 20 minutos.", to: "treino-express", cls: "bg-gradient-lavender" },
  { title: "Protocolo Posterior", text: "Posterior forte e firme.", to: "protocolo-posterior", cls: "bg-gradient-periwinkle" },
];

const WEEK = [40, 70, 15, 55, 80, 30, 60];

function Index() {
  return (
    <AppShell title={`Olá, ${USER.name}! 👋`} subtitle="Bem-vinda à Bumbum Net. Seu melhor shape começa hoje.">
      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <div className="space-y-6 min-w-0">
          <section className="relative overflow-hidden rounded-3xl shadow-soft">
            <img src={heroGym} alt="Treino de glúteos" width={1600} height={800} className="h-64 w-full object-cover md:h-80" />
            <div className="absolute inset-0 bg-scrim" />
            <div className="absolute inset-0 flex flex-col justify-center p-6 text-ink-foreground md:p-10">
              <span className="text-xs font-semibold tracking-widest">TREINO DO DIA</span>
              <h2 className="mt-2 max-w-md text-3xl font-bold md:text-4xl">Mais forte a cada dia.</h2>
              <p className="mt-2 max-w-sm text-sm opacity-90">Protocolo Posterior — Semana 2, Aula 3. Continue de onde parou.</p>
              <Link to="/conteudo/$id" params={{ id: "protocolo-posterior" }}
                className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
                Continuar treino <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {QUICK.map((q) => (
              <Link key={q.to} to="/conteudo/$id" params={{ id: q.to }}
                className={`${q.cls} relative min-h-36 rounded-3xl p-5 text-primary-foreground shadow-soft transition hover:-translate-y-0.5`}>
                <ArrowUpRight className="absolute right-4 top-4 h-5 w-5" />
                <h3 className="pr-6 text-lg font-bold leading-tight">{q.title}</h3>
                <p className="mt-2 text-xs opacity-90">{q.text}</p>
              </Link>
            ))}
          </section>

          <section className="rounded-3xl border bg-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Atividade da semana</h3>
              <span className="rounded-full bg-primary-soft px-3 py-1 text-xs">Semanal</span>
            </div>
            <div className="mt-6 flex h-40 items-end justify-between gap-3">
              {WEEK.map((v, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs font-medium text-primary">{v}%</span>
                  <div className="flex h-28 w-full max-w-12 items-end"><div className={`w-full rounded-xl ${i === 4 ? "bg-primary" : "bg-muted"}`} style={{ height: `${v}%` }} /></div>
                  <span className="text-xs text-muted-foreground">{["S", "T", "Q", "Q", "S", "S", "D"][i]}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Sua biblioteca</h3>
              <Link to="/treinos" className="text-sm font-medium text-primary">Ver tudo</Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
              {[...PRODUCTS.filter((p) => hasAccess(p.id)).slice(0, 4), ...PRODUCTS.filter((p) => !hasAccess(p.id)).slice(0, 2)].map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>

          <p className="rounded-full border bg-card py-3 text-center text-sm text-primary">"O sucesso é a soma de pequenos esforços repetidos dia após dia."</p>
        </div>

        <aside className="relative overflow-hidden rounded-3xl bg-primary p-5 xl:sticky xl:top-6 xl:h-fit">
          <div className="space-y-3">
            {[{ i: Zap, v: USER.workouts, l: "TREINOS" }, { i: Flame, v: `${USER.streak}d`, l: "SEQUÊNCIA" }, { i: Timer, v: USER.minutes, l: "MINUTOS" }].map(({ i: I, v, l }) => (
              <div key={l} className="flex items-center gap-4 rounded-2xl bg-card px-5 py-4">
                <I className="h-6 w-6 text-primary" /><span className="text-2xl font-semibold">{v}</span>
                <span className="ml-auto text-sm font-medium text-primary">{l}</span>
              </div>
            ))}
          </div>
          <img src={athlete} alt="Aluna Bumbum Net" width={768} height={1152} className="mx-auto mt-4 h-80 w-auto object-contain" />
          <div className="-mx-5 -mb-5 rounded-t-3xl bg-primary-soft/90 p-5 text-center backdrop-blur">
            <p className="text-xl font-semibold">{USER.name}</p>
            <div className="mt-3 flex justify-around">
              <div><p className="text-sm">Peso</p><p className="text-lg font-bold">{USER.weight}<span className="text-xs">kg</span></p></div>
              <div><p className="text-sm">Altura</p><p className="text-lg font-bold">{USER.height}<span className="text-xs">cm</span></p></div>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
