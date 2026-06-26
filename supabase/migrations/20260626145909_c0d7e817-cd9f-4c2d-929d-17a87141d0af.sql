
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.is_admin(_user_id uuid) RETURNS boolean
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND role = 'admin'); $$;

CREATE OR REPLACE FUNCTION private.is_editor_or_admin(_user_id uuid) RETURNS boolean
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND role IN ('editor','admin')); $$;

REVOKE EXECUTE ON FUNCTION private.is_admin(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION private.is_editor_or_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_editor_or_admin(uuid) TO authenticated;

DROP POLICY IF EXISTS "Active ads readable" ON public.ads;
CREATE POLICY "Active ads readable" ON public.ads FOR SELECT USING ((is_active = true) OR private.is_editor_or_admin(auth.uid()));
DROP POLICY IF EXISTS "Admins manage ads" ON public.ads;
CREATE POLICY "Admins manage ads" ON public.ads FOR ALL USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Published articles are public" ON public.articles;
CREATE POLICY "Published articles are public" ON public.articles FOR SELECT USING ((status = 'published') OR private.is_editor_or_admin(auth.uid()));
DROP POLICY IF EXISTS "Editors can insert articles" ON public.articles;
CREATE POLICY "Editors can insert articles" ON public.articles FOR INSERT WITH CHECK (private.is_editor_or_admin(auth.uid()));
DROP POLICY IF EXISTS "Editors can update articles" ON public.articles;
CREATE POLICY "Editors can update articles" ON public.articles FOR UPDATE USING (private.is_editor_or_admin(auth.uid())) WITH CHECK (private.is_editor_or_admin(auth.uid()));
DROP POLICY IF EXISTS "Editors can delete articles" ON public.articles;
CREATE POLICY "Editors can delete articles" ON public.articles FOR DELETE USING (private.is_editor_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Editors manage tags" ON public.tags;
CREATE POLICY "Editors manage tags" ON public.tags FOR ALL USING (private.is_editor_or_admin(auth.uid())) WITH CHECK (private.is_editor_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Editors manage article tags" ON public.article_tags;
CREATE POLICY "Editors manage article tags" ON public.article_tags FOR ALL USING (private.is_editor_or_admin(auth.uid())) WITH CHECK (private.is_editor_or_admin(auth.uid()));

DROP FUNCTION IF EXISTS public.is_admin(uuid);
DROP FUNCTION IF EXISTS public.is_editor_or_admin(uuid);
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC;

DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public read post-images" ON storage.objects;

REVOKE ALL ON TABLE public."clientes_site_IAMAI" FROM anon, authenticated;
GRANT ALL ON TABLE public."clientes_site_IAMAI" TO service_role;
DROP POLICY IF EXISTS "Admins read clientes_site_IAMAI" ON public."clientes_site_IAMAI";
DROP POLICY IF EXISTS "Admins manage clientes_site_IAMAI" ON public."clientes_site_IAMAI";
CREATE POLICY "Admins manage clientes_site_IAMAI" ON public."clientes_site_IAMAI"
  FOR ALL TO authenticated USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));
