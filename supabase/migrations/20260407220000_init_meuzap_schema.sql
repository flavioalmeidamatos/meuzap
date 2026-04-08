CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.whatsapp_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    session_data JSONB,
    jid TEXT UNIQUE,
    status TEXT DEFAULT 'disconnected',
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id UUID REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE,
    jid TEXT NOT NULL,
    push_name TEXT,
    verified_name TEXT,
    avatar_url TEXT,
    is_group BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(instance_id, jid)
);

CREATE TABLE public.chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id UUID REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE,
    jid TEXT NOT NULL,
    contact_id UUID REFERENCES public.contacts(id),
    name TEXT,
    unread_count INT DEFAULT 0,
    last_message_preview TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    is_archived BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    is_muted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(instance_id, jid)
);

CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
    message_id TEXT NOT NULL,
    sender_jid TEXT NOT NULL,
    from_me BOOLEAN DEFAULT false,
    content TEXT,
    message_type TEXT NOT NULL,
    media_url TEXT,
    status TEXT DEFAULT 'sent',
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(chat_id, message_id)
);

CREATE INDEX idx_chats_last_message_at ON public.chats(last_message_at DESC);
CREATE INDEX idx_messages_chat_timestamp ON public.messages(chat_id, timestamp DESC);
CREATE INDEX idx_messages_status ON public.messages(status);
