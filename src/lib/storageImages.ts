import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export const IMAGE_BUCKET = 'product-images';
export const IMAGE_FOLDERS = ['boys', 'girls', 'kids', 'thermal', 'banners'] as const;
export type ImageFolder = (typeof IMAGE_FOLDERS)[number];

const imageExt = /\.(avif|gif|jpe?g|png|webp)$/i;

export async function listFolderImages(folder: ImageFolder | string) {
  const { data, error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .list(folder, { limit: 100, sortBy: { column: 'name', order: 'asc' } });

  if (error || !data) return [];

  return data
    .filter(file => file.name && imageExt.test(file.name))
    .map(file => {
      const path = `${folder}/${file.name}`;
      const { data: url } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
      return url.publicUrl;
    });
}

export function useStorageImages(folder: ImageFolder | string, fallback: string[] = []) {
  const [images, setImages] = useState<string[]>(fallback);

  useEffect(() => {
    let alive = true;
    listFolderImages(folder).then(urls => {
      if (alive) setImages(urls.length ? urls : fallback);
    });
    return () => { alive = false; };
  }, [folder]);

  return images;
}
