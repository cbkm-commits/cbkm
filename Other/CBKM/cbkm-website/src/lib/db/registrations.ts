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
});

export const fetchRegistrations = async (): Promise<Registration[]> => {
  const { data, error } = await supabase.from('registrations').select('*').order('registration_date', { ascending: false });
  if (error) throw error;
  return (data || []).map(toReg);
};

export const deleteRegistration = async (id: string): Promise<void> => {
  const { error } = await supabase.from('registrations').delete().eq('id', id);
  if (error) throw error;
};

export const updateRegistration = async (id: string, updates: Partial<Registration>): Promise<Registration> => {
  const { data, error } = await supabase.from('registrations').update({
    name: updates.name, email: updates.email, phone: updates.phone, address: updates.address,
    number_of_tickets: updates.numberOfTickets, adults: updates.adults,
    kids_above_6: updates.kidsAbove6, kids_below_6: updates.kidsBelow6,
    number_of_participants: updates.numberOfParticipants, category: updates.category,
    performance_details: updates.performanceDetails, special_requirements: updates.specialRequirements,
    custom_fields: updates.customFields,
  }).eq('id', id).select().single();
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
