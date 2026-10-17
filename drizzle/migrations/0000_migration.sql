
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.content_kind AS ENUM ('treino', 'protocolo', 'receitas', 'material');
CREATE TYPE public.publish_status AS ENUM ('draft', 'published');
CREATE TYPE public.account_status AS ENUM ('active', 'suspended');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  weight_kg numeric,
  height_cm numeric,
  status public.account_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;
CREATE OR REPLACE FUNCTION public.is_active_user()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND status = 'active')
$$;

CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.is_admin()) WITH CHECK (id = auth.uid() OR public.is_admin());

CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
    NEW.status := OLD.status;
    NEW.email := OLD.email;
  END IF;
  IF auth.uid() IS NOT NULL AND NEW.id = auth.uid() AND NEW.status = 'suspended' AND OLD.status = 'active' THEN
    RAISE EXCEPTION 'Você não pode suspender a própria conta';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER profiles_protect BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.protect_profile_fields();

CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, COALESCE(NEW.email, ''), COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(COALESCE(NEW.email,''), '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  is_main boolean NOT NULL DEFAULT false,
  price_label text,
  offer_text text,
  checkout_url text,
  status public.publish_status NOT NULL DEFAULT 'published',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products read" ON public.products FOR SELECT TO authenticated USING (status = 'published' OR public.is_admin());
CREATE POLICY "products admin write" ON public.products FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.content_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  kind public.content_kind NOT NULL,
  title text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  cover_path text,
  category text,
  objective text,
  duration_label text NOT NULL DEFAULT '',
  location text CHECK (location IS NULL OR location IN ('casa','academia','ambos')),
  instructions text,
  tone text NOT NULL DEFAULT 'pink' CHECK (tone IN ('pink','orchid','lavender','periwinkle')),
  status public.publish_status NOT NULL DEFAULT 'draft',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.content_items (status, sort_order);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_items TO authenticated;
GRANT ALL ON public.content_items TO service_role;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.product_contents (
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  content_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, content_id)
);
CREATE INDEX ON public.product_contents (content_id);
GRANT SELECT, INSERT, DELETE ON public.product_contents TO authenticated;
GRANT ALL ON public.product_contents TO service_role;
ALTER TABLE public.product_contents ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  granted_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);
CREATE INDEX ON public.user_entitlements (user_id);
GRANT SELECT, INSERT, DELETE ON public.user_entitlements TO authenticated;
GRANT ALL ON public.user_entitlements TO service_role;
ALTER TABLE public.user_entitlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "entitlements read own" ON public.user_entitlements FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "entitlements admin insert" ON public.user_entitlements FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "entitlements admin delete" ON public.user_entitlements FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "product_contents read" ON public.product_contents FOR SELECT TO authenticated USING (true);
CREATE POLICY "product_contents admin insert" ON public.product_contents FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "product_contents admin delete" ON public.product_contents FOR DELETE TO authenticated USING (public.is_admin());

CREATE OR REPLACE FUNCTION public.can_access_content(_content_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_admin() OR (
    public.is_active_user() AND EXISTS (
      SELECT 1 FROM public.content_items c
      JOIN public.product_contents pc ON pc.content_id = c.id
      JOIN public.user_entitlements ue ON ue.product_id = pc.product_id AND ue.user_id = auth.uid()
      JOIN public.products p ON p.id = pc.product_id AND p.status = 'published'
      WHERE c.id = _content_id AND c.status = 'published'
    )
  )
$$;

CREATE POLICY "content read catalog" ON public.content_items FOR SELECT TO authenticated USING (status = 'published' OR public.is_admin());
CREATE POLICY "content admin write" ON public.content_items FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  title text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.modules TO authenticated;
GRANT ALL ON public.modules TO service_role;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "modules read authorized" ON public.modules FOR SELECT TO authenticated USING (public.can_access_content(content_id));
CREATE POLICY "modules admin write" ON public.modules FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  module_id uuid REFERENCES public.modules(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  minutes int NOT NULL DEFAULT 10,
  sets_reps text,
  video_url text,
  material_path text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.lessons (content_id, sort_order);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lessons TO authenticated;
GRANT ALL ON public.lessons TO service_role;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lessons read authorized" ON public.lessons FOR SELECT TO authenticated USING (public.can_access_content(content_id));
CREATE POLICY "lessons admin write" ON public.lessons FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION public.content_lesson_titles(_content_id uuid)
RETURNS TABLE(title text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT l.title FROM public.lessons l JOIN public.content_items c ON c.id = l.content_id
  WHERE l.content_id = _content_id AND c.status = 'published' AND auth.uid() IS NOT NULL
  ORDER BY l.sort_order
$$;

CREATE TABLE public.recipe_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  sort_order int NOT NULL DEFAULT 0
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipe_categories TO authenticated;
GRANT ALL ON public.recipe_categories TO service_role;
ALTER TABLE public.recipe_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recipe_categories read" ON public.recipe_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "recipe_categories admin" ON public.recipe_categories FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.recipe_categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_path text,
  prep_minutes int,
  servings int,
  instructions text NOT NULL DEFAULT '',
  protein_g numeric,
  calories_kcal numeric,
  status public.publish_status NOT NULL DEFAULT 'draft',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.recipes (collection_id, sort_order);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipes TO authenticated;
GRANT ALL ON public.recipes TO service_role;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recipes read authorized" ON public.recipes FOR SELECT TO authenticated USING (public.is_admin() OR (status = 'published' AND public.can_access_content(collection_id)));
CREATE POLICY "recipes admin write" ON public.recipes FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.recipe_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  text text NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);
CREATE INDEX ON public.recipe_ingredients (recipe_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipe_ingredients TO authenticated;
GRANT ALL ON public.recipe_ingredients TO service_role;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ingredients read authorized" ON public.recipe_ingredients FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.recipes r WHERE r.id = recipe_id AND (public.is_admin() OR (r.status='published' AND public.can_access_content(r.collection_id)))));
CREATE POLICY "ingredients admin write" ON public.recipe_ingredients FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.favorites (
  user_id uuid NOT NULL,
  content_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, content_id)
);
GRANT SELECT, INSERT, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "favorites own read" ON public.favorites FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "favorites own insert" ON public.favorites FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND public.can_access_content(content_id));
CREATE POLICY "favorites own delete" ON public.favorites FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.lesson_progress (
  user_id uuid NOT NULL,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);
GRANT SELECT, INSERT, DELETE ON public.lesson_progress TO authenticated;
GRANT ALL ON public.lesson_progress TO service_role;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "progress own read" ON public.lesson_progress FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "progress own insert" ON public.lesson_progress FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.lessons l WHERE l.id = lesson_id AND public.can_access_content(l.content_id)));
CREATE POLICY "progress own delete" ON public.lesson_progress FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  target text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit admin read" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "audit admin insert" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (public.is_admin() AND actor_id = auth.uid());

-- STORAGE POLICIES (buckets: covers, materials — both private)
CREATE POLICY "covers read signed-in" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'covers');
CREATE POLICY "covers admin insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'covers' AND public.is_admin());
CREATE POLICY "covers admin update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'covers' AND public.is_admin());
CREATE POLICY "covers admin delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'covers' AND public.is_admin());
CREATE POLICY "materials admin insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'materials' AND public.is_admin());
CREATE POLICY "materials admin update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'materials' AND public.is_admin());
CREATE POLICY "materials admin delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'materials' AND public.is_admin());
CREATE POLICY "materials read authorized" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'materials' AND (public.is_admin() OR (
    (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$'
    AND public.can_access_content(((storage.foldername(name))[1])::uuid))));

-- SEED
INSERT INTO public.products (slug, title, description, is_main, sort_order) VALUES
 ('bumbum-net', 'Bumbum Net', 'Produto principal com todos os bônus incluídos.', true, 0);
INSERT INTO public.products (slug, title, description, price_label, offer_text, sort_order) VALUES
 ('gluteo-360', 'Glúteo 360º Avançado', 'Produto adicional', 'R$ 97,00', 'Acesso vitalício + planilhas de carga + aulas exclusivas com acompanhamento.', 1),
 ('cardapio-21', 'Cardápio Seca em 21 Dias', 'Produto adicional', 'R$ 47,00', 'Cardápio completo, lista de compras semanal e substituições inteligentes.', 2),
 ('mobilidade', 'Mobilidade & Postura', 'Produto adicional', 'R$ 37,00', '10 aulas guiadas para quadril, coluna e ombros.', 3);

INSERT INTO public.content_items (slug, kind, title, subtitle, duration_label, tone, status, sort_order, location) VALUES
 ('sequencia-ativadora','treino','Sequência Ativadora','Ative os glúteos antes de cada treino','15 min','pink','published',1,'ambos'),
 ('quadriceps-proporcional','protocolo','Protocolo Quadríceps Proporcional','Coxas definidas e equilibradas','4 semanas','orchid','published',2,'academia'),
 ('protocolo-posterior','protocolo','Protocolo Posterior','Posterior de coxa forte e firme','4 semanas','lavender','published',3,'academia'),
 ('superiores-a','treino','Treino de Superiores A','Costas e ombros em harmonia','40 min','periwinkle','published',4,'academia'),
 ('superiores-b','treino','Treino de Superiores B','Braços tonificados','35 min','pink','published',5,'academia'),
 ('receitas-proteicas','receitas','51 Receitas Proteicas','Alimentação saborosa para resultados','51 receitas','orchid','published',6,NULL),
 ('treino-express','protocolo','Protocolo Treino Express','Resultados em 20 minutos','20 min','lavender','published',7,'casa'),
 ('gluteo-360','protocolo','Glúteo 360º Avançado','Programa de 12 semanas para máxima hipertrofia','12 semanas','pink','published',8,'academia'),
 ('cardapio-21','receitas','Cardápio Seca em 21 Dias','Plano alimentar dia a dia','21 dias','periwinkle','published',9,NULL),
 ('mobilidade','treino','Mobilidade & Postura','Menos dor, mais amplitude','10 aulas','lavender','published',10,'casa');

INSERT INTO public.product_contents (product_id, content_id)
SELECT p.id, c.id FROM public.products p JOIN public.content_items c ON
  (p.slug = 'bumbum-net' AND c.slug IN ('sequencia-ativadora','quadriceps-proporcional','protocolo-posterior','superiores-a','superiores-b','receitas-proteicas','treino-express'))
  OR (p.slug <> 'bumbum-net' AND c.slug = p.slug);

INSERT INTO public.lessons (content_id, title, minutes, sort_order)
SELECT c.id, t.title, 8 + ((t.ord - 1) * 5 % 14), t.ord FROM public.content_items c
JOIN (VALUES
 ('sequencia-ativadora','Ponte glútea isométrica',1),('sequencia-ativadora','Abdução com mini band',2),('sequencia-ativadora','Coice quadrúpede',3),('sequencia-ativadora','Clamshell',4),('sequencia-ativadora','Caminhada lateral',5),
 ('quadriceps-proporcional','Agachamento búlgaro',1),('quadriceps-proporcional','Leg press pés baixos',2),('quadriceps-proporcional','Cadeira extensora',3),('quadriceps-proporcional','Afundo reverso',4),('quadriceps-proporcional','Sissy squat',5),
 ('protocolo-posterior','Stiff com halteres',1),('protocolo-posterior','Mesa flexora',2),('protocolo-posterior','Good morning',3),('protocolo-posterior','Nordic curl assistido',4),
 ('superiores-a','Puxada frontal',1),('superiores-a','Remada baixa',2),('superiores-a','Elevação lateral',3),('superiores-a','Face pull',4),
 ('superiores-b','Supino inclinado',1),('superiores-b','Rosca alternada',2),('superiores-b','Tríceps corda',3),('superiores-b','Desenvolvimento',4),
 ('treino-express','Circuito glúteo',1),('treino-express','Circuito pernas',2),('treino-express','HIIT final',3),
 ('gluteo-360','Fase 1 — Base',1),('gluteo-360','Fase 2 — Volume',2),('gluteo-360','Fase 3 — Intensidade',3),
 ('cardapio-21','Semana 1',1),('cardapio-21','Semana 2',2),('cardapio-21','Semana 3',3),
 ('mobilidade','Quadril',1),('mobilidade','Coluna',2),('mobilidade','Ombros',3)
) AS t(slug, title, ord) ON t.slug = c.slug;

INSERT INTO public.recipe_categories (name, sort_order) VALUES ('Café da manhã',1),('Almoço',2),('Lanche',3),('Jantar',4),('Sobremesa',5);

INSERT INTO public.recipes (collection_id, category_id, title, prep_minutes, servings, protein_g, calories_kcal, status, sort_order, instructions)
SELECT c.id, rc.id, r.title, r.prep, 1, r.prot, r.kcal, 'published', r.ord, 'Misture os ingredientes e prepare conforme indicado.'
FROM public.content_items c
CROSS JOIN (VALUES
 ('Panqueca de whey','Café da manhã',15,20,280,1),('Bowl de frango','Almoço',18,22,295,2),('Omelete de forno','Café da manhã',21,24,310,3),
 ('Mousse proteico','Sobremesa',24,26,325,4),('Wrap de atum','Lanche',27,28,340,5),('Overnight oats','Café da manhã',30,30,355,6),
 ('Crepioca fit','Lanche',33,32,370,7),('Salada de grão-de-bico','Almoço',36,34,385,8)
) AS r(title, cat, prep, prot, kcal, ord)
JOIN public.recipe_categories rc ON rc.name = r.cat
WHERE c.slug = 'receitas-proteicas';
