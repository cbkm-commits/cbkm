import { supabase } from '../supabase';
import { Registration } from '../../types';

const toReg = (r: any): Registration => ({
  id: r.id, eventId: r.event_id, type: r.type,
  name: r.name, email: r.email, phone: r.phone, address: r.address,
  registrationDate: r.registration_date,
  numberOfTickets: r.number_of_tickets, adults: r.adults,
  kidsAbove6: r.kids_above_6, kidsBelow6: r.kids_below_6,
  numberOfParticipants: r.number_of_participants, category: r.category,
  performanceDetails: r.performance_details, specialRequirements: r.special_requirements,
  customFields: r.custom_fields || {},
  deletedAt: r.deleted_at ?? null,
  performanceFinalized: r.performance_finalized ?? false,
  participantNumber: r.participant_number ?? '',
  votingEnabled: r.voting_enabled ?? false,
  emailStatus: r.email_status ?? 'not_sent',
  sortOrder: r.sort_order ?? undefined,
});

export const fetchRegistrations = async (): Promise<Registration[]> => {
  const { data, error } = await supabase.from('registrations').select('*').is('deleted_at', null).order('registration_date', { ascending: false });
  if (error) throw error;
  return (data || []).map(toReg);
};

export const fetchVotingParticipants = async (eventId: string): Promise<Registration[]> => {
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .eq('event_id', eventId)
    .eq('type', 'participant')
    .eq('voting_enabled', true)
    .eq('performance_finalized', true)
    .is('deleted_at', null);
  if (error) throw error;
  return (data || []).map(toReg);
};

export const deleteRegistration = async (id: string): Promise<void> => {
  const { error } = await supabase.from('registrations').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
};

export const updateRegistration = async (id: string, updates: Partial<Registration>): Promise<Registration> => {
  const patch: any = {};
  if (updates.type !== undefined) patch.type = updates.type;
  if (updates.name !== undefined) patch.name = updates.name;
  if (updates.email !== undefined) patch.email = updates.email;
  if (updates.phone !== undefined) patch.phone = updates.phone;
  if (updates.address !== undefined) patch.address = updates.address;
  if (updates.numberOfTickets !== undefined) patch.number_of_tickets = updates.numberOfTickets;
  if (updates.adults !== undefined) patch.adults = updates.adults;
  if (updates.kidsAbove6 !== undefined) patch.kids_above_6 = updates.kidsAbove6;
  if (updates.kidsBelow6 !== undefined) patch.kids_below_6 = updates.kidsBelow6;
  if (updates.numberOfParticipants !== undefined) patch.number_of_participants = updates.numberOfParticipants;
  if (updates.category !== undefined) patch.category = updates.category;
  if (updates.performanceDetails !== undefined) patch.performance_details = updates.performanceDetails;
  if (updates.specialRequirements !== undefined) patch.special_requirements = updates.specialRequirements;
  if (updates.customFields !== undefined) patch.custom_fields = updates.customFields;
  if (updates.performanceFinalized !== undefined) patch.performance_finalized = updates.performanceFinalized;
  if (updates.participantNumber !== undefined) patch.participant_number = updates.participantNumber;
  if (updates.votingEnabled !== undefined) patch.voting_enabled = updates.votingEnabled;
  if (updates.emailStatus !== undefined) patch.email_status = updates.emailStatus;
  if (updates.sortOrder !== undefined) patch.sort_order = updates.sortOrder;
  const { data, error } = await supabase.from('registrations').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return toReg(data);
};

export const createRegistration = async (reg: Omit<Registration, 'id'>): Promise<Registration> => {
  const { data, error } = await supabase.from('registrations').insert({
    event_id: reg.eventId, type: reg.type,
    name: reg.name, email: reg.email, phone: reg.phone || '', address: reg.address || '',
    number_of_tickets: reg.numberOfTickets || 0, adults: reg.adults || 0,
    kids_above_6: reg.kidsAbove6 || 0, kids_below_6: reg.kidsBelow6 || 0,
    number_of_participants: reg.numberOfParticipants || 0, category: reg.category || '',
    performance_details: reg.performanceDetails || '', special_requirements: reg.specialRequirements || '',
    custom_fields: reg.customFields || {},
  }).select().single();
  if (error) throw error;
  return toReg(data);
};
