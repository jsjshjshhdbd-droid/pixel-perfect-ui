import type { ReactNode } from "react";
import { useFavoritesQuery, useToggleFavorite } from "@/lib/data";

/** Kept for compatibility with the original layout; favorites now live in the database. */
export function FavoritesProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

/** Favorites keyed by content UUID. */
export function useFavorites() {
  const { data: favs = [] } = useFavoritesQuery();
  const m = useToggleFavorite();
  return {
    favs,
    isFav: (id: string) => favs.includes(id),
    toggle: (id: string) => m.mutate({ contentId: id, on: !favs.includes(id) }),
  };
}
