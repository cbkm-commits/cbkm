import { supabase } from '../supabase';
import { Contact } from '../../types';

const toContact = (r: any): Contact => ({
  id: r.id, name: r.name, email: r.email, phone: r.phone || '',
  message: r.message, contactDate: r.contact_date,
});

export const fetchContacts = async (): Promise<Contact[]> => {
  const { data, error } = await supabase.from('contacts').select('*').order('contact_date', { ascending: false });
  if (error) throw error;
  return (data || []).map(toContact);
};

export const createContact = async (c: Omit<Contact, 'id' | 'contactDate'>): Promise<void> => {
  const { error } = await supabase.from('contacts')
    .insert({ name: c.name, email: c.email, phone: c.phone || '', message: c.message });
  if (error) throw error;
};
