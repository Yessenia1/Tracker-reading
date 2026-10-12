export interface CoverSearchResult {
  title: string;
  coverUrl: string;
  source: string;
  totalChapters?: number;
  author?: string;
}

export async function searchCoverOnline(title: string, typeSlug: string): Promise<CoverSearchResult[]> {
  const cleanTitle = title.trim();
  if (!cleanTitle) return [];

  const results: CoverSearchResult[] = [];

  // Si es manga, manhwa o comic: consultar Jikan (MyAnimeList API pública gratuita sin auth)
  if (['manhwa', 'manga', 'comic'].includes(typeSlug)) {
    try {
      const res = await fetch(`https://api.jikan.moe/v4/manga?q=${encodeURIComponent(cleanTitle)}&limit=4`);
      if (res.ok) {
        const data = await res.json();
        if (data.data && Array.isArray(data.data)) {
          for (const item of data.data) {
            const img = item.images?.jpg?.large_image_url || item.images?.jpg?.image_url;
            if (img) {
              results.push({
                title: item.title,
                coverUrl: img,
                source: 'MyAnimeList',
                totalChapters: item.chapters || undefined,
              });
            }
          }
        }
      }
    } catch (e) {
      console.warn('Error buscando en Jikan:', e);
    }
  }

  // Si es libro o novela, o como respaldo para cualquier título: consultar Open Library API gratuita
  try {
    const res = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(cleanTitle)}&limit=4`);
    if (res.ok) {
      const data = await res.json();
      if (data.docs && Array.isArray(data.docs)) {
        for (const doc of data.docs) {
          if (doc.cover_i) {
            results.push({
              title: doc.title,
              coverUrl: `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`,
              source: 'Open Library',
              author: doc.author_name?.[0],
            });
          }
        }
      }
    }
  } catch (e) {
    console.warn('Error buscando en Open Library:', e);
  }

  return results;
}
