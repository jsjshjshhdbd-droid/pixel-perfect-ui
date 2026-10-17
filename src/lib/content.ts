import heroGym from "@/assets/hero-gym.jpg";
import legs from "@/assets/legs.jpg";
import recipe from "@/assets/recipe.jpg";

export type ContentKind = "treino" | "protocolo" | "receitas" | "material";
export type Tone = "pink" | "orchid" | "lavender" | "periwinkle";

/** UI shape of a content card, built from the database catalog. */
export interface Product {
  uuid: string;
  id: string; // slug, used in URLs
  title: string;
  subtitle: string;
  kind: ContentKind;
  coverPath: string | null;
  image: string; // fallback image
  duration: string;
  tone: Tone;
  unlocked: boolean;
  price?: string | undefined;
  offer?: string | undefined;
  checkoutUrl?: string | undefined;
  offerProductId?: string | undefined;
}

const SLUG_IMAGES: Record<string, string> = {
  "sequencia-ativadora": heroGym, "quadriceps-proporcional": legs, "protocolo-posterior": heroGym,
  "superiores-a": legs, "superiores-b": heroGym, "receitas-proteicas": recipe, "treino-express": legs,
  "gluteo-360": heroGym, "cardapio-21": recipe, mobilidade: legs,
};
const KIND_IMAGES: Record<ContentKind, string> = { treino: heroGym, protocolo: legs, receitas: recipe, material: heroGym };

export const fallbackImage = (slug: string, kind: ContentKind) => SLUG_IMAGES[slug] ?? KIND_IMAGES[kind] ?? heroGym;
export const RECIPE_FALLBACK = recipe;
export const HERO_IMAGE = heroGym;
