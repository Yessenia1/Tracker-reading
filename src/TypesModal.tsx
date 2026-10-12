import React, { useState } from 'react';
import { X, Plus, Trash2, Tag, BookOpen, Layers } from 'lucide-react';
import type { ReadingType, ProgressTrackingType } from './types';

interface TypesModalProps {
  isOpen: boolean;
  onClose: () => void;
  types: ReadingType[];
  onAddType: (newType: Omit<ReadingType, 'id'>) => void;
  onDeleteType: (slug: string) => void;
}

export const TypesModal: React.FC<TypesModalProps> = ({
  isOpen,
  onClose,
  types,
  onAddType,
  onDeleteType,
}) => {
  if (!isOpen) return null;

  const [label, setLabel] = useState('');
  const [icon, setIcon] = useState('✨');
  const [progressType, setProgressType] = useState<ProgressTrackingType>('chapter');

  const commonIcons = ['✨', '📖', '📚', '🦸', '📜', '🎨', '📝', '🎬', '🎧'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanLabel = label.trim();
    if (!cleanLabel) return;

    const slug = cleanLabel.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (types.some((t) => t.slug === slug)) {
      alert('Ya existe un tipo con este nombre');
      return;
    }

    onAddType({
      slug,
      label: cleanLabel,
      icon,
      progressType,
    });

    setLabel('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 dark:border-slate-800 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Tag size={18} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                Gestionar Tipos
              </h2>
              <p className="text-xs text-slate-400">Personaliza tus categorías de lectura</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Existing types list */}
        <div className="py-4 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Tipos actuales</p>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {types.map((t) => (
              <div
                key={t.slug}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{t.icon}</span>
                  <div>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block leading-tight">
                      {t.label}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Progreso: {t.progressType === 'chapter' ? 'Capítulos' : 'Páginas'}
                    </span>
                  </div>
                </div>

                {types.length > 1 && (
                  <button
                    onClick={() => onDeleteType(t.slug)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                    title="Eliminar tipo"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add new type form */}
        <form onSubmit={handleSubmit} className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3.5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Crear nuevo tipo</p>
          
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Nombre</label>
            <input
              type="text"
              required
              placeholder="Ej. Webtoon, Novela Web..."
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Emoji / Ícono</label>
            <div className="flex flex-wrap gap-1.5">
              {commonIcons.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`w-9 h-9 rounded-2xl text-base flex items-center justify-center transition ${
                    icon === ic
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">¿Cómo mides el progreso?</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setProgressType('chapter')}
                className={`py-2 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
                  progressType === 'chapter'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Layers size={14} /> Capítulos
              </button>
              <button
                type="button"
                onClick={() => setProgressType('page')}
                className={`py-2 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
                  progressType === 'page'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <BookOpen size={14} /> Páginas
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 transition active:scale-98"
          >
            <Plus size={16} /> Crear tipo
          </button>
        </form>
      </div>
    </div>
  );
};
