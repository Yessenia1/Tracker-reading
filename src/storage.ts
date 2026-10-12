import type { Item, ReadingType } from './types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const ITEMS_KEY = 'bibliotrack_library_data_v2';
const CATEGORIES_KEY = 'bibliotrack_categories_data_v2';
const TYPES_KEY = 'bibliotrack_reading_types_v2';

export const INITIAL_TYPES: ReadingType[] = [
  { id: '1', slug: 'manhwa', label: 'Manhwa', icon: '✨', progressType: 'chapter' },
  { id: '2', slug: 'manga', label: 'Manga', icon: '📖', progressType: 'chapter' },
  { id: '3', slug: 'libro', label: 'Libro', icon: '📚', progressType: 'page' },
  { id: '4', slug: 'comic', label: 'Cómic', icon: '🦸', progressType: 'chapter' },
  { id: '5', slug: 'novela', label: 'Novela Ligera', icon: '📜', progressType: 'page' },
];

export const INITIAL_CATEGORIES = [
  'Fantasía',
  'Acción',
  'Romance',
  'Isekai',
  'Ciencia Ficción',
  'Misterio',
  'Desarrollo Personal',
  'Aventura',
  'Comedia',
];

export const INITIAL_ITEMS: Item[] = [
  {
    id: '1',
    title: 'Solo Leveling',
    typeSlug: 'manhwa',
    status: 'completed',
    currentSeason: 2,
    currentChapter: 179,
    totalChapters: 179,
    coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80',
    categories: ['Acción', 'Fantasía'],
    rating: 5,
    notes: '¡Uno de los mejores manhwas de acción! Temporada 2 terminada.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Omniscient Reader’s Viewpoint',
    typeSlug: 'manhwa',
    status: 'reading',
    currentSeason: 1,
    currentChapter: 185,
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
    categories: ['Acción', 'Fantasía', 'Misterio'],
    rating: 5,
    notes: 'Quedé en la parte donde Dokja planea el escenario.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Hábitos Atómicos',
    typeSlug: 'libro',
    status: 'reading',
    currentPage: 142,
    totalPages: 320,
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80',
    categories: ['Desarrollo Personal'],
    rating: 4,
    notes: 'Regla de los 2 minutos explicada muy bien.',
    updatedAt: new Date().toISOString(),
  },
];

// --- GESTIÓN DE TIPOS ---
export async function fetchTypes(): Promise<ReadingType[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('reading_types').select('*').order('created_at', { ascending: true });
    if (!error && data && data.length > 0) {
      return data.map((d: any) => ({
        id: d.id,
        slug: d.slug,
        label: d.label,
        icon: d.icon,
        progressType: d.progress_type,
      }));
    }
  }

  try {
    const stored = localStorage.getItem(TYPES_KEY);
    if (!stored) {
      localStorage.setItem(TYPES_KEY, JSON.stringify(INITIAL_TYPES));
      return INITIAL_TYPES;
    }
    return JSON.parse(stored);
  } catch {
    return INITIAL_TYPES;
  }
}

export async function persistTypes(types: ReadingType[]): Promise<void> {
  localStorage.setItem(TYPES_KEY, JSON.stringify(types));
}

// --- GESTIÓN DE CATEGORÍAS ---
export async function fetchCategories(): Promise<string[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('categories').select('name').order('name');
    if (!error && data && data.length > 0) {
      return data.map((d: any) => d.name);
    }
  }

  try {
    const stored = localStorage.getItem(CATEGORIES_KEY);
    if (!stored) {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(INITIAL_CATEGORIES));
      return INITIAL_CATEGORIES;
    }
    return JSON.parse(stored);
  } catch {
    return INITIAL_CATEGORIES;
  }
}

export async function persistCategories(categories: string[]): Promise<void> {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

// --- GESTIÓN DE LECTURAS ---
export async function fetchItems(): Promise<Item[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('items').select('*').order('updated_at', { ascending: false });
    if (!error && data) {
      return data.map((d: any) => ({
        id: d.id,
        title: d.title,
        typeSlug: d.type_slug,
        status: d.status,
        currentSeason: d.current_season,
        currentChapter: d.current_chapter,
        totalChapters: d.total_chapters,
        currentPage: d.current_page,
        totalPages: d.total_pages,
        coverImage: d.cover_image,
        categories: d.categories || [],
        rating: d.rating,
        notes: d.notes,
        updatedAt: d.updated_at,
      }));
    }
  }

  try {
    const stored = localStorage.getItem(ITEMS_KEY);
    if (!stored) {
      localStorage.setItem(ITEMS_KEY, JSON.stringify(INITIAL_ITEMS));
      return INITIAL_ITEMS;
    }
    return JSON.parse(stored);
  } catch {
    return INITIAL_ITEMS;
  }
}

export async function persistItems(items: Item[]): Promise<void> {
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
}
