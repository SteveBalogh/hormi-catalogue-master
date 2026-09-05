CREATE OR REPLACE FUNCTION public.current_user_has_role(_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY INVOKER
SET search_path TO 'public'
AS $function$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = _role
  )
$function$;

GRANT EXECUTE ON FUNCTION public.current_user_has_role(app_role) TO authenticated, service_role;

DROP POLICY "categories admin write" ON public.categories;
CREATE POLICY "categories admin write" ON public.categories FOR ALL TO authenticated
  USING (public.current_user_has_role('admin')) WITH CHECK (public.current_user_has_role('admin'));

DROP POLICY "products admin write" ON public.products;
CREATE POLICY "products admin write" ON public.products FOR ALL TO authenticated
  USING (public.current_user_has_role('admin')) WITH CHECK (public.current_user_has_role('admin'));

DROP POLICY "products admin read all" ON public.products;
CREATE POLICY "products admin read all" ON public.products FOR SELECT TO authenticated
  USING (public.current_user_has_role('admin'));

DROP POLICY "import logs admin" ON public.import_logs;
CREATE POLICY "import logs admin" ON public.import_logs FOR ALL TO authenticated
  USING (public.current_user_has_role('admin')) WITH CHECK (public.current_user_has_role('admin'));

REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;