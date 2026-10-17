import heroGym from "@/assets/hero-gym.jpg";
import legs from "@/assets/legs.jpg";
import recipe from "@/assets/recipe.jpg";

export type ContentKind = "treino" | "protocolo" | "receitas";

export interface Product {
  id: string;
  title: string;
  subtitle: string;
  kind: ContentKind;
  image: string;
  duration: string;
  lessons: { title: string; minutes: number }[];
  /** Product included in the main offer (bonus). Locked content uses `price`. */
  price?: string;
  offer?: string;
  checkoutUrl?: string;
  tone: "pink" | "orchid" | "lavender" | "periwinkle";
}

const l = (names: string[]) => names.map((t, i) => ({ title: t, minutes: 8 + ((i * 5) % 14) }));

export const PRODUCTS: Product[] = [
  { id: "sequencia-ativadora", title: "Sequência Ativadora", subtitle: "Ative os glúteos antes de cada treino", kind: "treino", image: heroGym, duration: "15 min", tone: "pink",
    lessons: l(["Ponte glútea isométrica", "Abdução com mini band", "Coice quadrúpede", "Clamshell", "Caminhada lateral"]) },
  { id: "quadriceps-proporcional", title: "Protocolo Quadríceps Proporcional", subtitle: "Coxas definidas e equilibradas", kind: "protocolo", image: legs, duration: "4 semanas", tone: "orchid",
    lessons: l(["Agachamento búlgaro", "Leg press pés baixos", "Cadeira extensora", "Afundo reverso", "Sissy squat"]) },
  { id: "protocolo-posterior", title: "Protocolo Posterior", subtitle: "Posterior de coxa forte e firme", kind: "protocolo", image: heroGym, duration: "4 semanas", tone: "lavender",
    lessons: l(["Stiff com halteres", "Mesa flexora", "Good morning", "Nordic curl assistido"]) },
  { id: "superiores-a", title: "Treino de Superiores A", subtitle: "Costas e ombros em harmonia", kind: "treino", image: legs, duration: "40 min", tone: "periwinkle",
    lessons: l(["Puxada frontal", "Remada baixa", "Elevação lateral", "Face pull"]) },
  { id: "superiores-b", title: "Treino de Superiores B", subtitle: "Braços tonificados", kind: "treino", image: heroGym, duration: "35 min", tone: "pink",
    lessons: l(["Supino inclinado", "Rosca alternada", "Tríceps corda", "Desenvolvimento"]) },
  { id: "receitas-proteicas", title: "51 Receitas Proteicas", subtitle: "Alimentação saborosa para resultados", kind: "receitas", image: recipe, duration: "51 receitas", tone: "orchid",
    lessons: l(["Panqueca de whey", "Bowl de frango e quinoa", "Omelete de forno", "Mousse proteico", "Wrap de atum", "Overnight oats"]) },
  { id: "treino-express", title: "Protocolo Treino Express", subtitle: "Resultados em 20 minutos", kind: "protocolo", image: legs, duration: "20 min", tone: "lavender",
    lessons: l(["Circuito glúteo", "Circuito pernas", "HIIT final"]) },
  // Upsells — not in the demo purchase
  { id: "gluteo-360", title: "Glúteo 360º Avançado", subtitle: "Programa de 12 semanas para máxima hipertrofia", kind: "protocolo", image: heroGym, duration: "12 semanas", tone: "pink",
    price: "R$ 97,00", offer: "Acesso vitalício + planilhas de carga + aulas exclusivas com acompanhamento.",
    lessons: l(["Fase 1 — Base", "Fase 2 — Volume", "Fase 3 — Intensidade"]) },
  { id: "cardapio-21", title: "Cardápio Seca em 21 Dias", subtitle: "Plano alimentar dia a dia", kind: "receitas", image: recipe, duration: "21 dias", tone: "periwinkle",
    price: "R$ 47,00", offer: "Cardápio completo, lista de compras semanal e substituições inteligentes.",
    lessons: l(["Semana 1", "Semana 2", "Semana 3"]) },
  { id: "mobilidade", title: "Mobilidade & Postura", subtitle: "Menos dor, mais amplitude", kind: "treino", image: legs, duration: "10 aulas", tone: "lavender",
    price: "R$ 37,00", offer: "10 aulas guiadas para quadril, coluna e ombros.",
    lessons: l(["Quadril", "Coluna", "Ombros"]) },
];

/**
 * Demo entitlements. Replace with a backend query (e.g. a `purchases` table
 * scoped to the signed-in user) — UI reads only through `hasAccess`.
 */
export const DEMO_ENTITLEMENTS = new Set([
  "sequencia-ativadora", "quadriceps-proporcional", "protocolo-posterior",
  "superiores-a", "superiores-b", "receitas-proteicas", "treino-express",
]);

export function hasAccess(productId: string, entitlements: Set<string> = DEMO_ENTITLEMENTS) {
  return entitlements.has(productId);
}

export const getProduct = (id: string) => PRODUCTS.find((p) => p.id === id);

export const USER = { name: "Juliana", weight: 62, height: 165, workouts: 34, minutes: 820, streak: 6 };
