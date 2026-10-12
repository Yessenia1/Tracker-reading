export type ProgressTrackingType = 'chapter' | 'page';

export interface ReadingType {
  id: string;
  slug: string;
  label: string;
  icon: string;
  progressType: ProgressTrackingType; // 'chapter' para manhwas/mangas, 'page' para libros
}

export type ReadingStatus = 'reading' | 'completed' | 'on_hold' | 'plan_to_read';

export interface Item {
  id: string;
  title: string;
  typeSlug: string;
  status: ReadingStatus;
  currentSeason?: number;
  currentChapter?: number;
  totalChapters?: number;
  currentPage?: number;
  totalPages?: number;
  coverImage?: string;
  categories: string[];
  rating?: number;
  notes?: string;
  link?: string;
  updatedAt: string;
}
