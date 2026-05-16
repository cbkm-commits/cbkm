import { supabase } from '../supabase';

const ALPHA_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const NUMERIC_CHARS = '0123456789';

function randomCode(len = 6, type: 'numeric' | 'alphanumeric' = 'numeric'): string {
  const chars = type === 'numeric' ? NUMERIC_CHARS : ALPHA_CHARS;
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => chars[b % chars.length]).join('');
}

export const generateEventCodes = async (eventId: string, count: number, type: 'numeric' | 'alphanumeric' = 'numeric'): Promise<void> => {
  const rows = Array.from({ length: count }, () => ({ event_id: eventId, code: randomCode(6, type) }));
  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await supabase
      .from('event_codes')
      .upsert(rows.slice(i, i + 500), { onConflict: 'event_id,code', ignoreDuplicates: true });
    if (error) throw error;
  }
};

export const fetchEventCodesCount = async (eventId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('event_codes')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId);
  if (error) throw error;
  return count || 0;
};

export const fetchEventCodesAll = async (eventId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('event_codes')
    .select('code')
    .eq('event_id', eventId)
    .order('created_at');
  if (error) throw error;
  return (data || []).map((r: any) => r.code);
};

export const validateEventCode = async (eventId: string, code: string): Promise<boolean> => {
  const { data } = await supabase
    .from('event_codes')
    .select('id')
    .eq('event_id', eventId)
    .eq('code', code.trim().toUpperCase())
    .maybeSingle();
  return !!data;
};

export const deleteEventCodes = async (eventId: string): Promise<void> => {
  const { error } = await supabase.from('event_codes').delete().eq('event_id', eventId);
  if (error) throw error;
};
