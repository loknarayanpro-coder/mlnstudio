-- THREADS Digital Wardrobe & Personal Stylist Schema
-- Migration: 20261018000000_init_threads_schema.sql

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  palette_direction text default 'Balanced neutrals',
  favorite_colors text[] default '{}',
  disliked_colors text[] default '{}',
  preferred_neutrals text[] default '{"Navy", "Charcoal", "White", "Sand"}',
  preferred_accents text[] default '{"Olive", "Sky blue", "Cognac"}',
  preferred_contrast text default 'Medium contrast',
  style_preferences text[] default '{"Minimalist", "Smart casual"}',
  fit_preferences text[] default '{"Regular", "Tailored"}',
  city text default 'New York',
  latitude numeric(9,6),
  longitude numeric(9,6),
  enable_weather_styling boolean default true,
  onboarding_completed boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 2. Wardrobe Items Table
create table if not exists public.wardrobe_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  category text not null,
  subcategory text not null,
  clothing_type text,
  color_name text not null,
  dominant_hex text not null,
  secondary_colors text[] default '{}',
  attributes jsonb default '{}'::jsonb not null,
  original_image_path text not null,
  processed_image_path text,
  thumbnail_path text,
  image_status text default 'original' not null,
  ai_analysis_status text default 'pending' not null,
  ai_confidence numeric(5,2),
  favorite boolean default false not null,
  wear_count integer default 0 not null,
  last_worn_at timestamptz,
  archived boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 3. Outfits Table
create table if not exists public.outfits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  occasion text default 'Everyday' not null,
  style_tags text[] default '{}',
  notes text,
  wear_count integer default 0 not null,
  last_worn_at timestamptz,
  scheduled_for_date date,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 4. Outfit Items Join Table
create table if not exists public.outfit_items (
  id uuid primary key default uuid_generate_v4(),
  outfit_id uuid references public.outfits on delete cascade not null,
  wardrobe_item_id uuid references public.wardrobe_items on delete cascade not null,
  role text default 'main' not null,
  created_at timestamptz default now() not null
);

-- 5. Outfit Feedback Table
create table if not exists public.outfit_feedback (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  outfit_id uuid references public.outfits on delete set null,
  recommended_item_ids uuid[] default '{}' not null,
  feedback_type text not null, -- 'love', 'save', 'not_for_me', 'swap_item', 'worn'
  reason text,
  notes text,
  created_at timestamptz default now() not null
);

-- 6. Wear Events Table
create table if not exists public.wear_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  outfit_id uuid references public.outfits on delete set null,
  wardrobe_item_id uuid references public.wardrobe_items on delete set null,
  worn_at timestamptz default now() not null,
  notes text
);

-- 7. Recommendation Events Table
create table if not exists public.recommendation_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  occasion text,
  metadata jsonb default '{}'::jsonb not null,
  outcome text,
  created_at timestamptz default now() not null
);

-- Indexes for performance
create index if not exists idx_wardrobe_items_user_id on public.wardrobe_items(user_id);
create index if not exists idx_wardrobe_items_category on public.wardrobe_items(category);
create index if not exists idx_wardrobe_items_favorite on public.wardrobe_items(favorite);
create index if not exists idx_outfits_user_id on public.outfits(user_id);
create index if not exists idx_outfit_items_outfit_id on public.outfit_items(outfit_id);
create index if not exists idx_outfit_items_wardrobe_item_id on public.outfit_items(wardrobe_item_id);
create index if not exists idx_wear_events_user_id on public.wear_events(user_id);

-- Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.wardrobe_items enable row level security;
alter table public.outfits enable row level security;
alter table public.outfit_items enable row level security;
alter table public.outfit_feedback enable row level security;
alter table public.wear_events enable row level security;
alter table public.recommendation_events enable row level security;

-- Profiles Policies
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Wardrobe Items Policies
create policy "Users can view own wardrobe items" on public.wardrobe_items
  for select using (auth.uid() = user_id);
create policy "Users can insert own wardrobe items" on public.wardrobe_items
  for insert with check (auth.uid() = user_id);
create policy "Users can update own wardrobe items" on public.wardrobe_items
  for update using (auth.uid() = user_id);
create policy "Users can delete own wardrobe items" on public.wardrobe_items
  for delete using (auth.uid() = user_id);

-- Outfits Policies
create policy "Users can view own outfits" on public.outfits
  for select using (auth.uid() = user_id);
create policy "Users can insert own outfits" on public.outfits
  for insert with check (auth.uid() = user_id);
create policy "Users can update own outfits" on public.outfits
  for update using (auth.uid() = user_id);
create policy "Users can delete own outfits" on public.outfits
  for delete using (auth.uid() = user_id);

-- Outfit Items Policies
create policy "Users can view own outfit items" on public.outfit_items
  for select using (
    exists (select 1 from public.outfits where outfits.id = outfit_items.outfit_id and outfits.user_id = auth.uid())
  );
create policy "Users can insert own outfit items" on public.outfit_items
  for insert with check (
    exists (select 1 from public.outfits where outfits.id = outfit_items.outfit_id and outfits.user_id = auth.uid())
  );
create policy "Users can delete own outfit items" on public.outfit_items
  for delete using (
    exists (select 1 from public.outfits where outfits.id = outfit_items.outfit_id and outfits.user_id = auth.uid())
  );

-- Outfit Feedback Policies
create policy "Users can view own outfit feedback" on public.outfit_feedback
  for select using (auth.uid() = user_id);
create policy "Users can insert own outfit feedback" on public.outfit_feedback
  for insert with check (auth.uid() = user_id);

-- Wear Events Policies
create policy "Users can view own wear events" on public.wear_events
  for select using (auth.uid() = user_id);
create policy "Users can insert own wear events" on public.wear_events
  for insert with check (auth.uid() = user_id);

-- Recommendation Events Policies
create policy "Users can view own recommendation events" on public.recommendation_events
  for select using (auth.uid() = user_id);
create policy "Users can insert own recommendation events" on public.recommendation_events
  for insert with check (auth.uid() = user_id);
