import React, { useState } from 'react';
import { Send, Users, Heart, HandHeart } from 'lucide-react';
import { createContact } from '../lib/db/contacts';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    try {
      await createContact({ name: formData.name, email: formData.email, phone: '', message: formData.subject ? `[${formData.subject}] ${formData.message}` : formData.message });
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch {
      setSubmitError('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="py-24 animate-fade-in" style={{ background: 'linear-gradient(160deg, #111, #1a1a1a)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="section-label">Reach Out</span>
          <h1 className="mt-4 text-white font-bold font-serif" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', letterSpacing: '-0.01em' }}>
            Get In <em style={{ color: '#C9A84C', fontStyle: 'italic' }}>Touch</em>
          </h1>
          <div className="divider center" style={{ marginTop: '1.5rem' }} />
          <p className="text-lg leading-[1.8]" style={{ color: 'rgba(255,255,255,0.55)' }}>
            We'd love to hear from you — reach out with questions, ideas, or just to say hello
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-24" style={{ background: 'var(--surface-alt)' }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl p-8" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
            <h2 className="text-2xl font-bold font-serif mb-6" style={{ color: 'var(--text)', letterSpacing: '-0.01em' }}>
              Send us a <em style={{ color: '#C9A84C', fontStyle: 'italic' }}>Message</em>
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Full Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required
                  className="w-full px-4 py-2.5 border rounded-xl text-sm transition-colors"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface-alt)', color: 'var(--text)' }}
                  placeholder="Enter your full name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Email Address *</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required
                  className="w-full px-4 py-2.5 border rounded-xl text-sm transition-colors"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface-alt)', color: 'var(--text)' }}
                  placeholder="your.email@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Subject</label>
                <input type="text" name="subject" value={formData.subject} onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm transition-colors"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface-alt)', color: 'var(--text)' }}
                  placeholder="What is this regarding?" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Message *</label>
                <textarea name="message" value={formData.message} onChange={handleInputChange} required rows={5}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm transition-colors resize-none"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface-alt)', color: 'var(--text)' }}
                  placeholder="How can we help you?" />
              </div>
              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{submitError}</div>
              )}
              {submitted && (
                <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#16a34a' }}>
                  Thank you for your message! We will get back to you soon.
                </div>
              )}
              <button type="submit" disabled={submitting}
                className="btn btn-primary w-full flex items-center justify-center disabled:opacity-60">
                <Send className="w-4 h-4 mr-2" />
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* CTA Cards */}
      <section className="py-24" style={{ background: 'var(--surface)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="section-label">Get Involved</span>
            <h2 className="mt-3 font-bold font-serif" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', letterSpacing: '-0.01em', color: 'var(--text)' }}>
              Ways to <em style={{ color: '#C9A84C', fontStyle: 'italic' }}>Connect</em>
            </h2>
            <div className="divider center" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Users className="w-6 h-6" />, title: 'Become a Member', desc: 'Join our vibrant Tamil community in Calgary.' },
              { icon: <Heart className="w-6 h-6" />, title: 'Volunteer', desc: 'Help organize events and community programs.' },
              { icon: <HandHeart className="w-6 h-6" />, title: 'Donate', desc: 'Support cultural preservation and community service.' },
            ].map((c) => (
              <div key={c.title} className="text-center rounded-2xl p-6 card-hover"
                style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)' }}>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
                  style={{ background: 'rgba(201,168,76,0.12)', color: '#C9A84C' }}>
                  {c.icon}
                </div>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--text)' }}>{c.title}</h3>
                <p className="text-sm leading-[1.8]" style={{ color: 'var(--text-muted)' }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
