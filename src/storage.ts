import type { Item, ReadingType } from './types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const ITEMS_KEY = 'bibliotrack_library_data_v2';
const CATEGORIES_KEY = 'bibliotrack_categories_data_v2';
const TYPES_KEY = 'bibliotrack_reading_types_v2';

export const INITIAL_TYPES: ReadingType[] = [
  { id: '1', slug: 'manhwa', label: 'Manhwa', icon: 'Sparkles', progressType: 'chapter' },
  { id: '2', slug: 'manga', label: 'Manga', icon: 'BookOpen', progressType: 'chapter' },
  { id: '3', slug: 'libro', label: 'Libro', icon: 'BookMarked', progressType: 'page' },
  { id: '4', slug: 'comic', label: 'Cómic', icon: 'Zap', progressType: 'chapter' },
  { id: '5', slug: 'novela', label: 'Novela Ligera', icon: 'Scroll', progressType: 'page' },
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
];

// --- GESTIÓN DE TIPOS ---
export async function fetchTypes(): Promise<ReadingType[]> {
  if (isSupabaseConfigured && supabase) {
    try {
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
    } catch (e) {
      console.warn('Error conectando a Supabase types:', e);
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

export async function saveTypeToSupabase(newType: Omit<ReadingType, 'id'>) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('reading_types').insert({
        slug: newType.slug,
        label: newType.label,
        icon: newType.icon,
        progress_type: newType.progressType,
      }).select().single();
      if (error) console.error('Error guardando tipo en Supabase:', error);
      return data;
    } catch (e) {
      console.error(e);
    }
  }
}

export async function deleteTypeFromSupabase(slug: string) {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('reading_types').delete().eq('slug', slug);
    } catch (e) {
      console.error(e);
    }
  }
}

// --- GESTIÓN DE CATEGORÍAS ---
export async function fetchCategories(): Promise<string[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('categories').select('name').order('name');
      if (!error && data && data.length > 0) {
        return data.map((d: any) => d.name);
      }
    } catch (e) {
      console.warn('Error fetching categories from Supabase:', e);
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

export async function saveCategoryToSupabase(name: string) {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('categories').insert({ name });
    } catch (e) {
      console.error(e);
    }
  }
}

// --- GESTIÓN DE LECTURAS ---
export async function fetchItems(): Promise<Item[]> {
  if (isSupabaseConfigured && supabase) {
    try {
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
      if (error) console.error('Error fetching items from Supabase:', error);
    } catch (e) {
      console.warn('Error conectando a items en Supabase:', e);
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

export async function saveItemToSupabase(item: Item) {
  if (isSupabaseConfigured && supabase) {
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(item.id);
      
      const payload: any = {
        title: item.title,
        type_slug: item.typeSlug,
        status: item.status,
        current_season: item.currentSeason,
        current_chapter: item.currentChapter,
        total_chapters: item.totalChapters,
        current_page: item.currentPage,
        total_pages: item.totalPages,
        cover_image: item.coverImage,
        categories: item.categories,
        rating: item.rating,
        notes: item.notes,
        updated_at: new Date().toISOString(),
      };

      if (isUUID) {
        // Actualizar registro existente
        const { data, error } = await supabase
          .from('items')
          .update(payload)
          .eq('id', item.id)
          .select()
          .single();

        if (error) {
          console.error('Error actualizando en Supabase:', error);
          alert('Error de Supabase: ' + error.message);
        }
        return data;
      } else {
        // Insertar nuevo registro
        const { data, error } = await supabase
          .from('items')
          .insert(payload)
          .select()
          .single();

        if (error) {
          console.error('Error insertando en Supabase:', error);
          alert('Error de Supabase: ' + error.message);
        }
        return data;
      }
    } catch (e: any) {
      console.error('Excepción guardando en Supabase:', e);
      alert('Error de conexión con Supabase');
    }
  }
}

export async function deleteItemFromSupabase(id: string) {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('items').delete().eq('id', id);
    } catch (e) {
      console.error(e);
    }
  }
}
