-- ============================================================================
-- RenVest — Schema SQL para Supabase (Plano Gratuito)
-- Execute este script no SQL Editor do seu projeto Supabase.
-- Inclui Row Level Security (RLS) para isolar 100% os dados de cada usuário.
-- ============================================================================

-- 1. Perfis de Usuário
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Investidor',
  email text,
  investor_profile text not null default 'Moderado' check (investor_profile in ('Conservador', 'Moderado', 'Arrojado')),
  onboarding_completed boolean not null default false,
  updated_at timestamptz not null default now()
);

-- 2. Carteira de Investimentos (por usuário)
create table if not exists public.portfolio_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  name text not null,
  institution text not null default 'Corretora',
  invested_value numeric(14, 2) not null default 0,
  current_value numeric(14, 2) not null default 0,
  updated_at timestamptz not null default now()
);

-- 3. Histórico de Evolução da Carteira (Snapshots)
create table if not exists public.portfolio_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  invested_total numeric(14, 2) not null default 0,
  current_total numeric(14, 2) not null default 0,
  recorded_at timestamptz not null default now()
);

-- 4. Histórico de Análises de Aporte da IA
create table if not exists public.ai_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('auto', 'filtered', 'specific')),
  amount numeric(14, 2) not null,
  investor_profile text not null,
  title text not null,
  summary text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

-- 5. Histórico do Chat Dona Rê
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

-- Índices para performance
create index if not exists idx_portfolio_assets_user on public.portfolio_assets(user_id);
create index if not exists idx_portfolio_snapshots_user on public.portfolio_snapshots(user_id, recorded_at);
create index if not exists idx_ai_analyses_user on public.ai_analyses(user_id, created_at desc);
create index if not exists idx_chat_messages_user on public.chat_messages(user_id, created_at asc);

-- ============================================================================
-- Row Level Security (RLS) — Cada usuário só lê e escreve os próprios dados
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.portfolio_assets enable row level security;
alter table public.portfolio_snapshots enable row level security;
alter table public.ai_analyses enable row level security;
alter table public.chat_messages enable row level security;

-- Policies: profiles
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Policies: portfolio_assets
create policy "Users manage own portfolio" on public.portfolio_assets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Policies: portfolio_snapshots
create policy "Users manage own snapshots" on public.portfolio_snapshots
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Policies: ai_analyses
create policy "Users manage own ai analyses" on public.ai_analyses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Policies: chat_messages
create policy "Users manage own chat messages" on public.chat_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Trigger automático para criar perfil ao cadastrar novo usuário
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, investor_profile, onboarding_completed)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    'Moderado',
    false
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
