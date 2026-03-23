import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Users, UserPlus } from 'lucide-react';
import { mockEvents } from '../data/mockData';

const Events: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [registrationType, setRegistrationType] = useState<'attendee' | 'participant'>('attendee');

  const selectedEventData = mockEvents.find(event => event.id === selectedEvent);

  const handleRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle registration logic here
    alert('Registration submitted successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Upcoming Events
          </h1>
          <p className="text-xl text-gray-600">
            Join us for our cultural celebrations and community gatherings
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {mockEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="h-48 bg-gradient-to-r from-primary-400 to-primary-600"></div>
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(event.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.name}</h3>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  {event.location}
                </div>
                <p className="text-gray-600 mb-4">{event.description}</p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedEvent(event.id)}
                    className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Register
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Registration Modal */}
        {selectedEvent && selectedEventData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Register for {selectedEventData.name}
                  </h2>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                {/* Event Details */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-primary-600" />
                      <span>{new Date(selectedEventData.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-primary-600" />
                      <span>{selectedEventData.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-primary-600" />
                      <span>Limited spots available</span>
                    </div>
                  </div>
                </div>

                {/* Registration Type Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setRegistrationType('attendee')}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        registrationType === 'attendee'
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Users className="w-6 h-6 mx-auto mb-2 text-primary-600" />
                      <h3 className="font-semibold">Attend Event</h3>
                      <p className="text-sm text-gray-600">Join us as an attendee</p>
                    </button>
                    <button
                      onClick={() => setRegistrationType('participant')}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        registrationType === 'participant'
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <UserPlus className="w-6 h-6 mx-auto mb-2 text-primary-600" />
                      <h3 className="font-semibold">Participate</h3>
                      <p className="text-sm text-gray-600">Take part in performances</p>
                    </button>
                  </div>
                </div>

                {/* Registration Form */}
                <form onSubmit={handleRegistration} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="(403) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Number of Attendees
                      </label>
                      <input
                        type="number"
                        min="1"
                        defaultValue="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>

                  {registrationType === 'participant' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Performance Details
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Please describe your performance (song, dance, etc.)"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special Requirements or Dietary Restrictions
                    </label>
                    <textarea
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Any special accommodations or dietary needs"
                    />
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                    >
                      Submit Registration
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedEvent(null)}
                      className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
