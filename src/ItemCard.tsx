import { Plus, Minus, Trash2, Edit3, BookOpen, Layers, Star } from 'lucide-react';
import type { Item, ReadingStatus, ReadingType } from './types';
import { TypeIcon } from './IconHelper';

interface CardProps {
  item: Item;
  readingType?: ReadingType;
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
  onUpdateProgress: (id: string, delta: number) => void;
}

export const ItemCard: React.FC<CardProps> = ({
  item,
  readingType,
  onEdit,
  onDelete,
  onUpdateProgress,
}) => {
  const isPageBased = readingType?.progressType === 'page';

  const statusLabels: Record<ReadingStatus, { text: string; bg: string; color: string; darkBg: string; darkColor: string }> = {
    reading: { text: 'Leyendo', bg: 'bg-emerald-50', color: 'text-emerald-700', darkBg: 'dark:bg-emerald-950/40', darkColor: 'dark:text-emerald-300' },
    completed: { text: 'Completado', bg: 'bg-blue-50', color: 'text-blue-700', darkBg: 'dark:bg-blue-950/40', darkColor: 'dark:text-blue-300' },
    on_hold: { text: 'Pausa', bg: 'bg-amber-50', color: 'text-amber-700', darkBg: 'dark:bg-amber-950/40', darkColor: 'dark:text-amber-300' },
    plan_to_read: { text: 'Por leer', bg: 'bg-purple-50', color: 'text-purple-700', darkBg: 'dark:bg-purple-950/40', darkColor: 'dark:text-purple-300' },
  };

  const currentStatus = statusLabels[item.status] || statusLabels.reading;

  const currentProgress = isPageBased ? (item.currentPage || 0) : (item.currentChapter || 0);
  const total = isPageBased ? item.totalPages : item.totalChapters;
  const progressPercent = total ? Math.min(100, Math.round((currentProgress / total) * 100)) : null;

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-xs hover:shadow-xl dark:hover:shadow-indigo-950/30 transition-all duration-300 border border-slate-100 dark:border-slate-800 flex flex-col justify-between overflow-hidden">
      <div>
        {/* Cover or placeholder */}
        <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3.5">
          {item.coverImage ? (
            <img
              src={item.coverImage}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600 bg-gradient-to-br from-indigo-50/50 via-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
              {isPageBased ? <BookOpen size={36} /> : <Layers size={36} />}
              <span className="text-xs font-semibold mt-2">{readingType?.label || item.typeSlug}</span>
            </div>
          )}

          {/* Type Badge & Status Pill */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-800 dark:text-slate-200 shadow-xs uppercase tracking-wider flex items-center gap-1.5">
              <TypeIcon iconName={readingType?.icon} size={13} className="text-indigo-600 dark:text-indigo-400" />
              <span>{readingType?.label || item.typeSlug}</span>
            </span>
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold shadow-xs ${currentStatus.bg} ${currentStatus.color} ${currentStatus.darkBg} ${currentStatus.darkColor}`}>
              {currentStatus.text}
            </span>
          </div>

          {/* Quick Edit/Delete buttons */}
          <div className="absolute top-2.5 right-2.5 flex gap-1">
            <button
              onClick={() => onEdit(item)}
              title="Editar"
              className="w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center shadow-xs transition"
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              title="Eliminar"
              className="w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center shadow-xs transition"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Title & Season */}
        <div className="mb-2">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base line-clamp-1 leading-snug">
              {item.title}
            </h3>
            {item.rating ? (
              <span className="text-amber-500 font-bold text-xs flex items-center gap-1 shrink-0">
                <Star size={13} className="fill-amber-400 text-amber-400" /> {item.rating}
              </span>
            ) : null}
          </div>

          {!isPageBased && item.currentSeason ? (
            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              Temporada {item.currentSeason}
            </p>
          ) : null}
        </div>

        {/* Categories tags */}
        {item.categories && item.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.categories.slice(0, 3).map((cat) => (
              <span
                key={cat}
                className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              >
                {cat}
              </span>
            ))}
            {item.categories.length > 3 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-400">
                +{item.categories.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Notes preview if exists */}
        {item.notes && (
          <p className="text-[12px] text-slate-500 dark:text-slate-400 line-clamp-2 italic mb-3 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
            "{item.notes}"
          </p>
        )}
      </div>

      {/* Progress tracker widget */}
      <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
          <span>{isPageBased ? 'Página' : 'Capítulo'}</span>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">{currentProgress}</span>
            {total ? <span className="text-slate-400 text-xs font-medium">/ {total}</span> : null}
          </div>
        </div>

        {/* Mini progress bar if total exists */}
        {progressPercent !== null && (
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-3">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Quick Stepper Buttons (-1, +1) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateProgress(item.id, -1)}
            disabled={currentProgress <= 0}
            className="flex-1 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1 transition"
          >
            <Minus size={14} /> -1
          </button>
          <button
            onClick={() => onUpdateProgress(item.id, 1)}
            className="flex-1 py-1.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs transition"
          >
            <Plus size={14} /> +1
          </button>
        </div>
      </div>
    </div>
  );
};
