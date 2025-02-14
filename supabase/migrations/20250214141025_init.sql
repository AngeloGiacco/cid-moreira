create table public.love_notes (
  id uuid not null default gen_random_uuid (),
  message text not null,
  audio_url text null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  share_id text not null default gen_random_uuid (),
  constraint love_notes_pkey primary key (id),
  constraint love_notes_share_id_key unique (share_id)
) TABLESPACE pg_default;