-- 020_analytics_events.sql
-- Mesure d'audience FIRST-PARTY, RGPD-propre.
--
-- Aucune donnée personnelle : session_id = identifiant ANONYME de navigateur
-- (UUID, jamais relié à une identité), pas d'IP stockée. L'écriture passe
-- exclusivement par la route serveur /api/track (service role), elle-même
-- déclenchée côté client UNIQUEMENT si le consentement cookie est donné.
--
-- RLS activé SANS policy → ni anon ni authenticated n'y accèdent ; seul le
-- service role (routes serveur) lit/écrit. Le dashboard /admin lit via une
-- route admin dédiée.

create table if not exists public.analytics_events (
  id          bigint generated always as identity primary key,
  session_id  text not null,
  event_type  text not null,
  path        text,
  referrer    text,
  meta        jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists idx_analytics_events_created_at
  on public.analytics_events (created_at desc);

create index if not exists idx_analytics_events_type_created
  on public.analytics_events (event_type, created_at desc);

alter table public.analytics_events enable row level security;
-- Pas de policy volontairement : accès réservé au service role (routes serveur).
