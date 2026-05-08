import React, { useState, useEffect } from 'react';
import { HandHeart, Star, Globe, Mail, X, Send, ArrowRight } from 'lucide-react';
import { fetchSponsors } from '../lib/db/sponsors';
import { getSettings } from '../lib/db/settings';
import { createContact } from '../lib/db/contacts';
import { useSponsorship } from '../context/SponsorshipContext';

interface Sponsor { id: string; name: string; level: string; description: string; website?: string; logo?: string; }
interface SponsorLevel { key: string; label: string; amount: string; benefits: string[]; }

const tierIcons: Record<string, string> = { platinum: '★', gold: '★', silver: '◈', bronze: '◉', community: '◎' };
const tierColors: Record<string, { bg: string; border: string; badge: string; badgeText: string }> = {
  platinum: { bg: 'rgba(51,51,51,0.04)', border: 'rgba(51,51,51,0.2)', badge: '#333', badgeText: '#fff' },
  gold:     { bg: 'rgba(201,168,76,0.06)', border: 'rgba(201,168,76,0.25)', badge: '#C9A84C', badgeText: '#1a1a1a' },
  silver:   { bg: 'rgba(128,128,128,0.04)', border: 'rgba(128,128,128,0.2)', badge: '#888', badgeText: '#fff' },
  bronze:   { bg: 'rgba(139,26,26,0.04)', border: 'rgba(139,26,26,0.15)', badge: '#8B1A1A', badgeText: '#fff' },
};
const getTierColor = (key: string) => tierColors[key] || tierColors['bronze'];

const defaultLevels: SponsorLevel[] = [
  { key: 'platinum', label: 'Platinum', amount: '$5,000+', benefits: ['All Gold benefits', 'Title sponsorship', 'VIP event access'] },
  { key: 'gold',     label: 'Gold',     amount: '$2,500 - $4,999', benefits: ['All Silver benefits', 'Banner placement at events', 'Sponsor booth space'] },
  { key: 'silver',   label: 'Silver',   amount: '$1,000 - $2,499', benefits: ['All Bronze benefits', 'Logo on event materials', 'Verbal recognition at events'] },
  { key: 'bronze',   label: 'Bronze',   amount: '$500 - $999',     benefits: ['Logo on website', 'Social media mention', 'Event recognition'] },
];

const Sponsorship: React.FC = () => {
  const { sponsorshipContact } = useSponsorship();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [levels, setLevels] = useState<SponsorLevel[]>(defaultLevels);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState('');

  useEffect(() => {
    fetchSponsors().then(data => setSponsors(data as Sponsor[])).catch(() => {});
    getSettings(['sponsorship_levels']).then(s => {
      if (s['sponsorship_levels']) {
        try { setLevels(JSON.parse(s['sponsorship_levels'])); } catch {}
      }
    }).catch(() => {});
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSendError('');
    try {
      await createContact({ name: contactForm.name, email: contactForm.email, phone: '', message: `[Sponsorship Inquiry] ${contactForm.message}` });
      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: contactForm.name, email: contactForm.email, message: contactForm.message }),
      }).catch(() => {});
      setSent(true);
    } catch {
      setSendError('Failed to send. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="py-24 animate-fade-in" style={{ background: 'linear-gradient(160deg, #111, #1a1a1a)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="section-label">Partner With Us</span>
          <h1 className="mt-4 text-white font-bold font-serif" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', letterSpacing: '-0.01em' }}>
            <em style={{ color: '#C9A84C', fontStyle: 'italic' }}>Sponsorship</em>
          </h1>
          <div className="divider center" style={{ marginTop: '1.5rem' }} />
          <p className="text-lg leading-[1.8]" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Support Tamil culture and community in Calgary — and grow your brand with a dedicated audience
          </p>
        </div>
      </section>

      {/* Why Sponsor */}
      <section className="py-24" style={{ background: 'var(--surface-alt)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="section-label">Why Sponsor</span>
            <h2 className="mt-3 font-bold font-serif" style={{ fontSize: 'clamp(2rem, 3vw, 2.8rem)', letterSpacing: '-0.01em', color: 'var(--text)' }}>
              Make an <em style={{ color: '#C9A84C', fontStyle: 'italic' }}>Impact</em>
            </h2>
            <div className="divider center" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {[
              ['500+', 'Community Members'],
              ['3+', 'Events Per Year'],
              ['18+', 'Years of Service'],
              ['100%', 'Community Focused'],
            ].map(([num, label]) => (
              <div key={label} className="text-center rounded-2xl p-6 card-hover"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="text-2xl font-bold mb-1 font-serif" style={{ color: '#C9A84C' }}>{num}</div>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <button onClick={() => setShowContactModal(true)} className="btn btn-primary inline-flex items-center">
              Contact Us About Sponsorship <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Current Sponsors */}
      {sponsors.length > 0 && (
        <section className="py-24" style={{ background: 'var(--surface)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="section-label">Thank You</span>
              <h2 className="mt-3 font-bold font-serif" style={{ fontSize: 'clamp(2rem, 3vw, 2.8rem)', letterSpacing: '-0.01em', color: 'var(--text)' }}>
                Our Valued <em style={{ color: '#C9A84C', fontStyle: 'italic' }}>Sponsors</em>
              </h2>
              <div className="divider center" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sponsors.map((sponsor) => {
                const c = getTierColor(sponsor.level);
                return (
                  <div key={sponsor.id} className="rounded-2xl overflow-hidden card-hover"
                    style={{ background: 'var(--surface)', border: `2px solid ${c.border}` }}>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-24 h-16 rounded-xl flex items-center justify-center overflow-hidden"
                          style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)' }}>
                          {sponsor.logo
                            ? <img src={sponsor.logo} alt={sponsor.name} className="w-full h-full object-contain p-1" />
                            : <span style={{ color: 'var(--text-muted)', opacity: 0.4 }} className="text-xs">Logo</span>}
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{ background: c.badge, color: c.badgeText }}>
                          {sponsor.level.charAt(0).toUpperCase() + sponsor.level.slice(1)}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>{sponsor.name}</h3>
                      <div className="prose prose-sm max-w-none mb-4 leading-[1.8]" style={{ color: 'var(--text-muted)' }}
                        dangerouslySetInnerHTML={{ __html: sponsor.description }} />
                      {sponsor.website && (
                        <a href={sponsor.website} target="_blank" rel="noopener noreferrer"
                          className="flex items-center text-sm font-semibold hover:opacity-75 transition-opacity" style={{ color: '#C9A84C' }}>
                          <Globe className="w-4 h-4 mr-1" />Website
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Sponsorship Levels */}
      <section className="py-24" style={{ background: sponsors.length > 0 ? 'var(--surface-alt)' : 'var(--surface)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="section-label">Packages</span>
            <h2 className="mt-3 font-bold font-serif" style={{ fontSize: 'clamp(2rem, 3vw, 2.8rem)', letterSpacing: '-0.01em', color: 'var(--text)' }}>
              Sponsorship <em style={{ color: '#C9A84C', fontStyle: 'italic' }}>Levels</em>
            </h2>
            <div className="divider center" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {levels.map(lvl => {
              const c = getTierColor(lvl.key);
              return (
                <div key={lvl.key} className="rounded-2xl p-6 text-center card-hover"
                  style={{ background: c.bg, border: `2px solid ${c.border}` }}>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"
                    style={{ background: c.badge, color: c.badgeText }}>
                    {tierIcons[lvl.key] || '◎'}
                  </div>
                  <h3 className="text-xl font-semibold mb-1" style={{ color: 'var(--text)' }}>{lvl.label}</h3>
                  <p className="font-bold mb-4" style={{ color: '#C9A84C' }}>{lvl.amount}</p>
                  <ul className="text-sm text-left space-y-2 leading-[1.8]" style={{ color: 'var(--text-muted)' }}>
                    {lvl.benefits.filter(b => b.trim()).map((b, i) => <li key={i}>✓ {b}</li>)}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Custom Partnership CTA */}
      <section className="py-24" style={{ background: 'linear-gradient(160deg, #111, #1a1a1a)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="section-label">Get Started</span>
          <h2 className="mt-3 font-bold font-serif text-white" style={{ fontSize: 'clamp(2rem, 3vw, 2.8rem)', letterSpacing: '-0.01em' }}>
            Interested in <em style={{ color: '#C9A84C', fontStyle: 'italic' }}>Sponsoring?</em>
          </h2>
          <div className="divider center" />
          <p className="mb-8 leading-[1.8]" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Contact our sponsorship team to learn more about partnership opportunities
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href={`mailto:${sponsorshipContact.email}`}
              className="flex items-center font-semibold hover:opacity-75 transition-opacity" style={{ color: '#C9A84C' }}>
              <Mail className="w-5 h-5 mr-2" />{sponsorshipContact.email}
            </a>
            <button onClick={() => setShowContactModal(true)} className="btn btn-outline-crimson">
              Talk to Us
            </button>
          </div>
        </div>
      </section>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl shadow-2xl w-full max-w-md"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <div>
                <h2 className="text-xl font-bold font-serif" style={{ color: 'var(--text)', letterSpacing: '-0.01em' }}>Sponsorship Inquiry</h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>We'll get back to you shortly</p>
              </div>
              <button onClick={() => { setShowContactModal(false); setSent(false); setSendError(''); }}
                className="p-2 rounded-xl hover:opacity-70 transition-opacity" style={{ color: 'var(--text-muted)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {sent ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(34,197,94,0.1)' }}>
                    <svg className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text)' }}>Message Sent!</h3>
                  <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Thank you for your interest. We'll be in touch soon.</p>
                  <button onClick={() => { setShowContactModal(false); setSent(false); }}
                    className="text-sm font-medium hover:underline" style={{ color: '#C9A84C' }}>Close</button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Your Name</label>
                    <input type="text" required value={contactForm.name}
                      onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-4 py-2.5 border rounded-xl text-sm"
                      style={{ borderColor: 'var(--border)', background: 'var(--surface-alt)', color: 'var(--text)' }}
                      placeholder="Full name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Email Address</label>
                    <input type="email" required value={contactForm.email}
                      onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full px-4 py-2.5 border rounded-xl text-sm"
                      style={{ borderColor: 'var(--border)', background: 'var(--surface-alt)', color: 'var(--text)' }}
                      placeholder="you@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Message</label>
                    <textarea rows={4} required value={contactForm.message}
                      onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                      className="w-full px-4 py-2.5 border rounded-xl text-sm resize-none"
                      style={{ borderColor: 'var(--border)', background: 'var(--surface-alt)', color: 'var(--text)' }}
                      placeholder="Tell us about your business and sponsorship interest..." />
                  </div>
                  {sendError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-sm">{sendError}</div>
                  )}
                  <button type="submit" disabled={sending}
                    className="btn btn-primary w-full flex items-center justify-center disabled:opacity-60">
                    <Send className="w-4 h-4 mr-2" />{sending ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sponsorship;
