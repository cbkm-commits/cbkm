import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Users, Image, HandHeart, Phone, Settings, LogOut,
  Plus, Edit, Trash2, Download, X, Save, UserPlus, UserCheck,
  Upload, FileText, Settings2, ChevronRight, Mail, Paperclip, Loader, RefreshCw, Eye, EyeOff, Tag, Vote, BarChart2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Event, FormField, Registration, Sponsor, SponsorshipPackage, Blog, Vote as VoteRecord } from '../../types';
import { useSponsorship } from '../../context/SponsorshipContext';
import { useLogo } from '../../context/LogoContext';
import { useEvents } from '../../context/EventsContext';
import { fetchSponsors, createSponsor, updateSponsor, deleteSponsor, fetchPackages, createPackage, upsertPackage, deletePackage } from '../../lib/db/sponsors';
import { fetchGallery, createGalleryImage, deleteGalleryImage } from '../../lib/db/gallery';
import { fetchContacts } from '../../lib/db/contacts';
import { fetchRegistrations, deleteRegistration, updateRegistration, fetchVotingParticipants } from '../../lib/db/registrations';
import { fetchVotes, deleteVotes, computeResults, VoteResult } from '../../lib/db/votes';
import { getSettings, setSetting } from '../../lib/db/settings';
import { fetchBlogs, createBlog, updateBlog, deleteBlog } from '../../lib/db/blogs';
import { uploadImage, uploadFile } from '../../lib/storage';
import { formatEventDate } from '../../lib/dateUtils';

// ─── Types ────────────────────────────────────────────────────────────────────
interface EmailConfig { smtpHost: string; smtpPort: string; smtpUser: string; smtpPass: string; fromEmail: string; fromName: string; }
interface FormEmailConfig { subject: string; body: string; attachmentName: string; }

const defaultEmailBody = (type: 'attendee' | 'participant') =>
  type === 'attendee'
    ? `Dear {{name}},

Thank you for registering for <strong>{{event}}</strong> on <strong>{{date}}</strong>!

<strong>Your Registration Details:</strong>
<ul>
  <li><strong>Name:</strong> {{name}}</li>
  <li><strong>Email:</strong> {{email}}</li>
  <li><strong>Phone:</strong> {{phone}}</li>
  <li><strong>Event:</strong> {{event}}</li>
  <li><strong>Date:</strong> {{date}}</li>
  <li><strong>Location:</strong> {{location}}</li>
  <li><strong>Number of Tickets:</strong> {{tickets}}</li>
  <li><strong>Adults:</strong> {{adults}}</li>
  <li><strong>Kids (above 6):</strong> {{kidsAbove6}}</li>
  <li><strong>Kids (below 6):</strong> {{kidsBelow6}}</li>
</ul>

We are excited to have you join us. Please bring this confirmation email on the day of the event.

If you have any questions, please contact us at <a href="mailto:bharathikalaimandram@gmail.com">bharathikalaimandram@gmail.com</a>.

Warm regards,<br>
Calgary Bharathi Kalai Mandram (CBKM)`
    : `Dear {{name}},

Thank you for registering as a participant for <strong>{{event}}</strong> on <strong>{{date}}</strong>!

<strong>Your Registration Details:</strong>
<ul>
  <li><strong>Name:</strong> {{name}}</li>
  <li><strong>Email:</strong> {{email}}</li>
  <li><strong>Phone:</strong> {{phone}}</li>
  <li><strong>Event:</strong> {{event}}</li>
  <li><strong>Date:</strong> {{date}}</li>
  <li><strong>Location:</strong> {{location}}</li>
  <li><strong>Number of Participants:</strong> {{participants}}</li>
  <li><strong>Adults:</strong> {{adults}}</li>
  <li><strong>Category:</strong> {{category}}</li>
  <li><strong>Performance Details:</strong> {{performanceDetails}}</li>
</ul>

We are thrilled to have you perform at this event. Our team will be in touch with further details about your performance schedule.

If you have any questions, please contact us at <a href="mailto:bharathikalaimandram@gmail.com">bharathikalaimandram@gmail.com</a>.

Warm regards,<br>
Calgary Bharathi Kalai Mandram (CBKM)`;

// ─── Component ────────────────────────────────────────────────────────────────
const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const navigate = useNavigate();
  const { sponsorshipContact, updateSponsorshipContact } = useSponsorship();
  const { logoUrl, updateLogo } = useLogo();
  const { events, loading: eventsLoading, addEvent, editEvent, removeEvent } = useEvents();

  // ── Tab state ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('events');
  const [attendeeSubTab, setAttendeeSubTab] = useState<'list' | 'config'>('list');
  const [participantSubTab, setParticipantSubTab] = useState<'list' | 'config'>('list');

  // ── Event modals ───────────────────────────────────────────────────────────
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // ── Sponsor state ──────────────────────────────────────────────────────────
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [sponsorPackages, setSponsorPackages] = useState<SponsorshipPackage[]>([]);
  const [localSponsorshipContact, setLocalSponsorshipContact] = useState(sponsorshipContact);
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);

  // ── Blog state ─────────────────────────────────────────────────────────────
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);

  // ── Sponsorship levels ─────────────────────────────────────────────────────
  const defaultLevels = [
    { key: 'platinum', label: 'Platinum', amount: '$5,000+', benefits: ['All Gold benefits', 'Title sponsorship', 'VIP event access'] },
    { key: 'gold', label: 'Gold', amount: '$2,500 - $4,999', benefits: ['All Silver benefits', 'Banner placement at events', 'Sponsor booth space'] },
    { key: 'silver', label: 'Silver', amount: '$1,000 - $2,499', benefits: ['All Bronze benefits', 'Logo on event materials', 'Verbal recognition at events'] },
    { key: 'bronze', label: 'Bronze', amount: '$500 - $999', benefits: ['Logo on website', 'Social media mention', 'Event recognition'] },
  ];
  const [sponsorLevels, setSponsorLevels] = useState(defaultLevels);

  // ── Gallery state ──────────────────────────────────────────────────────────
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [galleryUploading, setGalleryUploading] = useState(false);

  // ── Registrations + contacts ───────────────────────────────────────────────
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);

  // ── Settings state ─────────────────────────────────────────────────────────
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({ smtpHost: '', smtpPort: '', smtpUser: '', smtpPass: '', fromEmail: '', fromName: '' });
  const [attendeeEmailConfig, setAttendeeEmailConfig] = useState<FormEmailConfig>({ subject: '', body: '', attachmentName: '' });
  const [participantEmailConfig, setParticipantEmailConfig] = useState<FormEmailConfig>({ subject: '', body: '', attachmentName: '' });
  const [notificationEmails, setNotificationEmails] = useState('');

  // ── Filters ────────────────────────────────────────────────────────────────
  const [attendeeFilters, setAttendeeFilters] = useState({ year: '', eventName: '' });
  const [participantFilters, setParticipantFilters] = useState({ year: '', eventName: '' });
  const [sidePanelRecord, setSidePanelRecord] = useState<Registration | null>(null);
  const [showAttendeeColMenu, setShowAttendeeColMenu] = useState(false);
  const [showParticipantColMenu, setShowParticipantColMenu] = useState(false);
  const [attendeeCols, setAttendeeCols] = useState({ year: true, eventName: true, name: true, email: true, phone: true, tickets: true, adults: true, kidsAbove6: true, kidsBelow6: true });
  const [participantCols, setParticipantCols] = useState({ year: true, eventName: true, name: true, email: true, phone: true, participants: true, adults: true, category: true, performanceDetails: true });

  const [dataLoading, setDataLoading] = useState(true);
  const [editingRegistration, setEditingRegistration] = useState<Registration | null>(null);

  // ── Toast + Confirm ────────────────────────────────────────────────────────
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ msg: string; onConfirm: () => void } | null>(null);
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };
  const showConfirm = (msg: string, onConfirm: () => void) => setConfirmDialog({ msg, onConfirm });

  // ── Load data on mount ─────────────────────────────────────────────────────
  useEffect(() => {
    setLocalSponsorshipContact(sponsorshipContact);
  }, [sponsorshipContact]);

  useEffect(() => {
    const load = async () => {
      const [sp, pkg, gal, regs, ctcs, bls, settings] = await Promise.allSettled([
        fetchSponsors(), fetchPackages(), fetchGallery(), fetchRegistrations(), fetchContacts(), fetchBlogs(),
        getSettings(['smtp_config', 'attendee_email_config', 'participant_email_config', 'sponsorship_levels', 'notification_emails']),
      ]);
      if (sp.status === 'fulfilled') setSponsors(sp.value as Sponsor[]);
      if (pkg.status === 'fulfilled') setSponsorPackages(pkg.value as SponsorshipPackage[]);
      if (gal.status === 'fulfilled') setGalleryImages(gal.value as any[]);
      if (regs.status === 'fulfilled') setRegistrations(regs.value as Registration[]);
      if (ctcs.status === 'fulfilled') setContacts(ctcs.value as any[]);
      if (bls.status === 'fulfilled') setBlogs(bls.value as Blog[]);
      if (settings.status === 'fulfilled') {
        const s = settings.value as Record<string, string>;
        if (s['sponsorship_levels']) { try { setSponsorLevels(JSON.parse(s['sponsorship_levels'])); } catch {} }
        if (s['smtp_config']) { try { setEmailConfig(JSON.parse(s['smtp_config'])); } catch {} }
        if (s['notification_emails']) setNotificationEmails(s['notification_emails']);
        if (s['attendee_email_config']) { try { const c = JSON.parse(s['attendee_email_config']); setAttendeeEmailConfig({ subject: c.subject || '', body: c.body || defaultEmailBody('attendee'), attachmentName: c.attachmentName || '' }); } catch {} } else { setAttendeeEmailConfig({ subject: 'Registration Confirmed – {{event}}', body: defaultEmailBody('attendee'), attachmentName: '' }); }
        if (s['participant_email_config']) { try { const c = JSON.parse(s['participant_email_config']); setParticipantEmailConfig({ subject: c.subject || '', body: c.body || defaultEmailBody('participant'), attachmentName: c.attachmentName || '' }); } catch {} } else { setParticipantEmailConfig({ subject: 'Participant Registration Confirmed – {{event}}', body: defaultEmailBody('participant'), attachmentName: '' }); }
      }
      setDataLoading(false);
    };
    load();
  }, []);

  // ── Refresh registrations ──────────────────────────────────────────────────
  const [refreshing, setRefreshing] = useState(false);
  const refreshRegistrations = async () => {
    setRefreshing(true);
    try { setRegistrations(await fetchRegistrations()); } catch {}
    setRefreshing(false);
  };

  // ── Inline registration quick-update ──────────────────────────────────────
  const quickUpdateReg = async (id: string, patch: Partial<Registration>) => {
    try {
      const updated = await updateRegistration(id, patch);
      setRegistrations(prev => prev.map(r => r.id === id ? updated : r));
    } catch { showToast('Update failed', 'error'); }
  };

  // ── Logo ───────────────────────────────────────────────────────────────────
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try { const url = await uploadImage(file, 'logos'); updateLogo(url); showToast('Logo updated'); } catch { showToast('Logo upload failed', 'error'); }
  };

  // ── Gallery upload ─────────────────────────────────────────────────────────
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []); if (!files.length) return;
    setGalleryUploading(true);
    for (const file of files) {
      try {
        const url = await uploadImage(file, 'gallery');
        const img = await createGalleryImage({ url, title: file.name.replace(/\.[^.]+$/, ''), description: '' });
        setGalleryImages(prev => [img, ...prev]);
      } catch (err) { console.error('Gallery upload failed', err); }
    }
    setGalleryUploading(false);
    e.target.value = '';
  };

  // ── XLSX exports ───────────────────────────────────────────────────────────
  const autoColWidths = (ws: XLSX.WorkSheet, rows: Record<string, any>[]) => {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    ws['!cols'] = headers.map(h => ({ wch: Math.min(Math.max(h.length, ...rows.map(r => String(r[h] ?? '').length)) + 2, 60) }));
  };

  const exportToXLSX = (type: 'attendees' | 'participants') => {
    const regs = registrations.filter(r => r.type === (type === 'attendees' ? 'attendee' : 'participant'));
    const standardFieldNames = new Set(['fullName', 'name', 'email', 'phone', 'address', 'numberOfTickets', 'adults', 'kidsAbove6', 'kidsBelow6', 'numberOfParticipants', 'category', 'performanceDetails', 'specialRequirements']);
    const fieldLabelMap: Record<string, string> = {};
    events.forEach(ev => [...(ev.attendeeForm || []), ...(ev.participantForm || [])].forEach(f => { if (f.name) fieldLabelMap[f.name] = f.label; }));
    const relatedEventIds = new Set(regs.map(r => r.eventId));
    const formKey = type === 'attendees' ? 'attendeeForm' : 'participantForm';
    const configKeys = events.filter(e => relatedEventIds.has(e.id)).flatMap(e => (e[formKey] || []).filter((f: any) => f.name && !standardFieldNames.has(f.name)).map((f: any) => f.name));
    const allCustomKeys = Array.from(new Set([...regs.flatMap(r => Object.keys(r.customFields || {})), ...configKeys]));
    const rows = regs.map(r => {
      const event = events.find(e => e.id === r.eventId);
      const base: Record<string, any> = type === 'attendees'
        ? { Year: new Date(r.registrationDate).getFullYear(), 'Event Name': event?.name || '', Name: r.name, Email: r.email, Phone: r.phone, Tickets: r.numberOfTickets || 0, Adults: r.adults || 0, 'Kids >6': r.kidsAbove6 || 0, 'Kids <6': r.kidsBelow6 || 0 }
        : { Year: new Date(r.registrationDate).getFullYear(), 'Event Name': event?.name || '', Name: r.name, Email: r.email, Phone: r.phone, Participants: r.numberOfParticipants || 0, Adults: r.adults || 0, Category: r.category || '', 'Performance Details': r.performanceDetails || '' };
      for (const key of allCustomKeys) { base[fieldLabelMap[key] || key] = r.customFields?.[key] || ''; }
      return base;
    });
    const ws = XLSX.utils.json_to_sheet(rows); autoColWidths(ws, rows);
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, type);
    XLSX.writeFile(wb, `${type}_export.xlsx`);
  };

  // ── Tabs ───────────────────────────────────────────────────────────────────
  const tabs = [
    { id: 'events', name: 'Events', icon: Calendar },
    { id: 'attendees', name: 'Attendees', icon: Users },
    { id: 'participants', name: 'Participants', icon: UserPlus },
    { id: 'voting', name: 'Voting', icon: Vote },
    { id: 'sponsors', name: 'Sponsors', icon: HandHeart },
    { id: 'gallery', name: 'Gallery', icon: Image },
    { id: 'contacts', name: 'Contacts', icon: Phone },
    { id: 'blog', name: 'Blog', icon: FileText },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const ColCheckbox = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) => (
    <label className="flex items-center space-x-2 cursor-pointer py-1">
      <input type="checkbox" checked={checked} onChange={onChange} className="rounded border-gray-300 text-primary-600" />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // EVENTS TAB
  // ══════════════════════════════════════════════════════════════════════════
  const renderEventsTab = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Event Management</h2>
        <button onClick={() => { setEditingEvent(null); setShowEventModal(true); }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center">
          <Plus className="w-4 h-4 mr-2" />Create Event
        </button>
      </div>
      {eventsLoading ? <div className="flex justify-center py-12"><Loader className="w-6 h-6 animate-spin text-primary-600" /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <div key={event.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gradient-to-r from-primary-400 to-primary-600 overflow-hidden">
                {event.image && <img src={event.image} alt={event.name} className="w-full h-full object-cover" />}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{event.name}</h3>
                <p className="text-sm text-gray-500 mb-1">{formatEventDate(event.date)}</p>
                {(event.hidden || event.attendeeFormPaused || event.participantFormPaused) && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {event.hidden && <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full border border-gray-200">Hidden</span>}
                    {event.attendeeFormPaused && <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-200">Tickets paused</span>}
                    {event.participantFormPaused && <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-200">Registration paused</span>}
                  </div>
                )}
                <p className="text-gray-600 text-sm mb-4 line-clamp-4">{event.description}</p>
                <div className="flex space-x-2">
                  <button onClick={() => { setEditingEvent(event); setShowEventModal(true); }}
                    className="flex-1 bg-primary-600 text-white px-3 py-2 rounded-lg hover:bg-primary-700 flex items-center justify-center">
                    <Edit className="w-4 h-4 mr-2" />Edit
                  </button>
                  <button onClick={() => showConfirm('Delete this event?', async () => { await removeEvent(event.id); })}
                    className="flex-1 border border-red-300 text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 flex items-center justify-center">
                    <Trash2 className="w-4 h-4 mr-2" />Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // ATTENDEES TAB
  // ══════════════════════════════════════════════════════════════════════════
  const renderAttendeesTab = () => {
    const allRegs = registrations.filter(r => r.type === 'attendee');
    const filtered = allRegs.filter(r => {
      const event = events.find(e => e.id === r.eventId);
      return (!attendeeFilters.year || new Date(r.registrationDate).getFullYear().toString() === attendeeFilters.year)
        && (!attendeeFilters.eventName || event?.name.toLowerCase().includes(attendeeFilters.eventName.toLowerCase()));
    });
    const years = Array.from(new Set(allRegs.map(r => new Date(r.registrationDate).getFullYear().toString())));
    const eventNames = Array.from(new Set(allRegs.map(r => events.find(e => e.id === r.eventId)?.name || '').filter(Boolean)));

    return (
      <div>
        <div className="flex space-x-1 mb-6 border-b">
          {(['list', 'config'] as const).map(t => (
            <button key={t} onClick={() => setAttendeeSubTab(t)}
              className={`px-4 py-2 font-medium text-sm border-b-2 -mb-px ${attendeeSubTab === t ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t === 'list' ? 'Attendees' : 'Configuration'}
            </button>
          ))}
        </div>
        {attendeeSubTab === 'list' ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Attendees</h2>
              <div className="flex items-center space-x-2">
                <button onClick={refreshRegistrations} disabled={refreshing}
                  className="border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center disabled:opacity-50"
                  title="Refresh data">
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                <div className="relative">
                  <button onClick={() => setShowAttendeeColMenu(!showAttendeeColMenu)}
                    className="border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center">
                    <Settings2 className="w-4 h-4" />
                  </button>
                  {showAttendeeColMenu && (
                    <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-20 w-48">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Columns</p>
                      {Object.entries(attendeeCols).map(([key, val]) => (
                        <ColCheckbox key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                          checked={val} onChange={() => setAttendeeCols({ ...attendeeCols, [key]: !val })} />
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => exportToXLSX('attendees')}
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center">
                  <Download className="w-4 h-4 mr-2" />Export XLSX
                </button>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Year</label>
                  <select value={attendeeFilters.year} onChange={e => setAttendeeFilters({ ...attendeeFilters, year: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="">All Years</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Event</label>
                  <select value={attendeeFilters.eventName} onChange={e => setAttendeeFilters({ ...attendeeFilters, eventName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="">All Events</option>
                    {eventNames.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <button onClick={() => setAttendeeFilters({ year: '', eventName: '' })}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">Clear</button>
                </div>
              </div>
            </div>
            {(() => {
              const standardFieldNames = new Set(['fullName', 'name', 'email', 'phone', 'address', 'numberOfTickets', 'adults', 'kidsAbove6', 'kidsBelow6', 'numberOfParticipants', 'category', 'performanceDetails', 'specialRequirements']);
              const fieldLabelMap: Record<string, string> = {};
              events.forEach(ev => [...(ev.attendeeForm || []), ...(ev.participantForm || [])].forEach(f => { if (f.name) fieldLabelMap[f.name] = f.label; }));
              const filteredEventIds = new Set(filtered.map(r => r.eventId));
              const configKeys = events.filter(e => filteredEventIds.has(e.id)).flatMap(e => (e.attendeeForm || []).filter(f => f.name && !standardFieldNames.has(f.name)).map(f => f.name));
              const customKeys = Array.from(new Set([...filtered.flatMap(r => Object.keys(r.customFields || {})), ...configKeys]));
              return (
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        {attendeeCols.year && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>}
                        {attendeeCols.eventName && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>}
                        {attendeeCols.name && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>}
                        {attendeeCols.email && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>}
                        {attendeeCols.phone && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>}
                        {attendeeCols.tickets && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"># Tickets</th>}
                        {attendeeCols.adults && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adults</th>}
                        {attendeeCols.kidsAbove6 && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kids &gt;6</th>}
                        {attendeeCols.kidsBelow6 && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kids &lt;6</th>}
                        {customKeys.map(k => <th key={k} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{fieldLabelMap[k] || k}</th>)}
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filtered.map(r => {
                        const event = events.find(e => e.id === r.eventId);
                        return (
                          <tr key={r.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSidePanelRecord(r)}>
                            {attendeeCols.year && <td className="px-4 py-3 text-sm text-gray-500">{new Date(r.registrationDate).getFullYear()}</td>}
                            {attendeeCols.eventName && <td className="px-4 py-3 text-sm font-medium text-gray-900">{event?.name || '—'}</td>}
                            {attendeeCols.name && <td className="px-4 py-3 text-sm text-gray-700">{r.name}</td>}
                            {attendeeCols.email && <td className="px-4 py-3 text-sm text-gray-500">{r.email}</td>}
                            {attendeeCols.phone && <td className="px-4 py-3 text-sm text-gray-500">{r.phone}</td>}
                            {attendeeCols.tickets && <td className="px-4 py-3 text-sm text-gray-500">{r.numberOfTickets || 0}</td>}
                            {attendeeCols.adults && <td className="px-4 py-3 text-sm text-gray-500">{r.adults || 0}</td>}
                            {attendeeCols.kidsAbove6 && <td className="px-4 py-3 text-sm text-gray-500">{r.kidsAbove6 || 0}</td>}
                            {attendeeCols.kidsBelow6 && <td className="px-4 py-3 text-sm text-gray-500">{r.kidsBelow6 || 0}</td>}
                            {customKeys.map(k => <td key={k} className="px-4 py-3 text-sm text-gray-500">{r.customFields?.[k] || '—'}</td>)}
                            <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center justify-end space-x-1">
                                <button onClick={() => setEditingRegistration(r)} className="p-1 text-primary-600 hover:text-primary-800"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => showConfirm('Delete this registration?', async () => { await deleteRegistration(r.id); setRegistrations(prev => prev.filter(x => x.id !== r.id)); })} className="p-1 text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </>
        ) : (
          <AttendeeParticipantConfig type="attendee" emailConfig={attendeeEmailConfig}
            onSave={async cfg => { setAttendeeEmailConfig(cfg); await setSetting('attendee_email_config', JSON.stringify(cfg)); showToast('Attendee email config saved!'); }} />
        )}
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // PARTICIPANTS TAB
  // ══════════════════════════════════════════════════════════════════════════
  const renderParticipantsTab = () => {
    const allRegs = registrations.filter(r => r.type === 'participant');
    const filtered = allRegs.filter(r => {
      const event = events.find(e => e.id === r.eventId);
      return (!participantFilters.year || new Date(r.registrationDate).getFullYear().toString() === participantFilters.year)
        && (!participantFilters.eventName || event?.name.toLowerCase().includes(participantFilters.eventName.toLowerCase()));
    });
    const years = Array.from(new Set(allRegs.map(r => new Date(r.registrationDate).getFullYear().toString())));
    const eventNames = Array.from(new Set(allRegs.map(r => events.find(e => e.id === r.eventId)?.name || '').filter(Boolean)));

    return (
      <div>
        <div className="flex space-x-1 mb-6 border-b">
          {(['list', 'config'] as const).map(t => (
            <button key={t} onClick={() => setParticipantSubTab(t)}
              className={`px-4 py-2 font-medium text-sm border-b-2 -mb-px ${participantSubTab === t ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t === 'list' ? 'Participants' : 'Configuration'}
            </button>
          ))}
        </div>
        {participantSubTab === 'list' ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Participants</h2>
              <div className="flex items-center space-x-2">
                <button onClick={refreshRegistrations} disabled={refreshing}
                  className="border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center disabled:opacity-50"
                  title="Refresh data">
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                <div className="relative">
                  <button onClick={() => setShowParticipantColMenu(!showParticipantColMenu)}
                    className="border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center">
                    <Settings2 className="w-4 h-4" />
                  </button>
                  {showParticipantColMenu && (
                    <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-20 w-48">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Columns</p>
                      {Object.entries(participantCols).map(([key, val]) => (
                        <ColCheckbox key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                          checked={val} onChange={() => setParticipantCols({ ...participantCols, [key]: !val })} />
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => exportToXLSX('participants')}
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center">
                  <Download className="w-4 h-4 mr-2" />Export XLSX
                </button>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Year</label>
                  <select value={participantFilters.year} onChange={e => setParticipantFilters({ ...participantFilters, year: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="">All Years</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Event</label>
                  <select value={participantFilters.eventName} onChange={e => setParticipantFilters({ ...participantFilters, eventName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="">All Events</option>
                    {eventNames.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <button onClick={() => setParticipantFilters({ year: '', eventName: '' })}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">Clear</button>
                </div>
              </div>
            </div>
            {(() => {
              const standardFieldNames = new Set(['fullName', 'name', 'email', 'phone', 'address', 'numberOfTickets', 'adults', 'kidsAbove6', 'kidsBelow6', 'numberOfParticipants', 'category', 'performanceDetails', 'specialRequirements']);
              const fieldLabelMap: Record<string, string> = {};
              events.forEach(ev => [...(ev.attendeeForm || []), ...(ev.participantForm || [])].forEach(f => { if (f.name) fieldLabelMap[f.name] = f.label; }));
              const filteredEventIds = new Set(filtered.map(r => r.eventId));
              const configKeys = events.filter(e => filteredEventIds.has(e.id)).flatMap(e => (e.participantForm || []).filter(f => f.name && !standardFieldNames.has(f.name)).map(f => f.name));
              const customKeys = Array.from(new Set([...filtered.flatMap(r => Object.keys(r.customFields || {})), ...configKeys]));
              return (
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        {participantCols.year && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>}
                        {participantCols.eventName && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>}
                        {participantCols.name && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>}
                        {participantCols.email && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>}
                        {participantCols.phone && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>}
                        {participantCols.participants && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"># Participants</th>}
                        {participantCols.adults && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adults</th>}
                        {participantCols.category && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>}
                        {participantCols.performanceDetails && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>}
                        {customKeys.map(k => <th key={k} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{fieldLabelMap[k] || k}</th>)}
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Finalized</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Part #</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vote</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filtered.map(r => {
                        const event = events.find(e => e.id === r.eventId);
                        return (
                          <tr key={r.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSidePanelRecord(r)}>
                            {participantCols.year && <td className="px-4 py-3 text-sm text-gray-500">{new Date(r.registrationDate).getFullYear()}</td>}
                            {participantCols.eventName && <td className="px-4 py-3 text-sm font-medium text-gray-900">{event?.name || '—'}</td>}
                            {participantCols.name && <td className="px-4 py-3 text-sm text-gray-700">{r.name}</td>}
                            {participantCols.email && <td className="px-4 py-3 text-sm text-gray-500">{r.email}</td>}
                            {participantCols.phone && <td className="px-4 py-3 text-sm text-gray-500">{r.phone}</td>}
                            {participantCols.participants && <td className="px-4 py-3 text-sm text-gray-500">{r.numberOfParticipants || 0}</td>}
                            {participantCols.adults && <td className="px-4 py-3 text-sm text-gray-500">{r.adults || 0}</td>}
                            {participantCols.category && <td className="px-4 py-3 text-sm text-gray-500">{r.category || '—'}</td>}
                            {participantCols.performanceDetails && <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{r.performanceDetails || '—'}</td>}
                            {customKeys.map(k => <td key={k} className="px-4 py-3 text-sm text-gray-500">{r.customFields?.[k] || '—'}</td>)}
                            <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                              <button onClick={() => quickUpdateReg(r.id, { performanceFinalized: !r.performanceFinalized, ...(!r.performanceFinalized ? {} : { votingEnabled: false }) })}
                                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${r.performanceFinalized ? 'bg-green-500' : 'bg-gray-200'}`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${r.performanceFinalized ? 'translate-x-4' : 'translate-x-0'}`} />
                              </button>
                            </td>
                            <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                              {r.performanceFinalized ? (
                                <input defaultValue={r.participantNumber || ''} maxLength={15} placeholder="e.g. A01"
                                  onBlur={e => { if (e.target.value !== (r.participantNumber || '')) quickUpdateReg(r.id, { participantNumber: e.target.value }); }}
                                  onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                                  className="w-20 px-2 py-1 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-primary-400 focus:border-transparent" />
                              ) : <span className="text-gray-300 text-xs">—</span>}
                            </td>
                            <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                              <button disabled={!r.performanceFinalized || !event?.votingEnabled}
                                onClick={() => quickUpdateReg(r.id, { votingEnabled: !r.votingEnabled })}
                                className={`relative inline-flex h-5 w-9 rounded-full border-2 border-transparent transition-colors ${!r.performanceFinalized || !event?.votingEnabled ? 'opacity-30 cursor-not-allowed bg-gray-200' : r.votingEnabled ? 'bg-primary-600 cursor-pointer' : 'bg-gray-200 cursor-pointer'}`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${r.votingEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                              </button>
                            </td>
                            <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center justify-end space-x-1">
                                <button onClick={() => setEditingRegistration(r)} className="p-1 text-primary-600 hover:text-primary-800"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => showConfirm('Delete this registration?', async () => { await deleteRegistration(r.id); setRegistrations(prev => prev.filter(x => x.id !== r.id)); })} className="p-1 text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </>
        ) : (
          <AttendeeParticipantConfig type="participant" emailConfig={participantEmailConfig}
            onSave={async cfg => { setParticipantEmailConfig(cfg); await setSetting('participant_email_config', JSON.stringify(cfg)); showToast('Participant email config saved!'); }} />
        )}
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // ══════════════════════════════════════════════════════════════════════════
  // VOTING TAB
  // ══════════════════════════════════════════════════════════════════════════
  const VotingTab = () => {
    const [selectedEventId, setSelectedEventId] = useState(events.find(e => e.votingEnabled)?.id || events[0]?.id || '');
    const [results, setResults] = useState<VoteResult[]>([]);
    const [totalVotes, setTotalVotes] = useState(0);
    const [vLoading, setVLoading] = useState(false);
    const [voteParticipants, setVoteParticipants] = useState<Registration[]>([]);
    const [rawVotes, setRawVotes] = useState<VoteRecord[]>([]);

    // Attendee codes state
    const [codesCount, setCodesCount] = useState(0);
    const [generateCount, setGenerateCount] = useState(350);
    const [codesGenerating, setCodesGenerating] = useState(false);

    const selectedEvent = events.find(e => e.id === selectedEventId);

    useEffect(() => {
      if (!selectedEventId) return;
      setVLoading(true);
      const ev = events.find(e => e.id === selectedEventId);
      Promise.all([
        fetchVotingParticipants(selectedEventId),
        fetchVotes(selectedEventId),
        import('../../lib/db/eventCodes').then(m => m.fetchEventCodesCount(selectedEventId)),
      ]).then(([parts, votes, count]) => {
        setVoteParticipants(parts);
        setRawVotes(votes);
        const computed = computeResults(votes, parts.map(p => ({ id: p.id, name: p.name, category: p.category || '', participantNumber: p.participantNumber || '' })), ev?.votingType || 'choice');
        setResults(computed);
        setTotalVotes(votes.length);
        setCodesCount(count);
      }).catch(() => {}).finally(() => setVLoading(false));
    }, [selectedEventId]);

    const handleGenerateCodes = async () => {
      if (!selectedEventId || codesGenerating) return;
      setCodesGenerating(true);
      try {
        const { generateEventCodes, fetchEventCodesCount } = await import('../../lib/db/eventCodes');
        await generateEventCodes(selectedEventId, generateCount);
        const count = await fetchEventCodesCount(selectedEventId);
        setCodesCount(count);
        showToast(`${generateCount} codes generated`);
      } catch { showToast('Failed to generate codes', 'error'); }
      setCodesGenerating(false);
    };

    const handleDownloadCodes = async () => {
      if (!selectedEventId) return;
      try {
        const { fetchEventCodesAll } = await import('../../lib/db/eventCodes');
        const codes = await fetchEventCodesAll(selectedEventId);
        const txt = codes.join('\n');
        const blob = new Blob([txt], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `attendee-codes-${selectedEvent?.name || selectedEventId}.txt`; a.click();
        URL.revokeObjectURL(url);
      } catch { showToast('Download failed', 'error'); }
    };

    const handleClearCodes = async () => {
      if (!selectedEventId) return;
      if (!window.confirm(`Delete all ${codesCount} attendee codes for this event? This cannot be undone.`)) return;
      try {
        const { deleteEventCodes } = await import('../../lib/db/eventCodes');
        await deleteEventCodes(selectedEventId);
        setCodesCount(0);
        showToast('Codes cleared');
      } catch { showToast('Failed to clear codes', 'error'); }
    };

    const downloadCSV = (rows: string[][], filename: string) => {
      const csv = rows.map(r => r.map(v => `"${String(v)}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `${filename}.csv`; a.click();
      URL.revokeObjectURL(url);
    };

    const toRubricScore = (avgScore: number, percent: number): number => {
      const type = selectedEvent?.votingType || 'choice';
      if (type === 'choice') return Math.round((percent / 100) * 30 * 10) / 10;
      const max = type === 'stars' ? 5 : 10;
      return Math.round((avgScore / max) * 30 * 10) / 10;
    };

    const exportCSV = () => {
      const type = selectedEvent?.votingType || 'choice';
      const scoreHeader = type === 'choice' ? 'Percent (%)' : 'Avg Score';
      const rows = [['Rank', 'Participant #', 'Name', 'Category', 'Votes', scoreHeader, 'Rubric Score (/30)']];
      results.forEach((r, i) => rows.push([
        String(i + 1), r.registration.participantNumber, r.registration.name, r.registration.category,
        String(r.totalVotes),
        type === 'choice' ? String(r.percent) : String(r.avgScore),
        String(toRubricScore(r.avgScore, r.percent)),
      ]));
      downloadCSV(rows, `voting-results-${selectedEvent?.name || selectedEventId}`);
    };

    const exportPerformanceCSV = (r: VoteResult) => {
      const type = selectedEvent?.votingType || 'choice';
      const max = type === 'stars' ? 5 : 10;
      const perfVotes = rawVotes.filter(v => v.registrationId === r.registration.id);
      const rows: string[][] = [['Vote #', 'Score', 'Rubric Score (/30)']];
      let idx = 1;
      perfVotes.forEach(v => {
        try {
          const val = JSON.parse(v.voteValue);
          if (typeof val === 'number') {
            rows.push([String(idx++), String(val), String(Math.round((val / max) * 30 * 10) / 10)]);
          }
        } catch {}
      });
      rows.push(['', 'Avg Score', String(r.avgScore)]);
      rows.push(['', 'Rubric Score (/30)', String(toRubricScore(r.avgScore, r.percent))]);
      const name = `${r.registration.participantNumber ? `#${r.registration.participantNumber}-` : ''}${r.registration.name}`;
      downloadCSV(rows, `votes-${name}`);
    };

    const toggleResultsPublic = async () => {
      if (!selectedEvent) return;
      await editEvent(selectedEvent.id, { ...selectedEvent, resultsPublic: !selectedEvent.resultsPublic });
    };

    const handleResetVotes = async () => {
      if (!selectedEventId) return;
      if (!window.confirm('Reset ALL votes for this event? This cannot be undone.')) return;
      await deleteVotes(selectedEventId);
      setResults([]); setTotalVotes(0);
      showToast('Votes reset');
    };

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Audience Voting</h2>
          <div className="flex gap-3">
            {totalVotes > 0 && (
              <button onClick={exportCSV} className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                <Download className="w-4 h-4 mr-1.5" />Export CSV
              </button>
            )}
            <button onClick={handleResetVotes} className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
              Reset Votes
            </button>
          </div>
        </div>

        {/* Event picker */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-48">
              <label className="block text-xs font-medium text-gray-500 mb-1">Event</label>
              <select value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-primary-500">
                {events.map(e => <option key={e.id} value={e.id}>{e.name}{e.votingEnabled ? ' 🔴 LIVE' : ''}</option>)}
              </select>
            </div>
            {selectedEvent && (
              <>
                <div className="text-sm text-gray-500">
                  Type: <span className="font-medium capitalize">{selectedEvent.votingType || 'choice'}</span>
                </div>
                {selectedEvent.votingCode && (
                  <div className="text-sm text-gray-500">
                    Code: <span className="font-mono font-bold text-gray-800">{selectedEvent.votingCode}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Show results publicly</span>
                  <button onClick={toggleResultsPublic}
                    className={`relative inline-flex h-6 w-11 cursor-pointer rounded-full border-2 border-transparent transition-colors ${selectedEvent.resultsPublic ? 'bg-primary-600' : 'bg-gray-200'}`}>
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${selectedEvent.resultsPublic ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Attendee codes */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Attendee Codes</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {codesCount > 0
                  ? <span className="text-green-600 font-medium">{codesCount} codes generated</span>
                  : 'No codes yet — generate codes to require attendees to enter their code before voting'}
              </p>
            </div>
            {codesCount > 0 && (
              <div className="flex gap-2">
                <button onClick={handleDownloadCodes}
                  className="flex items-center px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-xs font-medium">
                  <Download className="w-3.5 h-3.5 mr-1" />Download
                </button>
                <button onClick={handleClearCodes}
                  className="px-3 py-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 text-xs font-medium">
                  Clear
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1">
              <label className="text-xs text-gray-500 whitespace-nowrap">Generate</label>
              <input type="number" min={1} max={1000} value={generateCount}
                onChange={e => setGenerateCount(Math.max(1, Math.min(1000, Number(e.target.value))))}
                className="w-24 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:ring-2 focus:ring-primary-500" />
              <label className="text-xs text-gray-500">codes</label>
            </div>
            <button onClick={handleGenerateCodes} disabled={codesGenerating}
              className="px-4 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium disabled:opacity-60 whitespace-nowrap">
              {codesGenerating ? 'Generating...' : codesCount > 0 ? 'Generate More' : 'Generate Codes'}
            </button>
          </div>
          {codesCount > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              Codes are 6-character alphanumeric. Attendees enter their code at <span className="font-mono">/vote</span> before voting.
            </p>
          )}
        </div>

        {/* Status banner */}
        {selectedEvent && (
          <div className={`mb-4 p-3 rounded-xl border flex items-center gap-3 text-sm ${selectedEvent.votingEnabled ? 'bg-green-50 border-green-200 text-green-800' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${selectedEvent.votingEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="font-medium">{selectedEvent.votingEnabled ? 'Voting is LIVE — audience can vote now' : 'Voting is closed for this event'}</span>
            <span className="ml-auto">{totalVotes} vote{totalVotes !== 1 ? 's' : ''} cast</span>
          </div>
        )}

        {/* Performers list */}
        {voteParticipants.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Voting-Enabled Performances ({voteParticipants.length})</h3>
            <div className="flex flex-wrap gap-2">
              {voteParticipants.map(p => (
                <span key={p.id} className="text-xs px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full border border-primary-200">
                  {p.participantNumber && <span className="font-mono font-bold mr-1">#{p.participantNumber}</span>}{p.name}{p.category ? ` · ${p.category}` : ''}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {vLoading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">Loading...</div>
        ) : results.length === 0 || totalVotes === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <BarChart2 className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No votes recorded yet for this event.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Results</h3>
            {results.map((r, i) => (
              <div key={r.registration.id} className="mb-4">
                <div className="flex justify-between items-center mb-1.5">
                  <span className={`text-sm ${i === 0 ? 'font-bold text-yellow-600' : 'text-gray-700'}`}>
                    {i === 0 ? '🏆 ' : `${i + 1}. `}{r.registration.name}
                    {r.registration.participantNumber && <span className="ml-2 text-xs text-primary-600 font-mono">#{r.registration.participantNumber}</span>}
                    {r.registration.category && <span className="ml-2 text-xs text-gray-400">{r.registration.category}</span>}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">
                      {selectedEvent?.votingType === 'choice'
                        ? `${r.totalVotes} vote${r.totalVotes !== 1 ? 's' : ''} · ${r.percent}% · ${toRubricScore(r.avgScore, r.percent)}/30`
                        : `avg ${r.avgScore}${selectedEvent?.votingType === 'stars' ? '★' : '/10'} · ${toRubricScore(r.avgScore, r.percent)}/30 · ${r.totalVotes} vote${r.totalVotes !== 1 ? 's' : ''}`}
                    </span>
                    {selectedEvent?.votingType !== 'choice' && (
                      <button onClick={() => exportPerformanceCSV(r)}
                        className="text-xs text-gray-400 hover:text-primary-600 flex items-center gap-0.5"
                        title="Download votes for this performance">
                        <Download className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${i === 0 ? 'bg-yellow-400' : 'bg-gray-400'}`}
                    style={{ width: `${selectedEvent?.votingType === 'choice' ? r.percent : (r.avgScore / (selectedEvent?.votingType === 'stars' ? 5 : 10)) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // SPONSORS TAB
  // ══════════════════════════════════════════════════════════════════════════
  const renderSponsorsTab = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Sponsor Management</h2>
        <button onClick={() => { setEditingSponsor(null); setShowSponsorModal(true); }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center">
          <Plus className="w-4 h-4 mr-2" />Add Sponsor
        </button>
      </div>

      {/* Sponsorship contact */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sponsorship Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={localSponsorshipContact.email}
              onChange={e => setLocalSponsorshipContact({ ...localSponsorshipContact, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" value={localSponsorshipContact.phone}
              onChange={e => setLocalSponsorshipContact({ ...localSponsorshipContact, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>
        <button onClick={() => { updateSponsorshipContact(localSponsorshipContact); showToast('Contact info saved!'); }}
          className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center">
          <Save className="w-4 h-4 mr-2" />Save Contact Info
        </button>
      </div>

      {/* Sponsorship Levels */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sponsorship Levels</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sponsorLevels.map((lvl, i) => (
            <div key={lvl.key} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className={`w-3 h-3 rounded-full ${lvl.key === 'platinum' ? 'bg-purple-500' : lvl.key === 'gold' ? 'bg-yellow-400' : lvl.key === 'silver' ? 'bg-gray-400' : 'bg-orange-500'}`} />
                  <h4 className="font-semibold text-gray-900">{lvl.label}</h4>
                </div>
                <button onClick={() => showConfirm(`Delete the ${lvl.label} level?`, () => setSponsorLevels(sponsorLevels.filter((_, j) => j !== i)))}
                  className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Amount / Rate</label>
                  <input type="text" value={lvl.amount}
                    onChange={e => setSponsorLevels(sponsorLevels.map((l, j) => j === i ? { ...l, amount: e.target.value } : l))}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Benefits (one per line)</label>
                  <textarea rows={3} value={lvl.benefits.join('\n')}
                    onChange={e => setSponsorLevels(sponsorLevels.map((l, j) => j === i ? { ...l, benefits: e.target.value.split('\n') } : l))}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={async () => { await setSetting('sponsorship_levels', JSON.stringify(sponsorLevels)); showToast('Sponsorship levels saved!'); }}
          className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center text-sm">
          <Save className="w-4 h-4 mr-2" />Save Levels
        </button>
      </div>

      {/* Packages */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Sponsorship Packages</h3>
          <button onClick={async () => {
            const pkg = await createPackage({ name: 'New Package', amount: '', description: '', logo: '' });
            setSponsorPackages(prev => [...prev, pkg]);
          }} className="bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 flex items-center text-sm">
            <Plus className="w-4 h-4 mr-1" />Add Package
          </button>
        </div>
        <div className="space-y-4">
          {sponsorPackages.map(pkg => (
            <div key={pkg.id} className="border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                  <input type="text" value={pkg.name}
                    onChange={e => setSponsorPackages(sponsorPackages.map(p => p.id === pkg.id ? { ...p, name: e.target.value } : p))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Rate / Amount</label>
                  <input type="text" value={pkg.amount}
                    onChange={e => setSponsorPackages(sponsorPackages.map(p => p.id === pkg.id ? { ...p, amount: e.target.value } : p))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" placeholder="e.g. $1,000 - $2,499" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Logo</label>
                  <div className="flex items-center space-x-2">
                    {pkg.logo && <img src={pkg.logo} alt="" className="w-10 h-8 object-contain border rounded" />}
                    <label className="border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center text-xs">
                      <Upload className="w-3 h-3 mr-1" />Upload
                      <input type="file" accept="image/*" className="hidden" onChange={async e => {
                        const file = e.target.files?.[0]; if (!file) return;
                        const url = await uploadImage(file, 'sponsors');
                        setSponsorPackages(sponsorPackages.map(p => p.id === pkg.id ? { ...p, logo: url } : p));
                      }} />
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Description / Benefits</label>
                  <textarea rows={2} value={pkg.description}
                    onChange={e => setSponsorPackages(sponsorPackages.map(p => p.id === pkg.id ? { ...p, description: e.target.value } : p))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
                </div>
                <button onClick={async () => { await deletePackage(pkg.id); setSponsorPackages(sponsorPackages.filter(p => p.id !== pkg.id)); }}
                  className="mt-5 text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={async () => { for (const pkg of sponsorPackages) { await upsertPackage(pkg); } showToast('Packages saved!'); }}
          className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center text-sm">
          <Save className="w-4 h-4 mr-2" />Save Packages
        </button>
      </div>

      {/* Sponsors grid */}
      {dataLoading ? <div className="flex justify-center py-8"><Loader className="w-6 h-6 animate-spin text-primary-600" /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {sponsors.map(sponsor => (
            <div key={sponsor.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-3">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${sponsor.level === 'platinum' ? 'bg-purple-100 text-purple-800' : sponsor.level === 'gold' ? 'bg-yellow-100 text-yellow-800' : sponsor.level === 'silver' ? 'bg-gray-100 text-gray-800' : 'bg-orange-100 text-orange-800'}`}>
                  {sponsor.level}
                </span>
                <div className="flex space-x-2">
                  <button onClick={() => { setEditingSponsor(sponsor); setShowSponsorModal(true); }} className="text-primary-600 hover:text-primary-900 p-1"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => showConfirm('Delete this sponsor?', async () => { await deleteSponsor(sponsor.id); setSponsors(sponsors.filter(s => s.id !== sponsor.id)); })} className="text-red-600 hover:text-red-900 p-1"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              {sponsor.logo && <img src={sponsor.logo} alt={sponsor.name} className="w-full h-16 object-contain mb-2" />}
              <h3 className="font-semibold text-gray-900 mb-1">{sponsor.name}</h3>
              {sponsor.description && <p className="text-sm text-gray-600 mb-2">{sponsor.description}</p>}
              {sponsor.website && <a href={sponsor.website} target="_blank" rel="noreferrer" className="text-xs text-primary-600 hover:underline">{sponsor.website}</a>}
            </div>
          ))}
        </div>
      )}

      {/* Sponsorship Inquiries */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Mail className="w-5 h-5 mr-2 text-primary-600" />Sponsorship Inquiries
        </h3>
        {(() => {
          const inquiries = contacts.filter((c: any) => (c.message || '').startsWith('[Sponsorship Inquiry]'));
          if (inquiries.length === 0) return <p className="text-sm text-gray-400">No sponsorship inquiries yet.</p>;
          return (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {inquiries.map((c: any) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                      <td className="px-4 py-3 text-gray-600">{c.email}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{(c.message || '').replace('[Sponsorship Inquiry] ', '')}</td>
                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{new Date(c.contactDate || c.contact_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()}
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // GALLERY TAB
  // ══════════════════════════════════════════════════════════════════════════
  const renderGalleryTab = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gallery Management</h2>
        <label className={`bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center cursor-pointer ${galleryUploading ? 'opacity-60 pointer-events-none' : ''}`}>
          {galleryUploading ? <><Loader className="w-4 h-4 mr-2 animate-spin" />Uploading...</> : <><Plus className="w-4 h-4 mr-2" />Upload Images</>}
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} />
        </label>
      </div>
      {galleryImages.length === 0 && !dataLoading && (
        <div className="text-center py-16 text-gray-400">
          <Image className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>No images yet. Click "Upload Images" to add photos.</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {galleryImages.map(image => (
          <div key={image.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="w-full h-32 bg-gray-100 overflow-hidden">
              <img src={image.url} alt={image.title || ''} className="w-full h-full object-cover" />
            </div>
            <div className="p-3">
              <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">{image.title}</h3>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">{new Date(image.uploadDate || image.upload_date).toLocaleDateString()}</span>
                <button onClick={async () => { await deleteGalleryImage(image.id); setGalleryImages(galleryImages.filter(g => g.id !== image.id)); }} className="text-red-600 hover:text-red-900"><Trash2 className="w-3 h-3" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // CONTACTS TAB
  // ══════════════════════════════════════════════════════════════════════════
  const renderContactsTab = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Contact Submissions</h2>
        <button onClick={() => {
          const rows = contacts.map((c: any) => ({ Name: c.name, Email: c.email, Phone: c.phone || '', Message: c.message, Date: new Date(c.contactDate || c.contact_date).toLocaleDateString() }));
          const ws = XLSX.utils.json_to_sheet(rows);
          const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Contacts');
          XLSX.writeFile(wb, 'contacts_export.xlsx');
        }} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center">
          <Download className="w-4 h-4 mr-2" />Export XLSX
        </button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {contacts.map((c: any) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{c.email}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{c.phone || 'N/A'}</td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{c.message}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(c.contactDate || c.contact_date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // SETTINGS TAB
  // ══════════════════════════════════════════════════════════════════════════
  const renderSettingsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Site Settings</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Site Logo</label>
          <div className="flex items-center space-x-4">
            <img src={logoUrl} alt="Logo" className="w-16 h-16 border border-gray-300 rounded object-contain" />
            <label className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />Change Logo
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            </label>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center">
          <Mail className="w-5 h-5 mr-2 text-primary-600" />Email Configuration
        </h3>
        <p className="text-sm text-gray-500 mb-4">SMTP server used to send registration confirmation emails.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {([['smtpHost','SMTP Host','smtp.gmail.com','text'],['smtpPort','SMTP Port','587','text'],['smtpUser','SMTP Username','your@email.com','email'],['smtpPass','SMTP Password','••••••••','password'],['fromEmail','From Email','noreply@cbkm.ca','email'],['fromName','From Name','CBKM Events','text']] as [keyof EmailConfig, string, string, string][]).map(([key, label, placeholder, type]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input type={type} value={emailConfig[key] || ''} placeholder={placeholder}
                onChange={e => setEmailConfig({ ...emailConfig, [key]: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
            </div>
          ))}
        </div>
        <button onClick={async () => { await setSetting('smtp_config', JSON.stringify(emailConfig)); showToast('Email configuration saved!'); }}
          className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center">
          <Save className="w-4 h-4 mr-2" />Save Email Config
        </button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center">
          <Mail className="w-5 h-5 mr-2 text-primary-600" />Notification Emails
        </h3>
        <p className="text-sm text-gray-500 mb-4">Email addresses that receive admin notifications (e.g. sponsorship inquiries). Add one per line.</p>
        <textarea
          rows={4}
          value={notificationEmails}
          onChange={e => setNotificationEmails(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
          placeholder={"admin@cbkm.ca\nsponsorship@cbkm.ca"}
        />
        <p className="text-xs text-gray-400 mt-1">One email address per line.</p>
        <button onClick={async () => { await setSetting('notification_emails', notificationEmails); showToast('Notification emails saved!'); }}
          className="mt-3 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center">
          <Save className="w-4 h-4 mr-2" />Save Notification Emails
        </button>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // EVENT MODAL
  // ══════════════════════════════════════════════════════════════════════════
  const EventModal = () => {
    const [eventData, setEventData] = useState<Event>(editingEvent || {
      id: '', name: '', image: '', description: '', poster: '', date: '', location: '',
      attendeeForm: [
        { id: '1', name: 'fullName', type: 'text', label: 'Full Name', required: true },
        { id: '2', name: 'email', type: 'email', label: 'Email', required: true },
        { id: '3', name: 'phone', type: 'phone', label: 'Phone Number', required: true },
        { id: '4', name: 'numberOfTickets', type: 'number', label: 'Number of Tickets', required: true },
        { id: '5', name: 'adults', type: 'number', label: 'Number of Adults', required: true },
        { id: '6', name: 'kidsAbove6', type: 'number', label: 'Kids > 6 years', required: false },
        { id: '7', name: 'kidsBelow6', type: 'number', label: 'Kids < 6 years', required: false },
      ],
      participantForm: [
        { id: '1', name: 'fullName', type: 'text', label: 'Full Name', required: true },
        { id: '2', name: 'email', type: 'email', label: 'Email', required: true },
        { id: '3', name: 'phone', type: 'phone', label: 'Phone Number', required: true },
        { id: '4', name: 'numberOfParticipants', type: 'number', label: 'Number of Participants', required: true },
        { id: '5', name: 'adults', type: 'number', label: 'Number of Adults', required: true },
        { id: '6', name: 'category', type: 'select', label: 'Performance Category', required: true, options: ['Music', 'Dance', 'Drama', 'Poetry', 'Other'] },
        { id: '7', name: 'performanceDetails', type: 'textarea', label: 'Performance Details', required: false },
      ],
    });
    const [activeFormTab, setActiveFormTab] = useState<'attendee' | 'participant'>('attendee');
    const [newOptionInputs, setNewOptionInputs] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [imageUploading, setImageUploading] = useState<'image' | 'poster' | null>(null);
    const [pdfUploading, setPdfUploading] = useState(false);

    const [pdfError, setPdfError] = useState('');
    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]; if (!file) return;
      if (file.size > 20 * 1024 * 1024) { setPdfError('Max PDF size is 20MB'); return; }
      setPdfError('');
      setPdfUploading(true);
      try {
        const url = await uploadFile(file, 'guidelines');
        setEventData(prev => ({ ...prev, guidelinesUrl: url }));
      } catch (err: any) { setPdfError('Upload failed: ' + (err?.message || err)); }
      setPdfUploading(false);
    };

    const addFormField = (ft: 'attendee' | 'participant') => {
      const f: FormField = { id: Date.now().toString(), name: '', type: 'text', label: '', required: false };
      if (ft === 'attendee') setEventData({ ...eventData, attendeeForm: [...(eventData.attendeeForm || []), f] });
      else setEventData({ ...eventData, participantForm: [...(eventData.participantForm || []), f] });
    };
    const removeFormField = (ft: 'attendee' | 'participant', id: string) => {
      if (ft === 'attendee') setEventData({ ...eventData, attendeeForm: eventData.attendeeForm?.filter(f => f.id !== id) || [] });
      else setEventData({ ...eventData, participantForm: eventData.participantForm?.filter(f => f.id !== id) || [] });
    };
    const updateFormField = (ft: 'attendee' | 'participant', id: string, updates: Partial<FormField>) => {
      const upd = (fields: FormField[]) => fields.map(f => f.id === id ? { ...f, ...updates } : f);
      if (ft === 'attendee') setEventData({ ...eventData, attendeeForm: upd(eventData.attendeeForm || []) });
      else setEventData({ ...eventData, participantForm: upd(eventData.participantForm || []) });
    };
    const addOption = (ft: 'attendee' | 'participant', fieldId: string) => {
      const val = newOptionInputs[fieldId]?.trim(); if (!val) return;
      const fields = ft === 'attendee' ? eventData.attendeeForm : eventData.participantForm;
      const field = fields?.find(f => f.id === fieldId); if (!field) return;
      updateFormField(ft, fieldId, { options: [...(field.options || []), val] });
      setNewOptionInputs({ ...newOptionInputs, [fieldId]: '' });
    };

    const handleImageUpload = (type: 'image' | 'poster') => async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]; if (!file) return;
      if (file.size > 10 * 1024 * 1024) { showToast('Max file size is 10MB', 'error'); return; }
      setImageUploading(type);
      try {
        const url = await uploadImage(file, 'events');
        setEventData(prev => type === 'image' ? { ...prev, image: url } : { ...prev, poster: url });
      } catch (err: any) { showToast('Upload failed: ' + (err?.message || err), 'error'); }
      setImageUploading(null);
    };

    const handleSave = async () => {
      if (!eventData.name || !eventData.date) { showToast('Name and date are required', 'error'); return; }
      const validateFields = (fields: FormField[], label: string) => {
        for (const f of fields) {
          if (!f.name.trim()) { showToast(`All ${label} form fields need a "Field Name" filled in`, 'error'); return false; }
        }
        const names = fields.map(f => f.name);
        const dupes = names.filter((n, i) => names.indexOf(n) !== i);
        if (dupes.length) { showToast(`Duplicate field names in ${label} form: ${Array.from(new Set(dupes)).join(', ')}`, 'error'); return false; }
        return true;
      };
      if (!validateFields(eventData.attendeeForm || [], 'Attendee') || !validateFields(eventData.participantForm || [], 'Participant')) return;
      // One-event-at-a-time voting check
      if (eventData.votingEnabled) {
        const conflict = events.find(e => e.votingEnabled && e.id !== editingEvent?.id);
        if (conflict) {
          const proceed = window.confirm(`"${conflict.name}" already has audience voting enabled. Only one event can have voting open at a time.\n\nDo you want to enable voting for this event instead? (This will disable it for "${conflict.name}")`);
          if (!proceed) return;
          await editEvent(conflict.id, { ...conflict, votingEnabled: false });
        }
      }
      setSaving(true);
      try {
        if (editingEvent) {
          await editEvent(editingEvent.id, eventData);
        } else {
          await addEvent(eventData);
        }
        setShowEventModal(false);
      } catch (err) { showToast('Save failed', 'error'); }
      setSaving(false);
    };

    const currentFields = activeFormTab === 'attendee' ? eventData.attendeeForm : eventData.participantForm;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]">

          {/* ── Header ── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-100 p-2 rounded-xl">
                <Calendar className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{editingEvent ? 'Edit Event' : 'New Event'}</h2>
                <p className="text-xs text-gray-400">{editingEvent ? 'Update event details below' : 'Fill in the event details below'}</p>
              </div>
            </div>
            <button onClick={() => setShowEventModal(false)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── Scrollable Body ── */}
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

            {/* Basic Info */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Basic Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Name <span className="text-red-500">*</span></label>
                  <input type="text" value={eventData.name} onChange={e => setEventData({ ...eventData, name: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" placeholder="e.g. Chithirai Vizha 2026" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Date <span className="text-red-500">*</span></label>
                  <input type="date" value={eventData.date} onChange={e => setEventData({ ...eventData, date: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                <input type="text" value={eventData.location} onChange={e => setEventData({ ...eventData, location: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" placeholder="Venue name & address" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea rows={3} value={eventData.description} onChange={e => setEventData({ ...eventData, description: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm resize-none" placeholder="Brief description of the event" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Adult Ticket Price (CAD)</label>
                  <input type="number" min="0" step="0.01" placeholder="0.00"
                    value={eventData.adultTicketPrice || ''}
                    onChange={e => setEventData(prev => ({ ...prev, adultTicketPrice: e.target.value === '' ? 0 : Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Kids Above 6 Ticket Price (CAD)</label>
                  <input type="number" min="0" step="0.01" placeholder="0.00"
                    value={eventData.kidsAbove6TicketPrice || ''}
                    onChange={e => setEventData(prev => ({ ...prev, kidsAbove6TicketPrice: e.target.value === '' ? 0 : Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" />
                </div>
              </div>
            </div>

            {/* Media */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Media</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Image</label>
                  {eventData.image && <img src={eventData.image} alt="" className="mb-2 h-28 w-full object-cover rounded-xl border border-gray-200" />}
                  <label className={`flex items-center justify-center w-full px-3 py-2.5 border-2 border-dashed rounded-xl cursor-pointer transition-colors text-sm ${imageUploading === 'image' ? 'border-primary-300 bg-primary-50 text-primary-600' : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50 text-gray-500'}`}>
                    {imageUploading === 'image' ? <><Loader className="w-4 h-4 mr-2 animate-spin" />Uploading...</> : <><Upload className="w-4 h-4 mr-2" />Choose image</>}
                    <input type="file" accept="image/*" disabled={imageUploading !== null} onChange={handleImageUpload('image')} className="hidden" />
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Poster</label>
                  {eventData.poster && <img src={eventData.poster} alt="" className="mb-2 h-28 w-full object-cover rounded-xl border border-gray-200" />}
                  <label className={`flex items-center justify-center w-full px-3 py-2.5 border-2 border-dashed rounded-xl cursor-pointer transition-colors text-sm ${imageUploading === 'poster' ? 'border-primary-300 bg-primary-50 text-primary-600' : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50 text-gray-500'}`}>
                    {imageUploading === 'poster' ? <><Loader className="w-4 h-4 mr-2 animate-spin" />Uploading...</> : <><Upload className="w-4 h-4 mr-2" />Choose poster</>}
                    <input type="file" accept="image/*" disabled={imageUploading !== null} onChange={handleImageUpload('poster')} className="hidden" />
                  </label>
                </div>
              </div>
              {/* Guidelines PDF */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
                  <FileText className="w-4 h-4 mr-1.5 text-primary-600" />Event Guidelines PDF
                  <span className="ml-2 text-xs text-gray-400 font-normal">(attached to confirmation emails)</span>
                </label>
                {eventData.guidelinesUrl && (
                  <div className="mb-2 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <a href={eventData.guidelinesUrl} target="_blank" rel="noreferrer" className="underline truncate flex-1">View uploaded PDF</a>
                    <button onClick={() => setEventData(prev => ({ ...prev, guidelinesUrl: '' }))}
                      className="text-red-500 hover:text-red-700 flex-shrink-0"><X className="w-4 h-4" /></button>
                  </div>
                )}
                <label className={`flex items-center justify-center w-full px-3 py-2.5 border-2 border-dashed rounded-xl cursor-pointer transition-colors text-sm ${pdfUploading ? 'border-primary-300 bg-primary-50 text-primary-600' : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50 text-gray-500'}`}>
                  {pdfUploading ? <><Loader className="w-4 h-4 mr-2 animate-spin" />Uploading PDF...</> : <><Upload className="w-4 h-4 mr-2" />Choose PDF (max 20MB)</>}
                  <input type="file" accept="application/pdf" disabled={pdfUploading} onChange={handlePdfUpload} className="hidden" />
                </label>
                {pdfError && <p className="text-xs text-red-500 mt-1">{pdfError}</p>}
              </div>
            </div>

            {/* Visibility & Access */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Visibility & Access</h3>
              {([
                { key: 'hidden', label: 'Hide event from website', desc: 'Event will not appear on the public events page' },
                { key: 'attendeeFormPaused', label: 'Pause ticket registration', desc: 'Attendee form will show a closed message' },
                { key: 'participantFormPaused', label: 'Pause participant registration', desc: 'Participant form will show a closed message' },
              ] as { key: keyof Event; label: string; desc: string }[]).map(({ key, label, desc }) => (
                <div key={key} className="flex items-start justify-between gap-4 bg-white rounded-xl border border-gray-200 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                  </div>
                  <button type="button"
                    onClick={() => setEventData(prev => ({ ...prev, [key]: !prev[key as keyof Event] }))}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${eventData[key] ? 'bg-primary-600' : 'bg-gray-200'}`}>
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${eventData[key] ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              ))}
            </div>

            {/* Voting Settings */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Audience Voting</h3>
              <div className="flex items-start justify-between gap-4 bg-white rounded-xl border border-gray-200 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">Enable audience voting</p>
                  <p className="text-xs text-gray-400 mt-0.5">Allows audience to vote on finalized performances at /vote</p>
                </div>
                <button type="button"
                  onClick={() => setEventData(prev => ({ ...prev, votingEnabled: !prev.votingEnabled }))}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${eventData.votingEnabled ? 'bg-primary-600' : 'bg-gray-200'}`}>
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${eventData.votingEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              {eventData.votingEnabled && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Voting Type</label>
                    <select value={eventData.votingType || 'choice'}
                      onChange={e => setEventData(prev => ({ ...prev, votingType: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                      <option value="choice">Single Choice — pick one performer</option>
                      <option value="stars">Star Rating — rate each 1–5 ★</option>
                      <option value="score">Score — give each 1–10 points</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Access Code <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input value={eventData.votingCode || ''} maxLength={10} placeholder="e.g. DANCE26"
                      onChange={e => setEventData(prev => ({ ...prev, votingCode: e.target.value.toUpperCase() }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono" />
                  </div>
                  <div className="col-span-2 flex items-start justify-between gap-4 bg-white rounded-xl border border-gray-200 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Publish results publicly</p>
                      <p className="text-xs text-gray-400 mt-0.5">Shows results at /results for the audience</p>
                    </div>
                    <button type="button"
                      onClick={() => setEventData(prev => ({ ...prev, resultsPublic: !prev.resultsPublic }))}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${eventData.resultsPublic ? 'bg-primary-600' : 'bg-gray-200'}`}>
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${eventData.resultsPublic ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-medium text-gray-500 mb-2">Voting Screen — Visible Fields</p>
                    <div className="space-y-2">
                      {([
                        { key: 'name', label: 'Participant Name' },
                        { key: 'number', label: 'Participant Number' },
                        { key: 'groupCategory', label: 'Group Category' },
                        { key: 'performanceCategory', label: 'Performance Category' },
                      ] as { key: keyof NonNullable<Event['votingDisplayFields']>; label: string }[]).map(({ key, label }) => {
                        const current = eventData.votingDisplayFields?.[key] !== false;
                        return (
                          <div key={key} className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-2.5">
                            <span className="text-sm text-gray-700">{label}</span>
                            <button type="button"
                              onClick={() => setEventData(prev => ({ ...prev, votingDisplayFields: { name: true, number: true, groupCategory: true, performanceCategory: true, ...(prev.votingDisplayFields || {}), [key]: !current } }))}
                              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${current ? 'bg-primary-600' : 'bg-gray-200'}`}>
                              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${current ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Registration Forms */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Registration Forms</h3>
              <div className="flex space-x-2">
                {(['attendee', 'participant'] as const).map(t => (
                  <button key={t} onClick={() => setActiveFormTab(t)}
                    className={`flex items-center px-4 py-2 rounded-xl font-medium text-sm transition-colors ${activeFormTab === t ? 'bg-primary-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
                    {t === 'attendee' ? <UserCheck className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                    {t.charAt(0).toUpperCase() + t.slice(1)} Form
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{currentFields?.length || 0} fields configured</span>
                  <button onClick={() => addFormField(activeFormTab)}
                    className="bg-primary-600 text-white px-3 py-1.5 rounded-xl hover:bg-primary-700 flex items-center text-sm font-medium">
                    <Plus className="w-4 h-4 mr-1" />Add Field
                  </button>
                </div>
                <div className="space-y-2">
                  {currentFields?.map(field => (
                    <div key={field.id} className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Field Name</label>
                          <input type="text" value={field.name} onChange={e => updateFormField(activeFormTab, field.id, { name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500" placeholder="field_name" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Label</label>
                          <input type="text" value={field.label} onChange={e => updateFormField(activeFormTab, field.id, { label: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500" placeholder="Display label" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                          <select value={field.type} onChange={e => updateFormField(activeFormTab, field.id, { type: e.target.value as any, options: e.target.value === 'select' ? [] : undefined })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500">
                            <option value="text">Text</option>
                            <option value="email">Email</option>
                            <option value="phone">Phone</option>
                            <option value="number">Number</option>
                            <option value="select">Select</option>
                            <option value="textarea">Textarea</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="flex items-center cursor-pointer">
                            <input type="checkbox" checked={field.required} onChange={e => updateFormField(activeFormTab, field.id, { required: e.target.checked })}
                              className="rounded border-gray-300 text-primary-600" />
                            <span className="ml-2 text-sm text-gray-600">Required</span>
                          </label>
                          <button onClick={() => removeFormField(activeFormTab, field.id)}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {field.type === 'select' && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <label className="block text-xs font-medium text-gray-500 mb-2">Dropdown Options</label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {(field.options || []).map(opt => (
                              <span key={opt} className="inline-flex items-center bg-primary-50 text-primary-700 border border-primary-200 text-xs px-2.5 py-1 rounded-full">
                                {opt}
                                <button onClick={() => updateFormField(activeFormTab, field.id, { options: (field.options || []).filter(o => o !== opt) })} className="ml-1.5 hover:text-red-500"><X className="w-3 h-3" /></button>
                              </span>
                            ))}
                          </div>
                          <div className="flex space-x-2">
                            <input type="text" value={newOptionInputs[field.id] || ''} onChange={e => setNewOptionInputs({ ...newOptionInputs, [field.id]: e.target.value })}
                              onKeyDown={e => e.key === 'Enter' && addOption(activeFormTab, field.id)}
                              className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white" placeholder="Add option, then press Enter" />
                            <button onClick={() => addOption(activeFormTab, field.id)} className="bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 text-sm"><Plus className="w-4 h-4" /></button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex-shrink-0">
            <button onClick={() => setShowEventModal(false)}
              className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 font-medium text-sm transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium text-sm flex items-center disabled:opacity-60 transition-colors shadow-sm">
              {saving ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {editingEvent ? 'Update Event' : 'Create Event'}
            </button>
          </div>

        </div>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SPONSOR MODAL
  // ══════════════════════════════════════════════════════════════════════════
  const SponsorModal = () => {
    const [data, setData] = useState<Omit<Sponsor, 'id'>>(
      editingSponsor
        ? { name: editingSponsor.name, logo: editingSponsor.logo, description: editingSponsor.description || '', website: editingSponsor.website || '', level: editingSponsor.level }
        : { name: '', logo: '', description: '', website: '', level: 'gold' }
    );
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
      setSaving(true);
      try {
        if (editingSponsor) {
          await updateSponsor(editingSponsor.id, data);
          setSponsors(sponsors.map(s => s.id === editingSponsor.id ? { ...data, id: editingSponsor.id } : s));
        } else {
          const created = await createSponsor(data);
          setSponsors(prev => [...prev, created]);
        }
        setShowSponsorModal(false);
      } catch { showToast('Save failed', 'error'); }
      setSaving(false);
    };

    const levelColors: Record<string, string> = {
      platinum: 'bg-purple-50 border-purple-200 text-purple-700',
      gold: 'bg-yellow-50 border-yellow-200 text-yellow-700',
      silver: 'bg-gray-50 border-gray-200 text-gray-700',
      bronze: 'bg-orange-50 border-orange-200 text-orange-700',
    };

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-100 p-2 rounded-xl">
                <HandHeart className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{editingSponsor ? 'Edit Sponsor' : 'Add Sponsor'}</h2>
                <p className="text-xs text-gray-400">{editingSponsor ? 'Update sponsor details' : 'Add a new sponsor'}</p>
              </div>
            </div>
            <button onClick={() => setShowSponsorModal(false)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Sponsor Name <span className="text-red-500">*</span></label>
                <input type="text" value={data.name} onChange={e => setData({ ...data, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  placeholder="Company or organization name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Sponsorship Level</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['platinum','gold','silver','bronze'] as const).map(lvl => (
                    <button key={lvl} onClick={() => setData({ ...data, level: lvl })}
                      className={`px-3 py-2 rounded-xl border text-sm font-medium capitalize transition-all ${data.level === lvl ? levelColors[lvl] + ' ring-2 ring-offset-1 ring-current' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
                <input type="url" value={data.website} onChange={e => setData({ ...data, website: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  placeholder="https://example.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description <span className="text-xs text-gray-400">(HTML supported)</span></label>
              <textarea rows={3} value={data.description} onChange={e => setData({ ...data, description: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm resize-none"
                placeholder="Brief description of the sponsor" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Logo</label>
              <div className="flex items-center gap-3">
                {data.logo ? (
                  <div className="relative">
                    <img src={data.logo} alt="Logo" className="w-20 h-14 object-contain border border-gray-200 rounded-xl bg-gray-50 p-1" />
                    <button onClick={() => setData({ ...data, logo: '' })}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-14 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center">
                    <Image className="w-5 h-5 text-gray-300" />
                  </div>
                )}
                <label className="flex items-center px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 cursor-pointer text-sm font-medium transition-colors">
                  <Upload className="w-4 h-4 mr-2" />Upload Logo
                  <input type="file" accept="image/*" className="hidden" onChange={async e => {
                    const file = e.target.files?.[0]; if (!file) return;
                    try { const url = await uploadImage(file, 'sponsors'); setData(d => ({ ...d, logo: url })); } catch { showToast('Upload failed', 'error'); }
                  }} />
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <button onClick={() => setShowSponsorModal(false)}
              className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 font-medium text-sm transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium text-sm flex items-center disabled:opacity-60 transition-colors shadow-sm">
              {saving && <Loader className="w-4 h-4 mr-2 animate-spin" />}{editingSponsor ? 'Update Sponsor' : 'Add Sponsor'}
            </button>
          </div>
        </div>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // EDIT REGISTRATION MODAL
  // ══════════════════════════════════════════════════════════════════════════
  const EditRegistrationModal = () => {
    const r = editingRegistration!;
    const [form, setForm] = useState<Registration>({ ...r });
    const [saving, setSaving] = useState(false);
    const set = (k: keyof Registration, v: any) => setForm(f => ({ ...f, [k]: v }));
    const setCustom = (key: string, val: string) => setForm(f => ({ ...f, customFields: { ...(f.customFields || {}), [key]: val } }));

    const isAttendee = form.type === 'attendee';
    const regEvent = events.find(e => e.id === r.eventId);

    // Standard field names already rendered explicitly — skip them in custom fields section
    const STANDARD = new Set(['fullName', 'name', 'email', 'phone', 'phoneNumber', 'address',
      'numberOfTickets', 'adults', 'kidsAbove6', 'kidsBelow6',
      'numberOfParticipants', 'category', 'performanceDetails', 'specialRequirements']);

    // Custom fields from the event's form that aren't standard
    const eventForm = isAttendee ? (regEvent?.attendeeForm || []) : (regEvent?.participantForm || []);
    const customFormFields = eventForm.filter(f => f.name && !STANDARD.has(f.name));

    // Category field (select or fallback to defaults)
    const categoryField = regEvent?.participantForm?.find(f => f.name === 'category')
      || regEvent?.participantForm?.find(f => f.type === 'select' && f.label?.toLowerCase().includes('category'));

    const handleSave = async () => {
      setSaving(true);
      try {
        const updated = await updateRegistration(r.id, form);
        setRegistrations(prev => prev.map(x => x.id === r.id ? updated : x));
        setEditingRegistration(null);
        showToast('Registration updated');
      } catch { showToast('Update failed', 'error'); }
      setSaving(false);
    };

    const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent';

    const stdField = (label: string, k: keyof Registration, type = 'text') => (
      <div key={k}>
        <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
        <input type={type} value={(form[k] as any) ?? ''} onChange={e => set(k, type === 'number' ? Number(e.target.value) : e.target.value)}
          className={inputCls} />
      </div>
    );

    const renderCustomField = (f: { id: string; name: string; type: string; label: string; options?: string[] }) => {
      const val = form.customFields?.[f.name] || '';
      if (f.type === 'select') {
        const opts = f.options || [];
        const allOpts = val && !opts.includes(val) ? [val, ...opts] : opts;
        return (
          <div key={f.id}>
            <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
            <select value={val} onChange={e => setCustom(f.name, e.target.value)} className={inputCls + ' bg-gray-50'}>
              <option value="">Select...</option>
              {allOpts.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        );
      }
      if (f.type === 'textarea') {
        return (
          <div key={f.id} className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
            <textarea rows={2} value={val} onChange={e => setCustom(f.name, e.target.value)} className={inputCls + ' resize-none'} />
          </div>
        );
      }
      return (
        <div key={f.id}>
          <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
          <input type={f.type === 'number' ? 'number' : f.type === 'email' ? 'email' : 'text'}
            value={val} onChange={e => setCustom(f.name, e.target.value)} className={inputCls} />
        </div>
      );
    };

    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-lg font-bold text-gray-900">Edit Registration</h2>
            <button onClick={() => setEditingRegistration(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="overflow-y-auto p-6 space-y-3">

            {/* Registration type */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Registration Type</label>
              <select value={form.type} onChange={e => set('type', e.target.value as 'attendee' | 'participant')}
                className={inputCls + ' bg-gray-50'}>
                <option value="attendee">Attendee</option>
                <option value="participant">Participant</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {stdField('Full Name', 'name')}
              {stdField('Email', 'email', 'email')}
              {stdField('Phone', 'phone')}
              {stdField('Address', 'address')}

              {isAttendee ? (<>
                {stdField('# Tickets', 'numberOfTickets', 'number')}
                {stdField('Adults', 'adults', 'number')}
                {stdField('Kids (above 6)', 'kidsAbove6', 'number')}
                {stdField('Kids (below 6)', 'kidsBelow6', 'number')}
              </>) : (<>
                {stdField('# Participants', 'numberOfParticipants', 'number')}
                {stdField('Adults', 'adults', 'number')}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                  {(() => {
                    const base = categoryField?.type === 'select' && (categoryField.options || []).length > 0
                      ? categoryField.options!
                      : ['Music', 'Dance', 'Drama', 'Poetry', 'Other'];
                    const opts = form.category && !base.includes(form.category) ? [form.category, ...base] : base;
                    return (
                      <select value={form.category || ''} onChange={e => set('category', e.target.value)}
                        className={inputCls + ' bg-gray-50'}>
                        <option value="">Select category...</option>
                        {opts.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    );
                  })()}
                </div>
              </>)}

              {/* Custom fields from event form */}
              {customFormFields.map(f => renderCustomField(f))}
            </div>

            {!isAttendee && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Performance Details</label>
                <textarea rows={2} value={form.performanceDetails || ''} onChange={e => set('performanceDetails', e.target.value)}
                  className={inputCls + ' resize-none'} />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Special Requirements</label>
              <textarea rows={2} value={form.specialRequirements || ''} onChange={e => set('specialRequirements', e.target.value)}
                className={inputCls + ' resize-none'} />
            </div>
          </div>
          <div className="flex space-x-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 bg-primary-600 text-white px-4 py-2.5 rounded-xl hover:bg-primary-700 font-semibold text-sm flex items-center justify-center disabled:opacity-60">
              {saving && <Loader className="w-4 h-4 mr-2 animate-spin" />}<Save className="w-4 h-4 mr-2" />Save Changes
            </button>
            <button onClick={() => setEditingRegistration(null)}
              className="flex-1 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 font-semibold text-sm">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIDE PANEL
  // ══════════════════════════════════════════════════════════════════════════
  const SidePanel = () => {
    if (!sidePanelRecord) return null;
    const r = sidePanelRecord;
    const event = events.find(e => e.id === r.eventId);
    const fields = r.type === 'attendee'
      ? [{ label: 'Event', value: event?.name }, { label: 'Year', value: new Date(r.registrationDate).getFullYear() }, { label: 'Name', value: r.name }, { label: 'Email', value: r.email }, { label: 'Phone', value: r.phone }, { label: 'Registration Date', value: new Date(r.registrationDate).toLocaleDateString() }, { label: '# Tickets', value: r.numberOfTickets }, { label: 'Adults', value: r.adults }, { label: 'Kids >6', value: r.kidsAbove6 }, { label: 'Kids <6', value: r.kidsBelow6 }, { label: 'Special Requirements', value: r.specialRequirements }]
      : [{ label: 'Event', value: event?.name }, { label: 'Year', value: new Date(r.registrationDate).getFullYear() }, { label: 'Name', value: r.name }, { label: 'Email', value: r.email }, { label: 'Phone', value: r.phone }, { label: 'Registration Date', value: new Date(r.registrationDate).toLocaleDateString() }, { label: '# Participants', value: r.numberOfParticipants }, { label: 'Adults', value: r.adults }, { label: 'Category', value: r.category }, { label: 'Performance Details', value: r.performanceDetails }, { label: 'Special Requirements', value: r.specialRequirements }];
    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-20 z-30" onClick={() => setSidePanelRecord(null)} />
        <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl z-40 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h3 className="font-bold text-gray-900">{r.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.type === 'attendee' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{r.type}</span>
            </div>
            <button onClick={() => setSidePanelRecord(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {fields.filter(f => f.value !== undefined && f.value !== '').map(f => (
              <div key={f.label} className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">{f.label}</span>
                <span className="text-sm font-medium text-gray-900 text-right max-w-xs">{String(f.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-50" onClick={() => { setShowAttendeeColMenu(false); setShowParticipantColMenu(false); }}>
      <header className="bg-charcoal-800 shadow-sm border-b border-charcoal-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img src={logoUrl} alt="CBKM Logo" className="w-8 h-8 object-contain rounded-full border border-primary-500" />
              <h1 className="text-xl font-bold text-primary-400">Admin Portal</h1>
            </div>
            <button onClick={onLogout} className="flex items-center text-gray-300 hover:text-primary-400 transition-colors">
              <LogOut className="w-4 h-4 mr-2" />Logout
            </button>
          </div>
        </div>
      </header>

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab.id ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" /><span>{tab.name}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'events' && renderEventsTab()}
        {activeTab === 'attendees' && renderAttendeesTab()}
        {activeTab === 'participants' && renderParticipantsTab()}
        {activeTab === 'voting' && <VotingTab />}
        {activeTab === 'sponsors' && renderSponsorsTab()}
        {activeTab === 'gallery' && renderGalleryTab()}
        {activeTab === 'contacts' && renderContactsTab()}
        {activeTab === 'blog' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Blog Management</h2>
              <button onClick={() => { setEditingBlog(null); setShowBlogModal(true); }}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center">
                <Plus className="w-4 h-4 mr-2" />New Post
              </button>
            </div>
            {blogs.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No blog posts yet. Click "New Post" to create one.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map(blog => (
                  <div key={blog.id} className="bg-white rounded-lg shadow overflow-hidden">
                    {blog.image && <img src={blog.image} alt={blog.title} className="w-full h-40 object-cover" />}
                    <div className="p-4">
                      <div className="flex items-center text-xs text-gray-400 mb-2 space-x-2">
                        <span>{blog.author}</span><span>·</span>
                        <span>{new Date(blog.publishDate).toLocaleDateString()}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{blog.title}</h3>
                      <div className="text-sm text-gray-500 line-clamp-3 prose prose-sm mb-3"
                        dangerouslySetInnerHTML={{ __html: blog.description }} />
                      <div className="flex space-x-2">
                        <button onClick={() => { setEditingBlog(blog); setShowBlogModal(true); }}
                          className="flex-1 bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 flex items-center justify-center text-sm">
                          <Edit className="w-3 h-3 mr-1" />Edit
                        </button>
                        <button onClick={() => showConfirm('Delete this post?', async () => { await deleteBlog(blog.id); setBlogs(prev => prev.filter(b => b.id !== blog.id)); })}
                          className="flex-1 border border-red-300 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 flex items-center justify-center text-sm">
                          <Trash2 className="w-3 h-3 mr-1" />Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'settings' && renderSettingsTab()}
      </main>

      {/* Toast notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[100] flex items-center space-x-3 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium transition-all ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
          {toast.type === 'error'
            ? <X className="w-4 h-4 flex-shrink-0" />
            : <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          }
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Confirm dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black/50 z-[90] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm</h3>
            <p className="text-gray-600 mb-6 text-sm">{confirmDialog.msg}</p>
            <div className="flex space-x-3">
              <button onClick={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 font-semibold text-sm">
                Delete
              </button>
              <button onClick={() => setConfirmDialog(null)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 font-semibold text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {editingRegistration && <EditRegistrationModal />}
      {showEventModal && <EventModal />}
      {showSponsorModal && <SponsorModal />}
      {showBlogModal && (
        <BlogModal
          editingBlog={editingBlog}
          onClose={() => setShowBlogModal(false)}
          onSaved={(blog, isNew) => {
            if (isNew) setBlogs(prev => [...prev, blog]);
            else setBlogs(prev => prev.map(b => b.id === blog.id ? blog : b));
          }}
        />
      )}
      <SidePanel />
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// ATTENDEE / PARTICIPANT CONFIG
// ══════════════════════════════════════════════════════════════════════════
interface ConfigProps { type: 'attendee' | 'participant'; emailConfig: FormEmailConfig; onSave: (cfg: FormEmailConfig) => void; }
const AttendeeParticipantConfig: React.FC<ConfigProps> = ({ type, emailConfig, onSave }) => {
  const [cfg, setCfg] = useState<FormEmailConfig>(emailConfig);
  useEffect(() => { setCfg(emailConfig); }, [emailConfig]);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const insertTag = (tag: string) => {
    const ta = document.getElementById(`email-body-${type}`) as HTMLTextAreaElement | null;
    if (!ta) { setCfg(c => ({ ...c, body: c.body + tag })); return; }
    const start = ta.selectionStart, end = ta.selectionEnd;
    const newVal = cfg.body.substring(0, start) + tag + cfg.body.substring(end);
    setCfg(c => ({ ...c, body: newVal }));
    setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + tag.length; ta.focus(); }, 0);
  };

  const attendeeVars = ['{{name}}','{{email}}','{{phone}}','{{event}}','{{date}}','{{location}}','{{tickets}}','{{adults}}','{{kidsAbove6}}','{{kidsBelow6}}','{{totalAmount}}'];
  const participantVars = ['{{name}}','{{email}}','{{phone}}','{{event}}','{{date}}','{{location}}','{{participants}}','{{adults}}','{{category}}','{{performanceDetails}}'];
  const vars = type === 'attendee' ? attendeeVars : participantVars;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 capitalize">{type} Configuration</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center">
          <Mail className="w-5 h-5 mr-2 text-primary-600" />Confirmation Email
        </h3>
        <p className="text-sm text-gray-500 mb-4">Sent when a {type} submits registration. Supports HTML tags. Uses SMTP from Settings.</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Subject</label>
            <input type="text" value={cfg.subject} onChange={e => setCfg({ ...cfg, subject: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder={type === 'attendee' ? 'Registration Confirmed – {{event}}' : 'Participant Registration Confirmed – {{event}}'} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Email Body (HTML supported)</label>
              <button onClick={() => setShowPreview(!showPreview)}
                className="flex items-center text-xs text-primary-600 hover:text-primary-800">
                {showPreview ? <><EyeOff className="w-3 h-3 mr-1" />Edit</> : <><Eye className="w-3 h-3 mr-1" />Preview</>}
              </button>
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {vars.map(v => (
                <button key={v} onClick={() => insertTag(v)}
                  className="text-xs bg-gray-100 hover:bg-primary-50 border border-gray-200 hover:border-primary-300 text-gray-600 hover:text-primary-700 px-2 py-0.5 rounded font-mono">
                  {v}
                </button>
              ))}
            </div>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="flex bg-gray-50 border-b border-gray-200 px-2 py-1 gap-1">
                {[['<b>Bold</b>','<b></b>'],['<i>Italic</i>','<i></i>'],['<u>Underline</u>','<u></u>'],['<br>','<br>'],['<ul><li></li></ul>','<ul>\n  <li></li>\n</ul>']].map(([label, tag]) => (
                  <button key={label} onClick={() => insertTag(tag)}
                    className="text-xs bg-white border border-gray-200 hover:bg-gray-100 px-2 py-0.5 rounded"
                    dangerouslySetInnerHTML={{ __html: label }} />
                ))}
              </div>
              {showPreview ? (
                <div className="p-4 min-h-[200px] prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: cfg.body }} />
              ) : (
                <textarea id={`email-body-${type}`} rows={12} value={cfg.body}
                  onChange={e => setCfg({ ...cfg, body: e.target.value })}
                  className="w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm resize-y" />
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center"><Paperclip className="w-4 h-4 mr-1" />Attachment</label>
            <div className="flex items-center space-x-3">
              <label className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center">
                <Upload className="w-4 h-4 mr-2" />Choose File
                <input type="file" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { setAttachmentFile(f); setCfg({ ...cfg, attachmentName: f.name }); } }} />
              </label>
              {(attachmentFile || cfg.attachmentName) && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Paperclip className="w-4 h-4" />
                  <span>{attachmentFile?.name || cfg.attachmentName}</span>
                  <button onClick={() => { setAttachmentFile(null); setCfg({ ...cfg, attachmentName: '' }); }} className="text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
                </div>
              )}
            </div>
          </div>
        </div>
        <button onClick={() => onSave(cfg)} className="mt-6 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center">
          <Save className="w-4 h-4 mr-2" />Save Configuration
        </button>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// BLOG MODAL (defined outside AdminDashboard to avoid re-mounting on parent render)
// ══════════════════════════════════════════════════════════════════════════
interface BlogModalProps {
  editingBlog: Blog | null;
  onClose: () => void;
  onSaved: (blog: Blog, isNew: boolean) => void;
}
const BlogModal: React.FC<BlogModalProps> = ({ editingBlog, onClose, onSaved }) => {
  const [blogError, setBlogError] = useState('');
  const [data, setData] = useState<Omit<Blog,'id'>>({
    title: editingBlog?.title || '',
    description: editingBlog?.description || '',
    image: editingBlog?.image || '',
    author: editingBlog?.author || '',
    publishDate: editingBlog?.publishDate || new Date().toISOString().split('T')[0],
  });
  const [saving, setSaving] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [tags, setTags] = useState('');

  const insertTag = (tag: string) => {
    const ta = document.getElementById('blog-body') as HTMLTextAreaElement | null;
    if (!ta) { setData(d => ({ ...d, description: d.description + tag })); return; }
    const s = ta.selectionStart, e = ta.selectionEnd;
    const v = data.description.substring(0, s) + tag + data.description.substring(e);
    setData(d => ({ ...d, description: v }));
    setTimeout(() => { ta.selectionStart = ta.selectionEnd = s + tag.length; ta.focus(); }, 0);
  };

  const handleSave = async () => {
    if (!data.title.trim()) { setBlogError('Title is required'); return; }
    setSaving(true);
    try {
      if (editingBlog) {
        await updateBlog(editingBlog.id, data);
        onSaved({ ...data, id: editingBlog.id }, false);
      } else {
        const created = await createBlog(data);
        onSaved(created, true);
      }
      onClose();
    } catch (err: any) { setBlogError('Save failed: ' + err?.message); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center p-4 py-8">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">{editingBlog ? 'Edit Post' : 'New Blog Post'}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input type="text" value={data.title} onChange={e => setData(d => ({ ...d, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Post title (HTML supported)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                <input type="text" value={data.author} onChange={e => setData(d => ({ ...d, author: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Publish Date</label>
                <input type="date" value={data.publishDate?.split('T')[0] || ''} onChange={e => setData(d => ({ ...d, publishDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <input type="text" value={tags} onChange={e => setTags(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="culture, events, music" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                <div className="flex items-center space-x-2">
                  {data.image && <img src={data.image} alt="" className="w-16 h-10 object-cover rounded border" />}
                  <label className="border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center text-sm">
                    {imgUploading ? <><Loader className="w-3 h-3 mr-1 animate-spin" />Uploading...</> : <><Upload className="w-3 h-3 mr-1" />Upload</>}
                    <input type="file" accept="image/*" className="hidden" disabled={imgUploading} onChange={async e => {
                      const f = e.target.files?.[0]; if (!f) return;
                      setImgUploading(true);
                      try { const url = await uploadImage(f, 'blogs'); setData(d => ({ ...d, image: url })); }
                      catch (err: any) { setBlogError('Upload failed: ' + err?.message); }
                      setImgUploading(false);
                    }} />
                  </label>
                  {data.image && <button onClick={() => setData(d => ({ ...d, image: '' }))} className="text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Post Content (HTML supported) *</label>
                <button onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center text-xs text-primary-600 hover:text-primary-800">
                  {showPreview ? <><EyeOff className="w-3 h-3 mr-1" />Edit</> : <><Eye className="w-3 h-3 mr-1" />Preview</>}
                </button>
              </div>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex flex-wrap bg-gray-50 border-b border-gray-200 px-2 py-1 gap-1">
                  {[
                    ['<b>B</b>','<b></b>'], ['<i>I</i>','<i></i>'], ['<u>U</u>','<u></u>'],
                    ['H1','<h1></h1>'], ['H2','<h2></h2>'], ['H3','<h3></h3>'],
                    ['<li>List</li>','<ul>\n  <li></li>\n</ul>'], ['1. List','<ol>\n  <li></li>\n</ol>'],
                    ['Link','<a href=""></a>'], ['<hr>','<hr>'], ['BR','<br>'],
                    ['<blockquote>Quote</blockquote>','<blockquote></blockquote>'],
                  ].map(([label, tag]) => (
                    <button key={label} onClick={() => insertTag(tag)}
                      className="text-xs bg-white border border-gray-200 hover:bg-gray-100 px-2 py-0.5 rounded font-mono"
                      dangerouslySetInnerHTML={{ __html: label }} />
                  ))}
                </div>
                {showPreview ? (
                  <div className="p-4 min-h-[300px] prose max-w-none" dangerouslySetInnerHTML={{ __html: data.description }} />
                ) : (
                  <textarea id="blog-body" rows={16} value={data.description}
                    onChange={e => setData(d => ({ ...d, description: e.target.value }))}
                    className="w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm resize-y" />
                )}
              </div>
            </div>
          </div>
          {blogError && <div className="mx-6 mb-0 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">{blogError}</div>}
          <div className="flex space-x-3 p-6 border-t">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 font-semibold disabled:opacity-60 flex items-center justify-center">
              {saving ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {editingBlog ? 'Update Post' : 'Publish Post'}
            </button>
            <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
