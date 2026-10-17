import { Link } from "@tanstack/react-router";
import { Lock, Heart, ArrowUpRight, Play, X, Check } from "lucide-react";
import { useState } from "react";
import { hasAccess, type Product } from "@/lib/content";
import { useFavorites } from "@/lib/favorites";

const TONE = { pink: "bg-gradient-pink", orchid: "bg-gradient-orchid", lavender: "bg-gradient-lavender", periwinkle: "bg-gradient-periwinkle" };

export function ProductCard({ product }: { product: Product }) {
  const unlocked = hasAccess(product.id);
  const { isFav, toggle } = useFavorites();
  const [open, setOpen] = useState(false);

  return (
    <>
      <article className="group overflow-hidden rounded-3xl border bg-card shadow-card transition hover:-translate-y-0.5 hover:shadow-soft">
        <div className="relative aspect-[16/10] overflow-hidden">
          <img src={product.image} alt={product.title} loading="lazy" width={1024} height={640}
            className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${unlocked ? "" : "locked-img"}`} />
          {unlocked ? (
            <>
              <span className={`absolute left-3 top-3 rounded-full ${TONE[product.tone]} px-3 py-1 text-[11px] font-semibold uppercase text-primary-foreground`}>{product.kind}</span>
              <button onClick={() => toggle(product.id)} aria-label="Favoritar"
                className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-card/90">
                <Heart className={`h-4 w-4 ${isFav(product.id) ? "fill-primary text-primary" : ""}`} />
              </button>
            </>
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-ink/55">
              <span className="absolute left-3 top-3 rounded-full bg-ink px-3 py-1 text-[11px] font-semibold tracking-wider text-ink-foreground">PREMIUM</span>
              <div className="grid h-16 w-16 place-items-center rounded-full bg-card/95 shadow-soft">
                <Lock className="h-7 w-7 text-ink" />
              </div>
            </div>
          )}
        </div>
        <div className="p-5">
          <h3 className={`font-semibold ${unlocked ? "" : "text-muted-foreground"}`}>{product.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{product.subtitle}</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{product.duration}</span>
            {unlocked ? (
              <Link to="/conteudo/$id" params={{ id: product.id }}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-soft">
                <Play className="h-3.5 w-3.5" />Acessar
              </Link>
            ) : (
              <button onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-ink-foreground">
                <Lock className="h-3.5 w-3.5" />DESBLOQUEAR ACESSO
              </button>
            )}
          </div>
        </div>
      </article>
      {open && <OfferModal product={product} onClose={() => setOpen(false)} />}
    </>
  );
}

function OfferModal({ product, onClose }: { product: Product; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-card shadow-soft animate-in zoom-in-95 fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="relative h-44">
          <img src={product.image} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-scrim" />
          <button onClick={onClose} aria-label="Fechar" className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-card/90"><X className="h-4 w-4" /></button>
          <div className="absolute bottom-4 left-5 text-ink-foreground">
            <span className="text-[11px] font-semibold tracking-wider">OFERTA EXCLUSIVA</span>
            <h3 className="text-xl font-bold">{product.title}</h3>
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm text-muted-foreground">{product.offer}</p>
          <ul className="mt-4 space-y-2">
            {product.lessons.map((l) => (
              <li key={l.title} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary" />{l.title}</li>
            ))}
          </ul>
          <div className="mt-6 flex items-end justify-between">
            <div><span className="text-xs text-muted-foreground">Pagamento único</span><p className="text-2xl font-bold text-primary">{product.price}</p></div>
            <a href={product.checkoutUrl ?? "#"} onClick={(e) => { if (!product.checkoutUrl) { e.preventDefault(); alert("Checkout será conectado em breve."); } }}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft">
              Quero adquirir <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
