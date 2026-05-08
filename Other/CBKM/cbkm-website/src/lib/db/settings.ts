import { supabase } from '../supabase';

export const getSetting = async (key: string): Promise<string | null> => {
  const { data } = await supabase.from('site_settings').select('value').eq('key', key).single();
  return data?.value ?? null;
};

export const setSetting = async (key: string, value: string): Promise<void> => {
  const { error } = await supabase.from('site_settings').upsert({ key, value });
  if (error) throw error;
};

export const getSettings = async (keys: string[]): Promise<Record<string, string>> => {
  const { data } = await supabase.from('site_settings').select('key,value').in('key', keys);
  const result: Record<string, string> = {};
  (data || []).forEach(r => { result[r.key] = r.value; });
  return result;
};
