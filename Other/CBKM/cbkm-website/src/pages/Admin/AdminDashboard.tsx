import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  Image,
  HandHeart,
  Phone,
  Settings,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Download,
  Eye,
  X,
  Save,
  UserCheck,
  UserPlus,
  Filter,
  Upload,
  FileText,
  Mail,
  Vote
} from 'lucide-react';
import { mockEvents, mockSponsors, mockGallery, mockContacts, mockRegistrations, mockSponsorshipPackages, mockBlogs } from '../../data/mockData';
import { Event, FormField, Registration, SponsorshipPackage, Blog, SiteSettings, SmtpSettings } from '../../types';
import { useSponsorship } from '../../context/SponsorshipContext';
import { VotingControl } from '../../components/VotingControl';
const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { sponsorshipContact, updateSponsorshipContact } = useSponsorship();
  const [activeTab, setActiveTab] = useState('events');
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [localSponsorshipContact, setLocalSponsorshipContact] = useState(sponsorshipContact);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    contactEmail: sponsorshipContact.email,
    contactPhone: sponsorshipContact.phone
  });

  const loadSmtpSettings = (): SmtpSettings => {
    try {
      const saved = localStorage.getItem('cbkm_smtp_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { smtpHost: 'smtp.gmail.com', smtpPort: '587', smtpUsername: '', smtpPassword: '', fromEmail: '', fromName: 'CBKM' };
  };

  const [smtpSettings, setSmtpSettings] = useState<SmtpSettings>(loadSmtpSettings);
  const [smtpSaveStatus, setSmtpSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleSaveSmtp = () => {
    setSmtpSaveStatus('saving');
    try {
      localStorage.setItem('cbkm_smtp_settings', JSON.stringify(smtpSettings));
      setSmtpSaveStatus('saved');
      setTimeout(() => setSmtpSaveStatus('idle'), 2000);
    } catch {
      setSmtpSaveStatus('error');
    }
  };

  // Filter states
  const [attendeeFilters, setAttendeeFilters] = useState({
    year: '',
    eventName: ''
  });
  const [participantFilters, setParticipantFilters] = useState({
    year: '',
    eventName: ''
  });

  const handleLogout = () => {
    navigate('/admin');
  };

  const exportToXLSX = (type: string) => {
    alert(`Exporting ${type} data to XLSX file...`);
  };

  const tabs = [
    { id: 'events', name: 'Events', icon: Calendar },
    { id: 'attendees', name: 'Attendees', icon: Users },
    { id: 'participants', name: 'Participants', icon: UserPlus },
    { id: 'sponsors', name: 'Sponsors', icon: HandHeart },
    { id: 'gallery', name: 'Gallery', icon: Image },
    { id: 'contacts', name: 'Contacts', icon: Phone },
    { id: 'blog', name: 'Blog', icon: FileText },
    { id: 'settings', name: 'Settings', icon: Settings },
    { id: 'voting', name: 'Voting', icon: Vote },
  ];

  const renderEventsTab = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Event Management</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => {
              setEditingEvent(null);
              setShowEventModal(true);
            }}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </button>
        </div>
      </div>

      {/* Event Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockEvents.map((event) => (
          <div key={event.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="h-48 bg-gradient-to-r from-primary-400 to-primary-600"></div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {new Date(event.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-gray-600 text-sm">{event.description}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditingEvent(event);
                    setShowEventModal(true);
                  }}
                  className="flex-1 bg-primary-600 text-white px-3 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button className="flex-1 border border-red-300 text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAttendeesTab = () => {
    const attendeeRegistrations = mockRegistrations.filter(reg => reg.type === 'attendee');
    const filteredAttendees = attendeeRegistrations.filter(reg => {
      const event = mockEvents.find(e => e.id === reg.eventId);
      const matchesYear = !attendeeFilters.year || new Date(reg.registrationDate).getFullYear().toString() === attendeeFilters.year;
      const matchesEvent = !attendeeFilters.eventName || event?.name.toLowerCase().includes(attendeeFilters.eventName.toLowerCase());
      return matchesYear && matchesEvent;
    });

    const years = Array.from(new Set(attendeeRegistrations.map(reg => new Date(reg.registrationDate).getFullYear().toString())));
    const eventNames = Array.from(new Set(attendeeRegistrations.map(reg => {
      const event = mockEvents.find(e => e.id === reg.eventId);
      return event?.name || '';
    })));

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Attendees Management</h2>
          <button
            onClick={() => exportToXLSX('attendees')}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export XLSX
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Year</label>
              <select
                value={attendeeFilters.year}
                onChange={(e) => setAttendeeFilters({...attendeeFilters, year: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Years</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Event</label>
              <select
                value={attendeeFilters.eventName}
                onChange={(e) => setAttendeeFilters({...attendeeFilters, eventName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Events</option>
                {eventNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setAttendeeFilters({ year: '', eventName: '' })}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># Attendees</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># Adults</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># Kids &gt; 6</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># Kids &lt; 6</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAttendees.map((registration) => {
                const event = mockEvents.find(e => e.id === registration.eventId);
                return (
                  <tr key={registration.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(registration.registrationDate).getFullYear()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {event?.name || 'Unknown Event'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {registration.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {registration.numberOfTickets || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {registration.adults || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {registration.kidsAbove6 || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {registration.kidsBelow6 || 0}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderParticipantsTab = () => {
    const participantRegistrations = mockRegistrations.filter(reg => reg.type === 'participant');
    const filteredParticipants = participantRegistrations.filter(reg => {
      const event = mockEvents.find(e => e.id === reg.eventId);
      const matchesYear = !participantFilters.year || new Date(reg.registrationDate).getFullYear().toString() === participantFilters.year;
      const matchesEvent = !participantFilters.eventName || event?.name.toLowerCase().includes(participantFilters.eventName.toLowerCase());
      return matchesYear && matchesEvent;
    });

    const years = Array.from(new Set(participantRegistrations.map(reg => new Date(reg.registrationDate).getFullYear().toString())));
    const eventNames = Array.from(new Set(participantRegistrations.map(reg => {
      const event = mockEvents.find(e => e.id === reg.eventId);
      return event?.name || '';
    })));

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Participants Management</h2>
          <button
            onClick={() => exportToXLSX('participants')}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export XLSX
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Year</label>
              <select
                value={participantFilters.year}
                onChange={(e) => setParticipantFilters({...participantFilters, year: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Years</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Event</label>
              <select
                value={participantFilters.eventName}
                onChange={(e) => setParticipantFilters({...participantFilters, eventName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Events</option>
                {eventNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setParticipantFilters({ year: '', eventName: '' })}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># Participants</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># Adults</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredParticipants.map((registration) => {
                const event = mockEvents.find(e => e.id === registration.eventId);
                return (
                  <tr key={registration.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(registration.registrationDate).getFullYear()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {event?.name || 'Unknown Event'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {registration.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {registration.numberOfParticipants || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {registration.adults || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {registration.category || 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSponsorsTab = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Sponsor Management</h2>
        <button
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Sponsor
        </button>
      </div>

      {/* Contact Information Management */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sponsorship Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={localSponsorshipContact.email}
              onChange={(e) => setLocalSponsorshipContact({...localSponsorshipContact, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={localSponsorshipContact.phone}
              onChange={(e) => setLocalSponsorshipContact({...localSponsorshipContact, phone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
        <button 
          onClick={() => {
            updateSponsorshipContact(localSponsorshipContact);
            alert('Contact information saved successfully!');
          }}
          className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Contact Info
        </button>
      </div>

      {/* Sponsorship Packages */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sponsorship Packages</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockSponsorshipPackages.map((pkg) => (
            <div key={pkg.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                {pkg.logo && (
                  <img src={pkg.logo} alt={pkg.name} className="w-12 h-8 object-contain" />
                )}
                <h4 className="font-semibold text-gray-900">{pkg.name}</h4>
              </div>
              <p className="text-sm text-gray-600 mb-2">{pkg.description}</p>
              <div className="text-lg font-bold text-primary-600">{pkg.amount}</div>
              <div className="flex space-x-2 mt-3">
                <button className="flex-1 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </button>
                <button className="flex-1 border border-red-300 text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm">
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockSponsors.map((sponsor) => (
          <div key={sponsor.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-xs text-gray-500">Logo</span>
              </div>
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                {sponsor.level}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{sponsor.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{sponsor.description}</p>
            <div className="flex space-x-2">
              <button className="text-primary-600 hover:text-primary-900">
                <Edit className="w-4 h-4" />
              </button>
              <button className="text-red-600 hover:text-red-900">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGalleryTab = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gallery Management</h2>
        <button
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Upload Images
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockGallery.map((image) => (
          <div key={image.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="w-full h-32 bg-gray-300 flex items-center justify-center">
              <Image className="w-8 h-8 text-gray-400" />
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-900 text-sm mb-1">{image.title}</h3>
              <p className="text-xs text-gray-500 mb-2">{image.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  {new Date(image.uploadDate).toLocaleDateString()}
                </span>
                <div className="flex space-x-1">
                  <button className="text-primary-600 hover:text-primary-900">
                    <Eye className="w-3 h-3" />
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContactsTab = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Contact Management</h2>
        <button
          onClick={() => exportToXLSX('contacts')}
          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
        >
          <Download className="w-4 h-4 mr-2" />
          Export XLSX
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockContacts.map((contact) => (
              <tr key={contact.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {contact.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {contact.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {contact.phone || 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="max-w-xs truncate">{contact.message}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(contact.contactDate).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBlogTab = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Blog Management</h2>
        <button
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Blog Post
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockBlogs.map((blog) => (
          <div key={blog.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-xl transition-shadow">
            <div className="h-48 bg-gray-300 flex items-center justify-center">
              <Image className="w-8 h-8 text-gray-400" />
            </div>
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2">{blog.title}</h3>
              <div 
                className="text-sm text-gray-600 mb-4 line-clamp-3"
                dangerouslySetInnerHTML={{ __html: blog.description }}
              />
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs text-gray-400">
                  By {blog.author} • {new Date(blog.publishDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex space-x-2">
                <button className="flex-1 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </button>
                <button className="flex-1 border border-red-300 text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm">
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Site Settings</h2>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Site Logo</label>
            <div className="flex items-center space-x-4">
              <img src="/logo.svg?v=2" alt="Current Logo" className="w-16 h-16 border border-gray-300 rounded" />
              <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center">
                <Upload className="w-4 h-4 mr-2" />
                Change Logo
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
              <input
                type="email"
                value={siteSettings.contactEmail}
                onChange={(e) => setSiteSettings({...siteSettings, contactEmail: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                value={siteSettings.contactPhone}
                onChange={(e) => setSiteSettings({...siteSettings, contactPhone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>
        
        <button
          onClick={() => {
            alert('Settings saved successfully!');
          }}
          className="mt-6 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </button>
      </div>

      {/* Email Configuration */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center mb-1">
          <Mail className="w-5 h-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Email Configuration</h3>
        </div>
        <p className="text-sm text-gray-500 mb-5">SMTP server used to send registration confirmation emails.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
            <input
              type="text"
              value={smtpSettings.smtpHost}
              onChange={(e) => setSmtpSettings({ ...smtpSettings, smtpHost: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="smtp.gmail.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
            <input
              type="text"
              value={smtpSettings.smtpPort}
              onChange={(e) => setSmtpSettings({ ...smtpSettings, smtpPort: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="587"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Username</label>
            <input
              type="text"
              value={smtpSettings.smtpUsername}
              onChange={(e) => setSmtpSettings({ ...smtpSettings, smtpUsername: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="you@gmail.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Password</label>
            <input
              type="password"
              value={smtpSettings.smtpPassword}
              onChange={(e) => setSmtpSettings({ ...smtpSettings, smtpPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="App password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Email</label>
            <input
              type="email"
              value={smtpSettings.fromEmail}
              onChange={(e) => setSmtpSettings({ ...smtpSettings, fromEmail: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="noreply@cbkm.ca"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Name</label>
            <input
              type="text"
              value={smtpSettings.fromName}
              onChange={(e) => setSmtpSettings({ ...smtpSettings, fromName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="CBKM"
            />
          </div>
        </div>

        <button
          onClick={handleSaveSmtp}
          disabled={smtpSaveStatus === 'saving'}
          className="mt-5 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center disabled:opacity-60"
        >
          <Save className="w-4 h-4 mr-2" />
          {smtpSaveStatus === 'saving' ? 'Saving...' : smtpSaveStatus === 'saved' ? 'Saved!' : smtpSaveStatus === 'error' ? 'Error saving' : 'Save Email Config'}
        </button>
      </div>
    </div>
  );

  // Event Modal Component
  const EventModal = () => {
    const [eventData, setEventData] = useState<Event>(
      editingEvent || {
        id: '',
        name: '',
        image: '',
        description: '',
        poster: '',
        date: '',
        location: '',
        attendeeForm: [
          { id: '1', name: 'fullName', type: 'text', label: 'Full Name', required: true },
          { id: '2', name: 'email', type: 'email', label: 'Email', required: true },
          { id: '3', name: 'phone', type: 'phone', label: 'Phone Number', required: true },
          { id: '4', name: 'numberOfTickets', type: 'number', label: 'Number of Tickets', required: true },
        ],
        participantForm: [
          { id: '1', name: 'fullName', type: 'text', label: 'Full Name', required: true },
          { id: '2', name: 'email', type: 'email', label: 'Email', required: true },
          { id: '3', name: 'phone', type: 'phone', label: 'Phone Number', required: true },
          { id: '4', name: 'category', type: 'select', label: 'Performance Category', required: true },
        ]
      }
    );

    const [activeFormTab, setActiveFormTab] = useState<'attendee' | 'participant'>('attendee');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [posterFile, setPosterFile] = useState<File | null>(null);

    const addFormField = (formType: 'attendee' | 'participant') => {
      const newField: FormField = {
        id: Date.now().toString(),
        name: '',
        type: 'text',
        label: '',
        required: false
      };

      if (formType === 'attendee') {
        setEventData({
          ...eventData,
          attendeeForm: [...(eventData.attendeeForm || []), newField]
        });
      } else {
        setEventData({
          ...eventData,
          participantForm: [...(eventData.participantForm || []), newField]
        });
      }
    };

    const removeFormField = (formType: 'attendee' | 'participant', fieldId: string) => {
      if (formType === 'attendee') {
        setEventData({
          ...eventData,
          attendeeForm: eventData.attendeeForm?.filter(field => field.id !== fieldId) || []
        });
      } else {
        setEventData({
          ...eventData,
          participantForm: eventData.participantForm?.filter(field => field.id !== fieldId) || []
        });
      }
    };

    const updateFormField = (formType: 'attendee' | 'participant', fieldId: string, updates: Partial<FormField>) => {
      if (formType === 'attendee') {
        setEventData({
          ...eventData,
          attendeeForm: eventData.attendeeForm?.map(field => 
            field.id === fieldId ? { ...field, ...updates } : field
          ) || []
        });
      } else {
        setEventData({
          ...eventData,
          participantForm: eventData.participantForm?.map(field => 
            field.id === fieldId ? { ...field, ...updates } : field
          ) || []
        });
      }
    };

    const handleImageUpload = (type: 'image' | 'poster') => {
      return (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.size <= 10 * 1024 * 1024) { // 10MB limit
          if (type === 'image') {
            setImageFile(file);
            setEventData({...eventData, image: URL.createObjectURL(file)});
          } else {
            setPosterFile(file);
            setEventData({...eventData, poster: URL.createObjectURL(file)});
          }
        } else {
          alert('File size must be less than 10MB');
        }
      };
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h2>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Basic Event Information */}
            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Name *</label>
                  <input
                    type="text"
                    value={eventData.name}
                    onChange={(e) => setEventData({...eventData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter event name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Date *</label>
                  <input
                    type="date"
                    value={eventData.date}
                    onChange={(e) => setEventData({...eventData, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                <input
                  type="text"
                  value={eventData.location}
                  onChange={(e) => setEventData({...eventData, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter event location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  rows={3}
                  value={eventData.description}
                  onChange={(e) => setEventData({...eventData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter event description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Image</label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload('image')(e)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    {imageFile && (
                      <div className="text-sm text-gray-600">
                        Selected: {imageFile.name} ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
                      </div>
                    )}
                  </div>
                  {eventData.image && (
                    <div className="mt-2">
                      <img src={eventData.image} alt="Event preview" className="h-32 w-full object-cover rounded" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Poster</label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload('poster')(e)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    {posterFile && (
                      <div className="text-sm text-gray-600">
                        Selected: {posterFile.name} ({(posterFile.size / 1024 / 1024).toFixed(2)} MB)
                      </div>
                    )}
                  </div>
                  {eventData.poster && (
                    <div className="mt-2">
                      <img src={eventData.poster} alt="Poster preview" className="h-32 w-full object-cover rounded" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Configuration */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Forms</h3>
              
              {/* Form Tabs */}
              <div className="flex space-x-1 mb-6">
                <button
                  onClick={() => setActiveFormTab('attendee')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    activeFormTab === 'attendee'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <UserCheck className="w-4 h-4 inline mr-2" />
                  Attendee Form
                </button>
                <button
                  onClick={() => setActiveFormTab('participant')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    activeFormTab === 'participant'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <UserPlus className="w-4 h-4 inline mr-2" />
                  Participant Form
                </button>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-900">
                    {activeFormTab === 'attendee' ? 'Attendee' : 'Participant'} Form Fields
                  </h4>
                  <button
                    onClick={() => addFormField(activeFormTab)}
                    className="bg-primary-600 text-white px-3 py-1 rounded-lg hover:bg-primary-700 transition-colors flex items-center text-sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Field
                  </button>
                </div>

                <div className="space-y-3">
                  {(activeFormTab === 'attendee' ? eventData.attendeeForm : eventData.participantForm)?.map((field) => (
                    <div key={field.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Field Name</label>
                          <input
                            type="text"
                            value={field.name}
                            onChange={(e) => updateFormField(activeFormTab, field.id, { name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Field name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => updateFormField(activeFormTab, field.id, { label: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Field label"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                          <select
                            value={field.type}
                            onChange={(e) => updateFormField(activeFormTab, field.id, { type: e.target.value as any })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          >
                            <option value="text">Text</option>
                            <option value="email">Email</option>
                            <option value="phone">Phone</option>
                            <option value="number">Number</option>
                            <option value="select">Select</option>
                            <option value="textarea">Textarea</option>
                          </select>
                        </div>
                        <div className="flex items-center space-x-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => updateFormField(activeFormTab, field.id, { required: e.target.checked })}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Required</span>
                          </label>
                          <button
                            onClick={() => removeFormField(activeFormTab, field.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex space-x-4 pt-6 border-t">
              <button
                onClick={() => {
                  // Handle save event logic here
                  alert('Event saved successfully!');
                  setShowEventModal(false);
                }}
                className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold flex items-center justify-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingEvent ? 'Update Event' : 'Create Event'}
              </button>
              <button
                onClick={() => setShowEventModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img src="/logo.svg?v=2" alt="CBKM Logo" className="w-8 h-8" />
              <h1 className="text-xl font-bold text-gray-900">Admin Portal</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-700 hover:text-gray-900"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'events' && renderEventsTab()}
        {activeTab === 'attendees' && renderAttendeesTab()}
        {activeTab === 'participants' && renderParticipantsTab()}
        {activeTab === 'sponsors' && renderSponsorsTab()}
        {activeTab === 'gallery' && renderGalleryTab()}
        {activeTab === 'contacts' && renderContactsTab()}
        {activeTab === 'blog' && renderBlogTab()}
        {activeTab === 'settings' && renderSettingsTab()}
        {activeTab === 'voting' && <VotingControl />}
      </main>

      {/* Event Modal */}
      {showEventModal && <EventModal />}
    </div>
  );
};

export default AdminDashboard;
