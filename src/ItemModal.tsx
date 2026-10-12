import React, { useState } from 'react';
import { X, Plus, Sparkles, BookOpen, Layers } from 'lucide-react';
import type { Item, ReadingStatus, ReadingType } from './types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<Item>) => void;
  initialData?: Item | null;
  availableTypes: ReadingType[];
  availableCategories: string[];
  onAddCategory: (newCat: string) => void;
  onOpenTypesModal: () => void;
}

export const ItemModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  availableTypes,
  availableCategories,
  onAddCategory,
  onOpenTypesModal,
}) => {
  if (!isOpen) return null;

  const defaultType = availableTypes[0]?.slug || 'manhwa';

  const [title, setTitle] = useState(initialData?.title || '');
  const [typeSlug, setTypeSlug] = useState<string>(initialData?.typeSlug || defaultType);
  const [status, setStatus] = useState<ReadingStatus>(initialData?.status || 'reading');
  const [currentSeason, setCurrentSeason] = useState<number | undefined>(initialData?.currentSeason ?? 1);
  const [currentChapter, setCurrentChapter] = useState<number | undefined>(initialData?.currentChapter ?? 0);
  const [totalChapters, setTotalChapters] = useState<number | undefined>(initialData?.totalChapters ?? undefined);
  const [currentPage, setCurrentPage] = useState<number | undefined>(initialData?.currentPage ?? 0);
  const [totalPages, setTotalPages] = useState<number | undefined>(initialData?.totalPages ?? undefined);
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialData?.categories || []);
  const [rating, setRating] = useState<number | undefined>(initialData?.rating || 0);
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [newCatInput, setNewCatInput] = useState('');

  const currentTypeObj = availableTypes.find((t) => t.slug === typeSlug) || availableTypes[0];
  const isPageBased = currentTypeObj?.progressType === 'page';

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatInput.trim();
    if (trimmed && !availableCategories.includes(trimmed)) {
      onAddCategory(trimmed);
      setSelectedCategories([...selectedCategories, trimmed]);
      setNewCatInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      typeSlug,
      status,
      currentSeason: isPageBased ? undefined : (currentSeason || 1),
      currentChapter: isPageBased ? undefined : (currentChapter || 0),
      totalChapters: isPageBased ? undefined : totalChapters,
      currentPage: isPageBased ? (currentPage || 0) : undefined,
      totalPages: isPageBased ? totalPages : undefined,
      coverImage: coverImage.trim(),
      categories: selectedCategories,
      rating,
      notes: notes.trim(),
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              {initialData ? 'Editar lectura' : 'Nueva lectura'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Lleva el control de tus lecturas</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Título */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Título
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Solo Leveling, Hábitos Atómicos..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-400 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800/90 focus:outline-none transition text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm font-medium"
            />
          </div>

          {/* Tipo y Estado */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Tipo
                </label>
                <button
                  type="button"
                  onClick={onOpenTypesModal}
                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  + Tipos
                </button>
              </div>
              <select
                value={typeSlug}
                onChange={(e) => setTypeSlug(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-400 focus:outline-none transition text-slate-800 dark:text-slate-100 text-sm font-medium cursor-pointer"
              >
                {availableTypes.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.icon} {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Estado
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ReadingStatus)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-400 focus:outline-none transition text-slate-800 dark:text-slate-100 text-sm font-medium cursor-pointer"
              >
                <option value="reading">🟢 Leyendo</option>
                <option value="plan_to_read">⏳ Por leer</option>
                <option value="completed">✅ Completado</option>
                <option value="on_hold">⏸️ En pausa</option>
              </select>
            </div>
          </div>

          {/* Progreso: Temporada & Capítulos O Páginas */}
          <div className="p-4 rounded-3xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-3">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider">
              {isPageBased ? <BookOpen size={16} /> : <Layers size={16} />}
              Progreso de lectura ({isPageBased ? 'Páginas' : 'Capítulos'})
            </div>

            {!isPageBased ? (
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Temporada
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={currentSeason ?? 1}
                    onChange={(e) => setCurrentSeason(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-indigo-200/80 dark:border-slate-700 text-center text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Capítulo
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={currentChapter ?? 0}
                    onChange={(e) => setCurrentChapter(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-indigo-200/80 dark:border-slate-700 text-center text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Total Caps
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="—"
                    value={totalChapters ?? ''}
                    onChange={(e) => setTotalChapters(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-indigo-200/80 dark:border-slate-700 text-center text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Página actual
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={currentPage ?? 0}
                    onChange={(e) => setCurrentPage(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-indigo-200/80 dark:border-slate-700 text-center text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Total páginas
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Ej. 350"
                    value={totalPages ?? ''}
                    onChange={(e) => setTotalPages(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-indigo-200/80 dark:border-slate-700 text-center text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
              </div>
            )}
          </div>

          {/* URL de Portada */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              URL de imagen de portada (Opcional)
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-400 focus:outline-none transition text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm"
            />
          </div>

          {/* Categorías */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Categorías
            </label>
            
            <div className="flex flex-wrap gap-1.5 mb-3">
              {availableCategories.map((cat) => {
                const isSelected = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs scale-102'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nueva categoría..."
                value={newCatInput}
                onChange={(e) => setNewCatInput(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-400 text-slate-700 dark:text-slate-200"
              />
              <button
                type="button"
                onClick={handleCreateCategory}
                className="px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-2xl text-xs font-semibold hover:bg-slate-700 transition flex items-center gap-1"
              >
                <Plus size={14} /> Agregar
              </button>
            </div>
          </div>

          {/* Calificación y Notas */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Calificación
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(rating === star ? 0 : star)}
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-sm transition-all ${
                    (rating || 0) >= star
                      ? 'bg-amber-400 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Notas personales
            </label>
            <textarea
              rows={2}
              placeholder="¿Qué te pareció el último capítulo? ¿Recordatorios?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-400 focus:outline-none transition text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm resize-none"
            />
          </div>

          {/* Botones de acción */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 dark:shadow-none transition-transform active:scale-98 flex items-center justify-center gap-2"
            >
              <Sparkles size={16} />
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
