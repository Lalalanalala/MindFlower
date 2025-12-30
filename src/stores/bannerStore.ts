import { create } from 'zustand';
import { storage } from '../utils/storage';

interface BannerStore {
  bannerImage: string | null;
  setBannerImage: (image: string | null) => void;
  loadBanner: () => void;
}

export const useBannerStore = create<BannerStore>((set) => ({
  bannerImage: null,

  setBannerImage: (image) => {
    set({ bannerImage: image });
    if (image) {
      storage.set('bannerImage', image);
    } else {
      const data = localStorage.getItem('mindflower_data');
      if (data) {
        const parsed = JSON.parse(data);
        delete parsed.bannerImage;
        localStorage.setItem('mindflower_data', JSON.stringify(parsed));
      }
    }
  },

  loadBanner: () => {
    const image = storage.get<string | null>('bannerImage', null);
    set({ bannerImage: image });
  },
}));
