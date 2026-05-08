import React, { createContext, useContext, useState, useEffect } from 'react';
import { Event } from '../types';
import { fetchEvents, createEvent, updateEvent, deleteEvent } from '../lib/db/events';

interface EventsContextType {
  events: Event[];
  loading: boolean;
  addEvent: (e: Omit<Event, 'id'>) => Promise<Event>;
  editEvent: (id: string, e: Partial<Event>) => Promise<void>;
  removeEvent: (id: string) => Promise<void>;
}

const EventsContext = createContext<EventsContextType>({
  events: [], loading: true,
  addEvent: async () => ({ id: '', name: '', image: '', description: '', poster: '', date: '', location: '' }),
  editEvent: async () => {}, removeEvent: async () => {},
});

export const EventsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents().then(data => { setEvents(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const addEvent = async (e: Omit<Event, 'id'>) => {
    const created = await createEvent(e);
    setEvents(prev => [...prev, created]);
    return created;
  };

  const editEvent = async (id: string, e: Partial<Event>) => {
    await updateEvent(id, e);
    setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, ...e } : ev));
  };

  const removeEvent = async (id: string) => {
    await deleteEvent(id);
    setEvents(prev => prev.filter(ev => ev.id !== id));
  };

  return (
    <EventsContext.Provider value={{ events, loading, addEvent, editEvent, removeEvent }}>
      {children}
    </EventsContext.Provider>
  );
};

export const useEvents = () => useContext(EventsContext);
