import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { MenuItem } from '../types';
import { api } from '../services/api';

interface FavoritesContextType {
  favorites: MenuItem[];
  favoriteIds: Set<string>;
  loading: boolean;
  isFavorite: (itemId: string) => boolean;
  toggleFavorite: (item: MenuItem) => Promise<{ isFavorite: boolean; success: boolean }>;
  removeFavorite: (itemId: string) => Promise<boolean>;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const TOKEN_KEY = 'quickbite_user_token';

const normalizeItem = (item: any): MenuItem => ({
  id: item.id || item._id || '',
  _id: item._id || item.id || '',
  name: item.name || '',
  price: Number(item.price) || 0,
  rating: Number(item.rating) || 4.5,
  description: item.description || '',
  image: item.image || '',
  category: item.category || 'Special',
  isVeg: item.isVeg,
  customizations: item.customizations || [],
  originalPrice: item.originalPrice,
  discountBadge: item.discountBadge,
});

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<MenuItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const isLoggedIn = () => {
    const t = localStorage.getItem(TOKEN_KEY);
    return !!(t && t !== 'undefined' && t !== 'null');
  };

  const fetchFavorites = useCallback(async () => {
    if (!isLoggedIn()) {
      setFavorites([]);
      setFavoriteIds(new Set());
      return;
    }
    setLoading(true);
    try {
      const data = await api.favorites.getAll();
      const list: MenuItem[] = (Array.isArray(data) ? data : []).map(normalizeItem);
      setFavorites(list);
      setFavoriteIds(new Set(list.map(i => i.id)));
    } catch { /* noop */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
    // Re-fetch when token changes
    const handler = () => fetchFavorites();
    window.addEventListener('quickbite_auth_change', handler);
    return () => window.removeEventListener('quickbite_auth_change', handler);
  }, [fetchFavorites]);

  const isFavorite = useCallback((itemId: string) => favoriteIds.has(itemId), [favoriteIds]);

  const toggleFavorite = useCallback(async (item: MenuItem): Promise<{ isFavorite: boolean; success: boolean }> => {
    const itemId = item.id || item._id;
    if (!itemId) return { isFavorite: false, success: false };

    const currentlyFav = favoriteIds.has(itemId);
    const nextFav = !currentlyFav;

    // Optimistic update
    setFavoriteIds(prev => { const n = new Set(prev); nextFav ? n.add(itemId) : n.delete(itemId); return n; });
    setFavorites(prev => {
      if (nextFav) {
        return prev.some(i => i.id === itemId) ? prev : [normalizeItem(item), ...prev];
      }
      return prev.filter(i => i.id !== itemId);
    });

    try {
      const res = await api.favorites.toggle(itemId);
      return { isFavorite: res.isFavorite ?? nextFav, success: true };
    } catch {
      // Rollback
      setFavoriteIds(prev => { const n = new Set(prev); currentlyFav ? n.add(itemId) : n.delete(itemId); return n; });
      setFavorites(prev => {
        if (currentlyFav) return prev.some(i => i.id === itemId) ? prev : [normalizeItem(item), ...prev];
        return prev.filter(i => i.id !== itemId);
      });
      return { isFavorite: currentlyFav, success: false };
    }
  }, [favoriteIds]);

  const removeFavorite = useCallback(async (itemId: string): Promise<boolean> => {
    setFavoriteIds(prev => { const n = new Set(prev); n.delete(itemId); return n; });
    setFavorites(prev => prev.filter(i => i.id !== itemId));
    const res = await api.favorites.remove(itemId);
    return !!res?.success;
  }, []);

  return (
    <FavoritesContext.Provider value={{ favorites, favoriteIds, loading, isFavorite, toggleFavorite, removeFavorite, refreshFavorites: fetchFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be inside FavoritesProvider');
  return ctx;
};
