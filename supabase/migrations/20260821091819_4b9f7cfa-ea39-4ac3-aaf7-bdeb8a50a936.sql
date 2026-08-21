revoke all on function public.has_role(uuid, public.app_role) from public, anon;
revoke all on function public.update_updated_at_column() from public, anon, authenticated;