import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface Ctx { favs: string[]; toggle: (id: string) => void; isFav: (id: string) => boolean }
const FavCtx = createContext<Ctx | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favs, setFavs] = useState<string[]>([]);
  useEffect(() => {
    try { setFavs(JSON.parse(localStorage.getItem("bn-favs") || "[]")); } catch { /* ignore */ }
  }, []);
  const toggle = (id: string) =>
    setFavs((f) => {
      const next = f.includes(id) ? f.filter((x) => x !== id) : [...f, id];
      localStorage.setItem("bn-favs", JSON.stringify(next));
      return next;
    });
  return <FavCtx.Provider value={{ favs, toggle, isFav: (id) => favs.includes(id) }}>{children}</FavCtx.Provider>;
}

export function useFavorites() {
  const c = useContext(FavCtx);
  if (!c) throw new Error("useFavorites outside provider");
  return c;
}
