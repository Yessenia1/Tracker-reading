import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  BookMarked,
  Compass,
  Clock,
  Filter,
  Sparkles,
  Download,
  Upload,
  Moon,
  Sun,
  Settings2,
  Database
} from 'lucide-react';
import type { Item, ReadingStatus, ReadingType } from './types';
import {
  fetchItems,
  persistItems,
  fetchCategories,
  persistCategories,
  fetchTypes,
  persistTypes,
  saveItemToSupabase,
  deleteItemFromSupabase,
  saveTypeToSupabase,
  deleteTypeFromSupabase,
  saveCategoryToSupabase
} from './storage';
import { isSupabaseConfigured } from './supabaseClient';
import { ItemCard } from './ItemCard';
import { ItemModal } from './ItemModal';
import { TypesModal } from './TypesModal';

export function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [readingTypes, setReadingTypes] = useState<ReadingType[]>([]);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTypesModalOpen, setIsTypesModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  // Dark Mode state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('bibliotrack_theme') === 'dark' ||
      (!('bibliotrack_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('bibliotrack_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('bibliotrack_theme', 'light');
    }
  }, [darkMode]);

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<ReadingStatus | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Load initial data
  useEffect(() => {
    async function loadData() {
      const [it, cat, tp] = await Promise.all([
        fetchItems(),
        fetchCategories(),
        fetchTypes(),
      ]);
      setItems(it);
      setCategories(cat);
      setReadingTypes(tp);
    }
    loadData();
  }, []);

  // CRUD Items
  const handleSaveItem = async (itemData: Partial<Item>) => {
    let targetItem: Item;
    let updated: Item[];
    if (editingItem) {
      targetItem = { ...editingItem, ...itemData } as Item;
      updated = items.map((it) => (it.id === editingItem.id ? targetItem : it));
    } else {
      targetItem = {
        id: Date.now().toString(),
        title: itemData.title || '',
        typeSlug: itemData.typeSlug || readingTypes[0]?.slug || 'manhwa',
        status: itemData.status || 'reading',
        currentSeason: itemData.currentSeason,
        currentChapter: itemData.currentChapter,
        totalChapters: itemData.totalChapters,
        currentPage: itemData.currentPage,
        totalPages: itemData.totalPages,
        coverImage: itemData.coverImage,
        categories: itemData.categories || [],
        rating: itemData.rating,
        notes: itemData.notes,
        updatedAt: new Date().toISOString(),
      };
      updated = [targetItem, ...items];
    }
    setItems(updated);
    persistItems(updated);
    setEditingItem(null);

    // Guardar en Supabase si está conectado
    const res = await saveItemToSupabase(targetItem);
    if (res && res.id && !editingItem) {
      const synced = updated.map((it) => it.id === targetItem.id ? { ...it, id: res.id } : it);
      setItems(synced);
      persistItems(synced);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar este elemento?')) {
      const updated = items.filter((it) => it.id !== id);
      setItems(updated);
      persistItems(updated);
      await deleteItemFromSupabase(id);
    }
  };

  const handleUpdateProgress = async (id: string, delta: number) => {
    let modified: Item | null = null;
    const updated = items.map((it) => {
      if (it.id !== id) return it;
      const typeObj = readingTypes.find((t) => t.slug === it.typeSlug);
      const isPage = typeObj?.progressType === 'page';

      if (isPage) {
        const next = Math.max(0, (it.currentPage || 0) + delta);
        modified = { ...it, currentPage: next, updatedAt: new Date().toISOString() };
      } else {
        const next = Math.max(0, (it.currentChapter || 0) + delta);
        modified = { ...it, currentChapter: next, updatedAt: new Date().toISOString() };
      }
      return modified;
    });
    setItems(updated);
    persistItems(updated);
    if (modified) {
      await saveItemToSupabase(modified);
    }
  };

  // CRUD Types
  const handleAddType = async (newType: Omit<ReadingType, 'id'>) => {
    const created: ReadingType = {
      ...newType,
      id: Date.now().toString(),
    };
    const updated = [...readingTypes, created];
    setReadingTypes(updated);
    persistTypes(updated);
    await saveTypeToSupabase(newType);
  };

  const handleDeleteType = async (slug: string) => {
    if (window.confirm(`¿Eliminar el tipo "${slug}"?`)) {
      const updated = readingTypes.filter((t) => t.slug !== slug);
      setReadingTypes(updated);
      persistTypes(updated);
      if (selectedType === slug) setSelectedType('all');
      await deleteTypeFromSupabase(slug);
    }
  };

  // Categories
  const handleAddCategory = async (newCat: string) => {
    if (!categories.includes(newCat)) {
      const updated = [...categories, newCat];
      setCategories(updated);
      persistCategories(updated);
      await saveCategoryToSupabase(newCat);
    }
  };

  // Export / Import
  const handleExportData = () => {
    const dataObj = { items, categories, readingTypes };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `bibliotrack_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.items) {
          setItems(parsed.items);
          persistItems(parsed.items);
          if (parsed.categories) { setCategories(parsed.categories); persistCategories(parsed.categories); }
          if (parsed.readingTypes) { setReadingTypes(parsed.readingTypes); persistTypes(parsed.readingTypes); }
          alert('¡Datos restaurados con éxito!');
        } else if (Array.isArray(parsed)) {
          setItems(parsed);
          persistItems(parsed);
          alert('¡Lecturas restauradas!');
        }
      } catch {
        alert('Archivo JSON no válido');
      }
    };
    reader.readAsText(file);
  };

  // Filters
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.categories.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = selectedType === 'all' || item.typeSlug === selectedType;
      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
      const matchesCategory = selectedCategory === 'all' || item.categories.includes(selectedCategory);

      return matchesSearch && matchesType && matchesStatus && matchesCategory;
    });
  }, [items, searchQuery, selectedType, selectedStatus, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#fbfbfa] dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 transition-colors pb-24">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-4 sm:px-8 py-3.5 transition-colors">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-none">
              <BookMarked size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                  BiblioTrack
                </h1>
                {isSupabaseConfigured && (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    <Database size={10} /> Supabase
                  </span>
                )}
              </div>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                Tu organizador de lecturas
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
              title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>

            {/* Tipos Modal Button */}
            <button
              onClick={() => setIsTypesModalOpen(true)}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
              title="Administrar tipos de lectura"
            >
              <Settings2 size={18} />
            </button>

            {/* Backup buttons */}
            <label className="cursor-pointer p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition" title="Importar JSON">
              <Upload size={18} />
              <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
            </label>
            <button
              onClick={handleExportData}
              title="Descargar copia JSON"
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
            >
              <Download size={18} />
            </button>

            {/* Add Book/Manhwa button */}
            <button
              onClick={() => {
                setEditingItem(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-2xl font-bold text-sm shadow-md shadow-indigo-200 dark:shadow-none transition active:scale-95"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Agregar lectura</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {/* Quick Stats Cards */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">Leyendo ahora</p>
              <p className="text-xl font-black text-slate-800 dark:text-white">
                {items.filter((i) => i.status === 'reading').length}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">Tipos creados</p>
              <p className="text-xl font-black text-slate-800 dark:text-white">{readingTypes.length}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Filter size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">Categorías</p>
              <p className="text-xl font-black text-slate-800 dark:text-white">{categories.length}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <BookMarked size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">Total guardados</p>
              <p className="text-xl font-black text-slate-800 dark:text-white">{items.length}</p>
            </div>
          </div>
        </section>

        {/* Search & Dynamic Filter Pills */}
        <section className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por título, categoría o notas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-850 focus:border-indigo-400 focus:outline-none text-sm font-medium transition text-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Dynamic Type selector pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${selectedType === 'all'
                  ? 'bg-slate-800 dark:bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
            >
              Todos
            </button>
            {readingTypes.map((t) => (
              <button
                key={t.slug}
                onClick={() => setSelectedType(t.slug)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${selectedType === t.slug
                    ? 'bg-slate-800 dark:bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Status selector & Category filters */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            {/* Status pills */}
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/60 p-1 rounded-2xl border border-slate-100 dark:border-slate-800">
              {[
                { id: 'all', label: 'Cualquiera' },
                { id: 'reading', label: 'Leyendo' },
                { id: 'plan_to_read', label: 'Por leer' },
                { id: 'completed', label: 'Completado' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setSelectedStatus(st.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition ${selectedStatus === st.id
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Categories filter dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <Filter size={14} /> Categoría:
              </span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-none outline-none cursor-pointer"
              >
                <option value="all">Todas las categorías</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Gallery Grid */}
        <section>
          {filteredItems.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-800 shadow-xs">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
                <Compass size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">No se encontraron lecturas</h3>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
                Prueba cambiando los filtros o agrega un nuevo título con el botón superior.
              </p>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setIsModalOpen(true);
                }}
                className="mt-5 inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-md shadow-indigo-100 dark:shadow-none"
              >
                <Plus size={16} /> Crear nueva lectura
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  readingType={readingTypes.find((t) => t.slug === item.typeSlug)}
                  onEdit={(it) => {
                    setEditingItem(it);
                    setIsModalOpen(true);
                  }}
                  onDelete={handleDeleteItem}
                  onUpdateProgress={handleUpdateProgress}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Floating Action Button (Mobile) */}
      <div className="sm:hidden fixed bottom-6 right-6 z-30">
        <button
          onClick={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
          className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-400 active:scale-95 transition"
        >
          <Plus size={26} />
        </button>
      </div>

      {/* Modal for create/edit reading item */}
      <ItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        initialData={editingItem}
        availableTypes={readingTypes}
        availableCategories={categories}
        onAddCategory={handleAddCategory}
        onOpenTypesModal={() => setIsTypesModalOpen(true)}
      />

      {/* Modal for CRUD of reading types */}
      <TypesModal
        isOpen={isTypesModalOpen}
        onClose={() => setIsTypesModalOpen(false)}
        types={readingTypes}
        onAddType={handleAddType}
        onDeleteType={handleDeleteType}
      />
    </div>
  );
}

export default App;
