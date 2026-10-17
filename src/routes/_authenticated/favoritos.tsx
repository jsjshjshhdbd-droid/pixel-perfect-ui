import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ProductCard } from "@/components/ProductCard";
import { useCatalog } from "@/lib/data";
import { useFavorites } from "@/lib/favorites";

export const Route = createFileRoute("/_authenticated/favoritos")({
  head: () => ({
    meta: [
      { title: "Favoritos — Bumbum Net" },
      { name: "description", content: "Seus treinos e receitas favoritos." },
      { property: "og:title", content: "Favoritos — Bumbum Net" },
      { property: "og:description", content: "Seus conteúdos salvos na Bumbum Net." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const { favs } = useFavorites();
  const { data: PRODUCTS = [] } = useCatalog();
  const list = PRODUCTS.filter((p) => favs.includes(p.uuid));
  return (
    <AppShell title="Favoritos" subtitle="Seus conteúdos salvos">
      {list.length === 0 ? (
        <div className="mx-auto max-w-md rounded-3xl border bg-card p-10 text-center shadow-card">
          <Heart className="mx-auto h-10 w-10 text-primary" />
          <p className="mt-4 font-semibold">Nenhum favorito ainda</p>
          <p className="mt-1 text-sm text-muted-foreground">Toque no coração de um treino para salvá-lo aqui.</p>
          <Link to="/treinos" className="mt-6 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Explorar biblioteca</Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{list.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      )}
    </AppShell>
  );
}
