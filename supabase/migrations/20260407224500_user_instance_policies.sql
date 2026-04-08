CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data ->> 'name',
      split_part(COALESCE(NEW.email, 'usuario'), '@', 1)
    )
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

GRANT SELECT, UPDATE ON public.user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_instances TO authenticated;
GRANT SELECT ON public.contacts TO authenticated;
GRANT SELECT ON public.chats TO authenticated;
GRANT SELECT ON public.messages TO authenticated;

CREATE POLICY "user_profiles_select_own"
ON public.user_profiles
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = id);

CREATE POLICY "user_profiles_update_own"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = id)
WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "whatsapp_instances_select_own"
ON public.whatsapp_instances
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "whatsapp_instances_insert_own"
ON public.whatsapp_instances
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "whatsapp_instances_update_own"
ON public.whatsapp_instances
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "whatsapp_instances_delete_own"
ON public.whatsapp_instances
FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "contacts_select_owned_instances"
ON public.contacts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.whatsapp_instances wi
    WHERE wi.id = contacts.instance_id
      AND wi.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "chats_select_owned_instances"
ON public.chats
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.whatsapp_instances wi
    WHERE wi.id = chats.instance_id
      AND wi.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "messages_select_owned_instances"
ON public.messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.chats c
    JOIN public.whatsapp_instances wi ON wi.id = c.instance_id
    WHERE c.id = messages.chat_id
      AND wi.user_id = (SELECT auth.uid())
  )
);
