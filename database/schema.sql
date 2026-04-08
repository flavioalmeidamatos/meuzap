-- Extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Usuários da Plataforma (Nossos operadores)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Instâncias do WhatsApp (Números conectados)
CREATE TABLE public.whatsapp_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    session_data JSONB, -- Onde o Bridge salvará o estado/token do Baileys/Whatsmeow
    jid TEXT UNIQUE, -- Ex: 5511999999999@s.whatsapp.net
    status TEXT DEFAULT 'disconnected', -- 'connected', 'disconnected', 'pairing'
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Contatos
CREATE TABLE public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id UUID REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE,
    jid TEXT NOT NULL, -- Ex: 5511888888888@s.whatsapp.net
    push_name TEXT,
    verified_name TEXT,
    avatar_url TEXT,
    is_group BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(instance_id, jid)
);

-- 4. Chats (Conversas)
CREATE TABLE public.chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id UUID REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE,
    jid TEXT NOT NULL,
    contact_id UUID REFERENCES public.contacts(id),
    name TEXT, -- Caso seja alterado localmente
    unread_count INT DEFAULT 0,
    last_message_preview TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    is_archived BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    is_muted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(instance_id, jid)
);

-- 5. Mensagens
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
    message_id TEXT NOT NULL, -- ID original do WhatsApp, crucial para deduplicação
    sender_jid TEXT NOT NULL,
    from_me BOOLEAN DEFAULT false,
    content TEXT,
    message_type TEXT NOT NULL, -- 'text', 'image', 'video', 'audio', 'document'
    media_url TEXT,
    status TEXT DEFAULT 'sent', -- 'pending', 'sent', 'delivered', 'read', 'failed'
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(chat_id, message_id)
);

-- Índices Funcionais
CREATE INDEX idx_chats_last_message_at ON chats(last_message_at DESC);
CREATE INDEX idx_messages_chat_timestamp ON messages(chat_id, timestamp DESC);
CREATE INDEX idx_messages_status ON messages(status);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.user_profiles FROM anon, authenticated;
REVOKE ALL ON TABLE public.whatsapp_instances FROM anon, authenticated;
REVOKE ALL ON TABLE public.contacts FROM anon, authenticated;
REVOKE ALL ON TABLE public.chats FROM anon, authenticated;
REVOKE ALL ON TABLE public.messages FROM anon, authenticated;

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
