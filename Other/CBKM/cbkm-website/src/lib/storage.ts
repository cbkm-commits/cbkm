import { supabase } from './supabase';

export const uploadImage = async (file: File, folder: string): Promise<string> => {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from('media').upload(path, file, { upsert: false });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from('media').getPublicUrl(path);
  return data.publicUrl;
};

export const uploadFile = async (file: File, folder: string): Promise<string> => {
  const ext = file.name.split('.').pop() || 'pdf';
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from('media').upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from('media').getPublicUrl(path);
  return data.publicUrl;
};
