import React from 'react';
import { 
  Sparkles, 
  BookOpen, 
  BookMarked, 
  Zap, 
  Scroll, 
  Palette, 
  FileText, 
  Film, 
  Headphones, 
  Bookmark,
  Compass,
  Layers,
  Flame,
  Star,
  Tv
} from 'lucide-react';

export const ICON_OPTIONS = [
  { name: 'Sparkles', label: 'Destello', component: Sparkles },
  { name: 'BookOpen', label: 'Libro abierto', component: BookOpen },
  { name: 'BookMarked', label: 'Marcador', component: BookMarked },
  { name: 'Zap', label: 'Rayo / Acción', component: Zap },
  { name: 'Scroll', label: 'Pergamino / Novela', component: Scroll },
  { name: 'Layers', label: 'Capas / Manhwa', component: Layers },
  { name: 'Flame', label: 'Fuego', component: Flame },
  { name: 'Star', label: 'Estrella', component: Star },
  { name: 'Compass', label: 'Brújula', component: Compass },
  { name: 'Palette', label: 'Arte / Webtoon', component: Palette },
  { name: 'Tv', label: 'Pantalla', component: Tv },
  { name: 'FileText', label: 'Documento', component: FileText },
  { name: 'Film', label: 'Cine', component: Film },
  { name: 'Headphones', label: 'Audio', component: Headphones },
  { name: 'Bookmark', label: 'Favorito', component: Bookmark },
];

export const TypeIcon: React.FC<{ iconName?: string; size?: number; className?: string }> = ({
  iconName = 'BookOpen',
  size = 16,
  className = '',
}) => {
  const found = ICON_OPTIONS.find((item) => item.name.toLowerCase() === (iconName || '').toLowerCase());
  const Component = found ? found.component : BookOpen;
  return <Component size={size} className={className} />;
};
