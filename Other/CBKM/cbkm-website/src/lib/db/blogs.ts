import { supabase } from '../supabase';
import { Blog } from '../../types';

const toBlog = (r: any): Blog => ({
  id: r.id, title: r.title, description: r.description || '',
  image: r.image || '', author: r.author || '',
  publishDate: r.publish_date,
});

export const fetchBlogs = async (): Promise<Blog[]> => {
  const { data, error } = await supabase.from('blogs').select('*').order('publish_date', { ascending: false });
  if (error) throw error;
  return (data || []).map(toBlog);
};

export const createBlog = async (b: Omit<Blog, 'id'>): Promise<Blog> => {
  const { data, error } = await supabase.from('blogs').insert({
    title: b.title, description: b.description, image: b.image || '',
    author: b.author || '', publish_date: b.publishDate || new Date().toISOString(),
  }).select().single();
  if (error) throw error;
  return toBlog(data);
};

export const updateBlog = async (id: string, b: Partial<Blog>): Promise<void> => {
  const updates: any = {};
  if (b.title !== undefined) updates.title = b.title;
  if (b.description !== undefined) updates.description = b.description;
  if (b.image !== undefined) updates.image = b.image;
  if (b.author !== undefined) updates.author = b.author;
  if (b.publishDate !== undefined) updates.publish_date = b.publishDate;
  const { error } = await supabase.from('blogs').update(updates).eq('id', id);
  if (error) throw error;
};

export const deleteBlog = async (id: string): Promise<void> => {
  const { error } = await supabase.from('blogs').delete().eq('id', id);
  if (error) throw error;
};
