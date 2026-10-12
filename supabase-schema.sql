-- ========================================================
-- SCHEMA SQL PARA SUPABASE (BiblioTrack)
-- Pega este script en Supabase -> SQL Editor -> Run
-- ========================================================

-- 1. Habilitar extensión UUID
create extension if not exists "uuid-ossp";

-- 2. Tabla de Tipos de Lectura (CRUD de tipos: Manhwa, Manga, Libro, etc.)
create table if not exists public.reading_types (
    id uuid default gen_random_uuid() primary key,
    slug text not null unique,
    label text not null,
    icon text default 'BookOpen',
    progress_type text not null default 'chapter' check (progress_type in ('chapter', 'page')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Tabla de Categorías / Géneros
create table if not exists public.categories (
    id uuid default gen_random_uuid() primary key,
    name text not null unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Tabla Principal de Obras / Lecturas
create table if not exists public.items (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    type_slug text references public.reading_types(slug) on delete cascade on update cascade,
    status text not null default 'reading' check (status in ('reading', 'completed', 'on_hold', 'plan_to_read')),
    current_season integer default 1,
    current_chapter integer default 0,
    total_chapters integer,
    current_page integer default 0,
    total_pages integer,
    cover_image text,
    rating integer check (rating >= 0 and rating <= 5),
    notes text,
    categories text[] default array[]::text[],
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Valores iniciales por defecto para Tipos
insert into public.reading_types (slug, label, icon, progress_type)
values
    ('manhwa', 'Manhwa', '✨', 'chapter'),
    ('manga', 'Manga', '📖', 'chapter'),
    ('libro', 'Libro', '📚', 'page'),
    ('comic', 'Cómic', '🦸', 'chapter'),
    ('novela', 'Novela Ligera', '📜', 'page')
on conflict (slug) do nothing;

-- 6. Categorías iniciales por defecto
insert into public.categories (name)
values 
    ('Acción'), ('Fantasía'), ('Romance'), ('Isekai'), 
    ('Ciencia Ficción'), ('Misterio'), ('Desarrollo Personal'), 
    ('Aventura'), ('Comedia'), ('Psicológico')
on conflict (name) do nothing;

-- 7. Habilitar Row Level Security (RLS) pero permitir acceso público / anónimo inicial
alter table public.reading_types enable row level security;
alter table public.categories enable row level security;
alter table public.items enable row level security;

-- Políticas de lectura y escritura libre (o configúralo con auth según prefieras)
create policy "Acceso completo a tipos" on public.reading_types for all using (true) with check (true);
create policy "Acceso completo a categorias" on public.categories for all using (true) with check (true);
create policy "Acceso completo a lecturas" on public.items for all using (true) with check (true);
