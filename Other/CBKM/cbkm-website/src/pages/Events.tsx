import React, { useState, useRef } from 'react';
import { Calendar, MapPin, Users, UserPlus, X, ChevronRight, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toSlug } from './EventDetail';
import { useEvents } from '../context/EventsContext';
import { formatEventDate } from '../lib/dateUtils';
import { Event } from '../types';
import { createRegistration } from '../lib/db/registrations';

const Events: React.FC = () => {
  const navigate = useNavigate();
  const { events: allEvents } = useEvents();
  const events = allEvents.filter(e => !e.hidden);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registrationType, setRegistrationType] = useState<'attendee' | 'participant'>('attendee');
  const [viewingPoster, setViewingPoster] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [regError, setRegError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !formRef.current) return;
    setSubmitting(true);
    try {
      const fd = new FormData(formRef.current);
      const g = (k: string) => (fd.get(k) as string) || '';
      await createRegistration({
        eventId: selectedEvent.id,
        type: registrationType,
        name: g('fullName') || g('name'),
        email: g('email'),
        phone: g('phone'),
        address: g('address'),
        numberOfTickets: Number(g('numberOfTickets')) || 0,
        adults: Number(g('adults')) || 0,
        kidsAbove6: Number(g('kidsAbove6')) || 0,
        kidsBelow6: Number(g('kidsBelow6')) || 0,
        numberOfParticipants: Number(g('numberOfParticipants')) || 0,
        category: g('category'),
        performanceDetails: g('performanceDetails'),
        specialRequirements: g('specialRequirements'),
        registrationDate: new Date().toISOString(),
      });
      setSubmitted(true);
      formRef.current.reset();
    } catch {
      setRegError('Failed to submit registration. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="py-24 animate-fade-in" style={{ background: 'linear-gradient(160deg, #111, #1a1a1a)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="section-label">Join Us</span>
          <h1 className="mt-4 text-white font-bold font-serif" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', letterSpacing: '-0.01em' }}>
            Events &amp; <em style={{ color: '#C9A84C', fontStyle: 'italic' }}>Celebrations</em>
          </h1>
          <div className="divider center" style={{ marginTop: '1.5rem' }} />
          <p className="text-lg leading-[1.8]" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Join us for cultural celebrations, festivals, and community gatherings throughout the year
          </p>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-24" style={{ background: 'var(--surface-alt)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {events.map((event) => (
              <div key={event.id} className="rounded-2xl overflow-hidden card-hover"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="h-48 overflow-hidden relative" style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.25), rgba(139,26,26,0.25))' }}>
                  {event.image && !event.image.includes('/api/placeholder') ? (
                    <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
                  ) : null}
                  {event.poster && !event.poster.includes('/api/placeholder') && (
                    <button
                      onClick={() => { setSelectedEvent(event); setViewingPoster(true); }}
                      className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-opacity-80 transition-colors">
                      View Poster
                    </button>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                    <Calendar className="w-4 h-4 mr-1.5 flex-shrink-0" style={{ color: '#C9A84C' }} />
                    {formatEventDate(event.date)}
                  </div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>{event.name}</h3>
                  <div className="flex items-center text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                    <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" style={{ color: '#8B1A1A' }} />
                    {event.location}
                  </div>
                  <p className="mb-5 line-clamp-4 text-sm leading-[1.8]" style={{ color: 'var(--text-muted)' }}>{event.description}</p>
                  <button
                    onClick={() => navigate(`/events/${toSlug(event)}`)}
                    className="btn btn-primary w-full flex items-center justify-center">
                    <ChevronRight className="w-4 h-4 mr-1" />View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {events.length === 0 && (
            <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
              <Calendar className="w-16 h-16 mx-auto mb-4" style={{ color: 'rgba(201,168,76,0.25)' }} />
              <p>No upcoming events. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Poster lightbox */}
      {selectedEvent && viewingPoster && selectedEvent.poster && !selectedEvent.poster.includes('/api/placeholder') && (
        <div className="fixed inset-0 bg-black bg-opacity-85 flex items-center justify-center z-50 p-4" onClick={() => setViewingPoster(false)}>
          <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setViewingPoster(false)} className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors">
              <X className="w-8 h-8" />
            </button>
            <img src={selectedEvent.poster} alt={`${selectedEvent.name} poster`} className="w-full rounded-2xl shadow-2xl" />
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {selectedEvent && !viewingPoster && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}>
            {selectedEvent.image && !selectedEvent.image.includes('/api/placeholder') && (
              <div className="h-48 overflow-hidden rounded-t-2xl relative">
                <img src={selectedEvent.image} alt={selectedEvent.name} className="w-full h-full object-cover" />
                {selectedEvent.poster && !selectedEvent.poster.includes('/api/placeholder') && (
                  <button onClick={() => setViewingPoster(true)}
                    className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-opacity-80 transition-colors">
                    View Poster
                  </button>
                )}
              </div>
            )}

            <div className="p-6">
              {submitted ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(34,197,94,0.1)' }}>
                    <svg className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text)' }}>
                    {registrationType === 'attendee' ? 'Attendee Registration Successful!' : 'Participant Registration Successful!'}
                  </h3>
                  <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Thank you for registering for {selectedEvent.name}.</p>
                  <button onClick={() => { setSelectedEvent(null); setSubmitted(false); }}
                    className="text-sm font-medium hover:underline" style={{ color: '#C9A84C' }}>Close</button>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold font-serif" style={{ color: 'var(--text)', letterSpacing: '-0.01em' }}>
                      Register for {selectedEvent.name}
                    </h2>
                    <button onClick={() => setSelectedEvent(null)} style={{ color: 'var(--text-muted)' }}>
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="rounded-xl p-4 mb-6" style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)' }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 flex-shrink-0" style={{ color: '#C9A84C' }} />
                        <span style={{ color: 'var(--text-muted)' }}>{new Date(selectedEvent.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" style={{ color: '#8B1A1A' }} />
                        <span style={{ color: 'var(--text-muted)' }}>{selectedEvent.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Registration Type</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setRegistrationType('attendee')}
                        className="p-4 rounded-xl border-2 transition-colors"
                        style={{
                          borderColor: registrationType === 'attendee' ? '#C9A84C' : 'var(--border)',
                          background: registrationType === 'attendee' ? 'rgba(201,168,76,0.07)' : 'transparent',
                        }}>
                        <Users className="w-6 h-6 mx-auto mb-2" style={{ color: '#C9A84C' }} />
                        <h3 className="font-semibold" style={{ color: 'var(--text)' }}>Tickets</h3>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Buy tickets to attend</p>
                      </button>
                      <button
                        onClick={() => setRegistrationType('participant')}
                        className="p-4 rounded-xl border-2 transition-colors"
                        style={{
                          borderColor: registrationType === 'participant' ? '#8B1A1A' : 'var(--border)',
                          background: registrationType === 'participant' ? 'rgba(139,26,26,0.07)' : 'transparent',
                        }}>
                        <UserPlus className="w-6 h-6 mx-auto mb-2" style={{ color: '#8B1A1A' }} />
                        <h3 className="font-semibold" style={{ color: 'var(--text)' }}>Register</h3>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Take part in performances</p>
                      </button>
                    </div>
                  </div>

                  <form ref={formRef} onSubmit={handleRegistration} className="space-y-4">
                    {(registrationType === 'attendee'
                      ? selectedEvent.attendeeForm
                      : selectedEvent.participantForm
                    )?.map(field => (
                      <div key={field.id}>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                          {field.label}{field.required && ' *'}
                        </label>
                        {field.type === 'select' ? (
                          <select name={field.name} required={field.required}
                            className="w-full px-3 py-2 border rounded-xl text-sm" style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text)' }}>
                            <option value="">Select {field.label}</option>
                            {(field.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        ) : field.type === 'textarea' ? (
                          <textarea name={field.name} rows={3} required={field.required}
                            className="w-full px-3 py-2 border rounded-xl text-sm" style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
                            placeholder={field.label} />
                        ) : (
                          <input name={field.name} type={field.type === 'phone' ? 'tel' : field.type}
                            required={field.required}
                            min={field.type === 'number' ? '0' : undefined}
                            className="w-full px-3 py-2 border rounded-xl text-sm" style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
                            placeholder={field.label} />
                        )}
                      </div>
                    ))}

                    {regError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-sm">{regError}</div>
                    )}
                    <div className="flex gap-4 pt-2">
                      <button type="submit" disabled={submitting}
                        className="btn btn-primary flex-1 disabled:opacity-60">
                        {submitting ? 'Submitting...' : 'Submit Registration'}
                      </button>
                      <button type="button" onClick={() => setSelectedEvent(null)}
                        className="btn btn-outline flex-1">
                        Cancel
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
