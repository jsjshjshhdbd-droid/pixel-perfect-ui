import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ProductCard } from "@/components/ProductCard";
import { PRODUCTS, hasAccess } from "@/lib/content";
import recipe from "@/assets/recipe.jpg";

export const Route = createFileRoute("/receitas")({
  head: () => ({
    meta: [
      { title: "Receitas proteicas — Bumbum Net" },
      { name: "description", content: "51 receitas proteicas para acelerar seus resultados." },
      { property: "og:title", content: "Receitas proteicas — Bumbum Net" },
      { property: "og:description", content: "Alimentação saborosa e rica em proteína." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

const NAMES = ["Panqueca de whey", "Bowl de frango", "Omelete de forno", "Mousse proteico", "Wrap de atum", "Overnight oats", "Crepioca fit", "Salada de grão-de-bico"];

function Page() {
  const unlocked = hasAccess("receitas-proteicas");
  return (
    <AppShell title="Receitas" subtitle="51 receitas proteicas">
      <div className="flex gap-4 overflow-x-auto pb-2">
        {NAMES.map((n, i) => (
          <div key={n} className={`relative flex w-64 shrink-0 items-center gap-3 rounded-2xl bg-primary-soft p-4 ${unlocked ? "" : "opacity-60 grayscale"}`}>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{n}</p>
              <p className="text-xs text-muted-foreground">{15 + i * 3} min · Café/Almoço</p>
              <p className="mt-2 text-xs">Proteína: {20 + i * 2} g<br />Calorias: {280 + i * 15} kcal</p>
            </div>
            <img src={recipe} alt="" loading="lazy" className="ml-auto h-20 w-20 rounded-full object-cover" />
          </div>
        ))}
      </div>
      <h3 className="mb-4 mt-8 text-lg font-semibold">Coleções</h3>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {PRODUCTS.filter((p) => p.kind === "receitas").map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </AppShell>
  );
}
