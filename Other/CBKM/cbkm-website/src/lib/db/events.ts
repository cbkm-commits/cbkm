import { supabase } from '../supabase';
import { Event } from '../../types';

const toEvent = (r: any): Event => ({
  id: r.id, name: r.name, description: r.description,
  date: r.date, location: r.location, image: r.image, poster: r.poster,
  guidelinesUrl: r.guidelines_url || '',
  attendeeForm: r.attendee_form || [], participantForm: r.participant_form || [],
  hidden: r.hidden ?? false,
  attendeeFormPaused: r.attendee_form_paused ?? false,
  participantFormPaused: r.participant_form_paused ?? false,
  votingEnabled: r.voting_enabled ?? false,
  votingType: r.voting_type ?? 'choice',
  votingCode: r.voting_code ?? '',
  resultsPublic: r.results_public ?? false,
  adultTicketPrice: r.adult_ticket_price ?? 0,
  kidsAbove6TicketPrice: r.kids_above6_ticket_price ?? 0,
  votingDisplayFields: r.voting_display_fields ?? { name: true, number: true, groupCategory: true, performanceCategory: true },
});

const toDb = (e: Omit<Event, 'id'>) => ({
  name: e.name, description: e.description || '', date: e.date,
  location: e.location || '', image: e.image || '', poster: e.poster || '',
  guidelines_url: e.guidelinesUrl || '',
  attendee_form: e.attendeeForm || [], participant_form: e.participantForm || [],
  hidden: e.hidden ?? false,
  attendee_form_paused: e.attendeeFormPaused ?? false,
  participant_form_paused: e.participantFormPaused ?? false,
  voting_enabled: e.votingEnabled ?? false,
  voting_type: e.votingType ?? 'choice',
  voting_code: e.votingCode ?? '',
  results_public: e.resultsPublic ?? false,
  adult_ticket_price: e.adultTicketPrice ?? 0,
  kids_above6_ticket_price: e.kidsAbove6TicketPrice ?? 0,
  voting_display_fields: e.votingDisplayFields ?? { name: true, number: true, groupCategory: true, performanceCategory: true },
});

export const fetchEvents = async (): Promise<Event[]> => {
  const { data, error } = await supabase.from('events').select('*').order('date');
  if (error) throw error;
  return (data || []).map(toEvent);
};

export const createEvent = async (e: Omit<Event, 'id'>): Promise<Event> => {
  const { data, error } = await supabase.from('events').insert(toDb(e)).select().single();
  if (error) throw error;
  return toEvent(data);
};

export const updateEvent = async (id: string, e: Partial<Event>): Promise<void> => {
  const updates: any = {};
  if (e.name !== undefined) updates.name = e.name;
  if (e.description !== undefined) updates.description = e.description;
  if (e.date !== undefined) updates.date = e.date;
  if (e.location !== undefined) updates.location = e.location;
  if (e.image !== undefined) updates.image = e.image;
  if (e.poster !== undefined) updates.poster = e.poster;
  if (e.guidelinesUrl !== undefined) updates.guidelines_url = e.guidelinesUrl;
  if (e.attendeeForm !== undefined) updates.attendee_form = e.attendeeForm;
  if (e.participantForm !== undefined) updates.participant_form = e.participantForm;
  if (e.hidden !== undefined) updates.hidden = e.hidden;
  if (e.attendeeFormPaused !== undefined) updates.attendee_form_paused = e.attendeeFormPaused;
  if (e.participantFormPaused !== undefined) updates.participant_form_paused = e.participantFormPaused;
  if (e.votingEnabled !== undefined) updates.voting_enabled = e.votingEnabled;
  if (e.votingType !== undefined) updates.voting_type = e.votingType;
  if (e.votingCode !== undefined) updates.voting_code = e.votingCode;
  if (e.resultsPublic !== undefined) updates.results_public = e.resultsPublic;
  if (e.adultTicketPrice !== undefined) updates.adult_ticket_price = e.adultTicketPrice;
  if (e.kidsAbove6TicketPrice !== undefined) updates.kids_above6_ticket_price = e.kidsAbove6TicketPrice;
  if (e.votingDisplayFields !== undefined) updates.voting_display_fields = e.votingDisplayFields;
  const { error } = await supabase.from('events').update(updates).eq('id', id);
  if (error) throw error;
};

export const deleteEvent = async (id: string): Promise<void> => {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
};
