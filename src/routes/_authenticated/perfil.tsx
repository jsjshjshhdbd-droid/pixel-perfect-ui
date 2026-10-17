import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { USER } from "@/lib/content";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil e configurações — Bumbum Net" },
      { name: "description", content: "Gerencie seu perfil e preferências." },
      { property: "og:title", content: "Perfil — Bumbum Net" },
      { property: "og:description", content: "Perfil e configurações da sua conta." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Toggle({ label }: { label: string }) {
  const [on, setOn] = useState(true);
  return (
    <button onClick={() => setOn(!on)} className="flex w-full items-center justify-between py-3 text-sm">
      {label}
      <span className={`relative h-6 w-11 rounded-full transition ${on ? "bg-primary" : "bg-muted"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-card transition-all ${on ? "left-5" : "left-0.5"}`} />
      </span>
    </button>
  );
}

function Page() {
  const [saved, setSaved] = useState(false);
  return (
    <AppShell title="Perfil" subtitle="Seus dados e preferências">
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-3xl bg-gradient-pink p-6 text-center text-primary-foreground shadow-soft">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-card text-3xl font-bold text-primary">{USER.name[0]}</div>
          <p className="mt-4 text-xl font-semibold">{USER.name}</p>
          <p className="text-sm opacity-90">Aluna desde 2026</p>
        </div>
        <div className="space-y-6">
          <form onSubmit={(e) => { e.preventDefault(); setSaved(true); }} className="rounded-3xl border bg-card p-6 shadow-card">
            <h3 className="mb-4 font-semibold">Dados pessoais</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {[["Nome", USER.name], ["E-mail", "juliana@email.com"], ["Peso (kg)", USER.weight], ["Altura (cm)", USER.height]].map(([l, v]) => (
                <label key={l} className="text-sm">{l}
                  <input defaultValue={v} className="mt-1 w-full rounded-xl border bg-background px-4 py-2.5 outline-none focus:border-primary" />
                </label>
              ))}
            </div>
            <button className="mt-5 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground">Salvar</button>
            {saved && <span className="ml-3 text-sm text-primary">Alterações salvas!</span>}
          </form>
          <div className="rounded-3xl border bg-card p-6 shadow-card divide-y">
            <h3 className="pb-2 font-semibold">Configurações</h3>
            <Toggle label="Lembretes de treino" /><Toggle label="Novidades e ofertas" /><Toggle label="Som nas aulas" />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
