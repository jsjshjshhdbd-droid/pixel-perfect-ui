import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fallbackImage, type Product, type ContentKind, type Tone } from "@/lib/content";

export async function currentUserId() {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const [{ data: profile }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", u.user.id),
      ]);
      return {
        id: u.user.id,
        email: u.user.email ?? "",
        profile,
        isAdmin: !!roles?.some((r) => r.role === "admin"),
      };
    },
  });
}

/** Catalog of published content with the signed-in user's access state. */
export function useCatalog() {
  return useQuery({
    queryKey: ["catalog"],
    queryFn: async (): Promise<Product[]> => {
      const uid = await currentUserId();
      const [items, links, products, ents, roles] = await Promise.all([
        supabase.from("content_items").select("*").eq("status", "published").order("sort_order"),
        supabase.from("product_contents").select("product_id, content_id"),
        supabase.from("products").select("*").order("sort_order"),
        supabase.from("user_entitlements").select("product_id").eq("user_id", uid ?? ""),
        supabase.from("user_roles").select("role").eq("user_id", uid ?? ""),
      ]);
      if (items.error) throw items.error;
      const isAdmin = !!roles.data?.some((r) => r.role === "admin");
      const owned = new Set((ents.data ?? []).map((e) => e.product_id));
      const prodById = new Map((products.data ?? []).map((p) => [p.id, p]));
      return (items.data ?? []).map((c) => {
        const pids = (links.data ?? []).filter((l) => l.content_id === c.id).map((l) => l.product_id);
        const unlocked = isAdmin || pids.some((id) => owned.has(id));
        const offer = pids.map((id) => prodById.get(id)).find((p) => p && !p.is_main) ?? pids.map((id) => prodById.get(id))[0];
        return {
          uuid: c.id, id: c.slug, title: c.title, subtitle: c.subtitle, kind: c.kind as ContentKind,
          coverPath: c.cover_path, image: fallbackImage(c.slug, c.kind as ContentKind),
          duration: c.duration_label, tone: c.tone as Tone, unlocked,
          price: offer?.price_label ?? undefined, offer: offer?.offer_text ?? undefined,
          checkoutUrl: offer?.checkout_url ?? undefined, offerProductId: offer?.id,
        };
      });
    },
  });
}

/** Signed URL for a private storage object (covers/materials). */
export function useSignedUrl(bucket: "covers" | "materials", path: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    if (!path) { setUrl(null); return; }
    supabase.storage.from(bucket).createSignedUrl(path, 3600).then(({ data }) => { if (alive) setUrl(data?.signedUrl ?? null); });
    return () => { alive = false; };
  }, [bucket, path]);
  return url;
}

export function useFavoritesQuery() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const uid = await currentUserId();
      const { data, error } = await supabase.from("favorites").select("content_id").eq("user_id", uid ?? "");
      if (error) throw error;
      return data.map((f) => f.content_id);
    },
  });
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ contentId, on }: { contentId: string; on: boolean }) => {
      const uid = await currentUserId();
      if (!uid) throw new Error("Sessão expirada. Entre novamente.");
      const res = on
        ? await supabase.from("favorites").insert({ user_id: uid, content_id: contentId })
        : await supabase.from("favorites").delete().eq("user_id", uid).eq("content_id", contentId);
      if (res.error) throw res.error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites"] }),
    onError: (e: Error) => toast.error(e.message || "Não foi possível atualizar favoritos"),
  });
}

export function useProgress() {
  return useQuery({
    queryKey: ["progress"],
    queryFn: async () => {
      const uid = await currentUserId();
      const { data, error } = await supabase.from("lesson_progress").select("lesson_id, completed_at, lessons(content_id, minutes)").eq("user_id", uid ?? "");
      if (error) throw error;
      return data;
    },
  });
}

export function errMsg(e: unknown) {
  if (e && typeof e === "object" && "message" in e) return String((e as { message: string }).message);
  return "Algo deu errado. Tente novamente.";
}
