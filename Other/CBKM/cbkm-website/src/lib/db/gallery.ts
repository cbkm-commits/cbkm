import { supabase } from '../supabase';
import { GalleryImage } from '../../types';

const toImg = (r: any): GalleryImage => ({
  id: r.id, url: r.url, title: r.title || '', description: r.description || '',
  uploadDate: r.upload_date,
});

export const fetchGallery = async (): Promise<GalleryImage[]> => {
  const { data, error } = await supabase.from('gallery').select('*').order('upload_date', { ascending: false });
  if (error) throw error;
  return (data || []).map(toImg);
};

export const createGalleryImage = async (img: Omit<GalleryImage, 'id' | 'uploadDate'>): Promise<GalleryImage> => {
  const { data, error } = await supabase.from('gallery')
    .insert({ url: img.url, title: img.title || '', description: img.description || '' })
    .select().single();
  if (error) throw error;
  return toImg(data);
};

export const deleteGalleryImage = async (id: string): Promise<void> => {
  const { error } = await supabase.from('gallery').delete().eq('id', id);
  if (error) throw error;
};
