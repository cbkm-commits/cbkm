import { supabase } from '../supabase';
import { Sponsor, SponsorshipPackage } from '../../types';

// ── Sponsors ─────────────────────────────────────────────────────────────────
const toSponsor = (r: any): Sponsor => ({
  id: r.id, name: r.name, logo: r.logo || '',
  description: r.description || '', website: r.website || '', level: r.level,
});

export const fetchSponsors = async (): Promise<Sponsor[]> => {
  const { data, error } = await supabase.from('sponsors').select('*').order('created_at');
  if (error) throw error;
  return (data || []).map(toSponsor);
};

export const createSponsor = async (s: Omit<Sponsor, 'id'>): Promise<Sponsor> => {
  const { data, error } = await supabase.from('sponsors')
    .insert({ name: s.name, logo: s.logo || '', description: s.description || '', website: s.website || '', level: s.level })
    .select().single();
  if (error) throw error;
  return toSponsor(data);
};

export const updateSponsor = async (id: string, s: Partial<Sponsor>): Promise<void> => {
  const { error } = await supabase.from('sponsors').update(s).eq('id', id);
  if (error) throw error;
};

export const deleteSponsor = async (id: string): Promise<void> => {
  const { error } = await supabase.from('sponsors').delete().eq('id', id);
  if (error) throw error;
};

// ── Packages ─────────────────────────────────────────────────────────────────
const toPkg = (r: any): SponsorshipPackage => ({
  id: r.id, name: r.name, amount: r.amount || '',
  description: r.description || '', logo: r.logo || '',
});

export const fetchPackages = async (): Promise<SponsorshipPackage[]> => {
  const { data, error } = await supabase.from('sponsorship_packages').select('*').order('sort_order');
  if (error) throw error;
  return (data || []).map(toPkg);
};

export const upsertPackage = async (pkg: SponsorshipPackage): Promise<void> => {
  const { error } = await supabase.from('sponsorship_packages')
    .upsert({ id: pkg.id, name: pkg.name, amount: pkg.amount, description: pkg.description, logo: pkg.logo || '' });
  if (error) throw error;
};

export const createPackage = async (pkg: Omit<SponsorshipPackage, 'id'>): Promise<SponsorshipPackage> => {
  const { data, error } = await supabase.from('sponsorship_packages')
    .insert({ name: pkg.name, amount: pkg.amount, description: pkg.description, logo: pkg.logo || '' })
    .select().single();
  if (error) throw error;
  return toPkg(data);
};

export const deletePackage = async (id: string): Promise<void> => {
  const { error } = await supabase.from('sponsorship_packages').delete().eq('id', id);
  if (error) throw error;
};
