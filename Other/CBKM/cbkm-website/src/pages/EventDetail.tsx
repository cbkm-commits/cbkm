import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, UserPlus, ArrowLeft, X, FileText, Download } from 'lucide-react';
import { useEvents } from '../context/EventsContext';
import { createRegistration } from '../lib/db/registrations';
import { Event } from '../types';

export const toSlug = (event: Event) =>
  event.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') +
  '-' + new Date(event.date).getFullYear();

const EventDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { events } = useEvents();
  const event = events.find(e => toSlug(e) === slug);

  const [registrationType, setRegistrationType] = useState<'attendee' | 'participant'>('attendee');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [regError, setRegError] = useState('');
  const [viewingPoster, setViewingPoster] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Event not found.</p>
          <button onClick={() => navigate('/events')}
            className="text-primary-600 hover:underline flex items-center mx-auto">
            <ArrowLeft className="w-4 h-4 mr-1" />Back to Events
          </button>
        </div>
      </div>
    );
  }

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;
    setSubmitting(true);
    try {
      const fd = new FormData(formRef.current);
      const g = (k: string) => (fd.get(k) as string) || '';

      // Find fields by type so it works regardless of what the admin named them
      const emailField = currentFields?.find(f => f.type === 'email');
      const phoneField = currentFields?.find(f => f.type === 'phone');
      const nameField = currentFields?.find(f =>
        ['fullName', 'name'].includes(f.name) || f.label.toLowerCase().includes('name')
      );

      const name = nameField ? g(nameField.name) : (g('fullName') || g('name'));
      const email = emailField ? g(emailField.name) : g('email');
      const phone = phoneField ? g(phoneField.name) : g('phone');

      // Collect all non-standard fields as custom fields
      const standardNames = new Set([
        'fullName', 'name', 'email', 'phone', 'address',
        'numberOfTickets', 'adults', 'kidsAbove6', 'kidsBelow6',
        'numberOfParticipants', 'category', 'performanceDetails', 'specialRequirements',
      ]);
      const customFields: Record<string, string> = {};
      for (const field of (currentFields || [])) {
        if (!standardNames.has(field.name)) {
          const val = g(field.name);
          if (val) customFields[field.name] = val;
        }
      }

      await createRegistration({
        eventId: event.id,
        type: registrationType,
        name,
        email,
        phone,
        address: g('address'),
        numberOfTickets: Number(g('numberOfTickets')) || 0,
        adults: Number(g('adults')) || 0,
        kidsAbove6: Number(g('kidsAbove6')) || 0,
        kidsBelow6: Number(g('kidsBelow6')) || 0,
        numberOfParticipants: Number(g('numberOfParticipants')) || 0,
        category: g('category'),
        performanceDetails: g('performanceDetails'),
        specialRequirements: g('specialRequirements'),
        customFields,
        registrationDate: new Date().toISOString(),
      });
      // Send confirmation email — non-blocking
      fetch('/api/send-registration-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: registrationType,
          name,
          email,
          phone,
          eventName: event.name,
          eventDate: event.date,
          eventLocation: event.location,
          numberOfTickets: Number(g('numberOfTickets')) || 0,
          adults: Number(g('adults')) || 0,
          kidsAbove6: Number(g('kidsAbove6')) || 0,
          kidsBelow6: Number(g('kidsBelow6')) || 0,
          numberOfParticipants: Number(g('numberOfParticipants')) || 0,
          category: g('category'),
          performanceDetails: g('performanceDetails'),
          guidelinesUrl: event.guidelinesUrl || '',
        }),
      }).catch(() => {});
      setSubmitted(true);
      formRef.current.reset();
    } catch {
      setRegError('Failed to submit registration. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentFields = registrationType === 'attendee' ? event.attendeeForm : event.participantForm;
  const hasPoster = event.poster && !event.poster.includes('/api/placeholder');
  const hasImage = event.image && !event.image.includes('/api/placeholder');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero banner */}
      <div className="relative h-56 md:h-72 bg-gradient-to-r from-primary-700 to-primary-900 overflow-hidden">
        {hasImage && (
          <img src={event.image} alt={event.name} className="absolute inset-0 w-full h-full object-cover opacity-40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end px-6 md:px-10 pb-6 max-w-6xl mx-auto w-full">
          <button onClick={() => navigate('/events')}
            className="flex items-center text-white/70 hover:text-white text-sm mb-3 w-fit transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />Back to Events
          </button>
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{event.name}</h1>
          <div className="flex flex-wrap gap-4 text-white/80 text-sm">
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1.5" />
              {new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            {event.location && (
              <span className="flex items-center"><MapPin className="w-4 h-4 mr-1.5" />{event.location}</span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Top: Poster + Register side by side ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Poster */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {hasPoster ? (
              <div className="relative group cursor-pointer" onClick={() => setViewingPoster(true)}>
                <img src={event.poster} alt={`${event.name} poster`}
                  className="w-full h-full max-h-[520px] object-contain bg-gray-50" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 bg-black/60 text-white text-sm px-4 py-2 rounded-lg transition-opacity">
                    Click to enlarge
                  </span>
                </div>
              </div>
            ) : hasImage ? (
              <img src={event.image} alt={event.name}
                className="w-full max-h-[520px] object-cover" />
            ) : (
              <div className="h-64 flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
                <Calendar className="w-16 h-16 text-primary-400" />
              </div>
            )}
          </div>

          {/* Registration Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col">
            {submitted ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {registrationType === 'attendee' ? 'Ticket Registration Submitted!' : 'Participant Registration Submitted!'}
                </h3>
                <p className="text-sm text-gray-500 mb-5">Thank you for registering. We'll be in touch soon.</p>
                <button onClick={() => setSubmitted(false)}
                  className="text-primary-600 hover:underline text-sm font-medium">
                  Register another person
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Register for this Event</h2>

                {/* Type selector */}
                <div className="grid grid-cols-2 gap-2 mb-5">
                  <button onClick={() => setRegistrationType('attendee')}
                    className={`flex flex-col items-center p-3 rounded-xl border-2 text-sm font-medium transition-all ${registrationType === 'attendee' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    <Users className="w-5 h-5 mb-1" />Tickets
                  </button>
                  <button onClick={() => setRegistrationType('participant')}
                    className={`flex flex-col items-center p-3 rounded-xl border-2 text-sm font-medium transition-all ${registrationType === 'participant' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    <UserPlus className="w-5 h-5 mb-1" />Register
                  </button>
                </div>

                <form ref={formRef} onSubmit={handleRegistration} className="space-y-3 flex-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentFields?.map(field => (
                      <div key={field.id} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
                        </label>
                        {field.type === 'select' ? (
                          <select name={field.name} required={field.required}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm">
                            <option value="">Select…</option>
                            {(field.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        ) : field.type === 'textarea' ? (
                          <textarea name={field.name} rows={2} required={field.required}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm resize-none"
                            placeholder={field.label} />
                        ) : (
                          <input name={field.name} type={field.type === 'phone' ? 'tel' : field.type}
                            required={field.required}
                            min={field.type === 'number' ? '0' : undefined}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                            placeholder={field.label} />
                        )}
                      </div>
                    ))}
                  </div>
                  {regError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-sm sm:col-span-2">{regError}</div>
                  )}
                  <button type="submit" disabled={submitting}
                    className="w-full bg-primary-600 text-white px-4 py-3 rounded-xl hover:bg-primary-700 transition-colors font-semibold text-sm disabled:opacity-60 mt-1 sm:col-span-2">
                    {submitting ? 'Submitting…' : 'Submit Registration'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        {/* ── Bottom: Description + Guidelines ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {event.description && (
            <div className={`bg-white rounded-2xl shadow-sm p-6 ${event.guidelinesUrl ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">About This Event</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{event.description}</p>
            </div>
          )}
          {event.guidelinesUrl && (
            <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col">
              <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary-600" />Event Guidelines
              </h2>
              <p className="text-sm text-gray-500 mb-4 flex-1">
                Download the event guidelines PDF for important information about participation, rules, and schedules.
              </p>
              <a href={event.guidelinesUrl} target="_blank" rel="noreferrer"
                className="inline-flex items-center justify-center bg-primary-600 text-white px-4 py-2.5 rounded-xl hover:bg-primary-700 transition-colors text-sm font-semibold">
                <Download className="w-4 h-4 mr-2" />Download Guidelines PDF
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Poster lightbox */}
      {viewingPoster && hasPoster && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4"
          onClick={() => setViewingPoster(false)}>
          <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setViewingPoster(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300">
              <X className="w-8 h-8" />
            </button>
            <img src={event.poster} alt={`${event.name} poster`} className="w-full rounded-xl shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetail;
