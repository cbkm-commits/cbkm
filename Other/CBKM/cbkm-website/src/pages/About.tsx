import React from 'react';
import { Users, Calendar, Award, Heart, Target } from 'lucide-react';
import KolamSVG from '../components/KolamSVG';

const coreValues = [
  { icon: '🌿', title: 'Heritage', desc: 'Preserving the rich Tamil cultural traditions and passing them to future generations.' },
  { icon: '🤝', title: 'Unity', desc: 'Building a strong, connected Tamil community in Calgary.' },
  { icon: '✨', title: 'Excellence', desc: 'Striving for quality in every event, program, and initiative we undertake.' },
  { icon: '📚', title: 'Education', desc: 'Promoting Tamil language learning and cultural knowledge.' },
  { icon: '🌍', title: 'Inclusivity', desc: 'Welcoming all who wish to learn about and celebrate Tamil culture.' },
  { icon: '💛', title: 'Service', desc: 'Contributing to the broader Calgary community through charitable initiatives.' },
];

const About: React.FC = () => {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden py-24 animate-fade-in" style={{ background: 'linear-gradient(160deg, #111, #1a1a1a)' }}>
        <div className="absolute right-[-5%] top-1/2 -translate-y-1/2 opacity-[0.05]">
          <KolamSVG size={420} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="section-label">Our Story</span>
          <h1 className="mt-4 text-white font-bold font-serif" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', letterSpacing: '-0.01em' }}>
            About <em style={{ color: '#C9A84C', fontStyle: 'italic' }}>CBKM</em>
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Tamil Association of Calgary</p>
          <div className="divider center" style={{ marginTop: '1.5rem' }} />
          <p className="text-base italic mt-3" style={{ color: '#C9A84C' }}>
            யாதும் ஊரே, யாவரும் கேளிர்; தீதும் நன்றும் பிறர்தர வாரா
          </p>
        </div>
      </section>

      {/* Mission & Story */}
      <section className="py-24" style={{ background: 'var(--surface)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="section-label">Our Mission</span>
              <h2 className="mt-3 font-bold font-serif" style={{ fontSize: 'clamp(2rem, 3vw, 2.8rem)', letterSpacing: '-0.01em', color: 'var(--text)' }}>
                Who We <em style={{ color: '#C9A84C', fontStyle: 'italic' }}>Are</em>
              </h2>
              <div className="divider" />
              <p className="text-lg leading-[1.8]" style={{ color: 'var(--text-muted)' }}>
                CBKM is an active organization committed to promoting and safeguarding the diverse Tamil culture and language. Our goal is to build a strong community and offer opportunities for people to connect, learn, and honour our heritage.
              </p>
              <p className="text-lg leading-[1.8] mt-4" style={{ color: 'var(--text-muted)' }}>
                Through various events and activities, we seek to cultivate a profound understanding and appreciation of Tamil culture and language among individuals from all walks of life.
              </p>
              <p className="text-lg leading-[1.8] mt-4" style={{ color: 'var(--text-muted)' }}>
                Come join us in our efforts to uphold and celebrate the richness of Tamil culture!
              </p>
              <blockquote className="mt-8 pl-5 italic" style={{ borderLeft: '3px solid #C9A84C', color: 'var(--text-muted)' }}>
                "We are not just preserving culture — we are nurturing a living, breathing community."
                <br /><span className="text-xs not-italic" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>— Subramania Bharathi</span>
              </blockquote>
            </div>
            <div className="flex justify-center">
              <KolamSVG size={300} className="kolam-rotate" />
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24" style={{ background: 'var(--surface-alt)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="section-label">What Drives Us</span>
            <h2 className="mt-3 font-bold font-serif" style={{ fontSize: 'clamp(2rem, 3vw, 2.8rem)', letterSpacing: '-0.01em', color: 'var(--text)' }}>
              Core <em style={{ color: '#C9A84C', fontStyle: 'italic' }}>Values</em>
            </h2>
            <div className="divider center" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreValues.map((v) => (
              <div key={v.title} className="rounded-2xl p-6 card-hover"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="text-3xl mb-4">{v.icon}</div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>{v.title}</h3>
                <p className="text-sm leading-[1.8]" style={{ color: 'var(--text-muted)' }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tamil Culture Section */}
      <section className="py-24" style={{ background: 'var(--surface)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="section-label">Heritage</span>
            <h2 className="mt-3 font-bold font-serif" style={{ fontSize: 'clamp(2rem, 3vw, 2.8rem)', letterSpacing: '-0.01em', color: 'var(--text)' }}>
              Tamil Culture &amp; <em style={{ color: '#C9A84C', fontStyle: 'italic' }}>Heritage</em>
            </h2>
            <div className="divider center" />
          </div>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg leading-[1.8]" style={{ color: 'var(--text-muted)' }}>
              Tamil culture is the culture of Tamil people. Tamil is one of the oldest surviving languages, spoken by Tamil people. Tamil Nadu has been a region where people have lived for over 400,000 years and has a continuous cultural history of over 5,500 years.
            </p>
            <p className="text-lg leading-[1.8] mt-4" style={{ color: 'var(--text-muted)' }}>
              Tamil culture is expressed through language, literature, music, dance, folk arts, martial arts, painting, sculpture, architecture, sports, media, comedy, food, clothing, celebrations, philosophy, religions, traditions, rituals, institutions, and science.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[
              ['Language & Literature', 'Preserving the ancient Tamil language and its rich literary traditions.'],
              ['Arts & Music', 'Celebrating traditional Tamil arts, music, and dance forms.'],
              ['Festivals & Traditions', 'Observing traditional Tamil festivals and cultural practices.'],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-2xl p-6 card-hover" style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)' }}>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>{title}</h3>
                <p className="text-sm leading-[1.8]" style={{ color: 'var(--text-muted)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Annual Events */}
      <section className="py-24" style={{ background: 'var(--surface-alt)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="section-label">Celebrations</span>
            <h2 className="mt-3 font-bold font-serif" style={{ fontSize: 'clamp(2rem, 3vw, 2.8rem)', letterSpacing: '-0.01em', color: 'var(--text)' }}>
              Annual <em style={{ color: '#C9A84C', fontStyle: 'italic' }}>Events</em>
            </h2>
            <div className="divider center" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Pongal Festival', desc: 'Harvest festival celebrating prosperity and gratitude', color: '#C9A84C' },
              { title: 'Tamil New Year', desc: 'Traditional New Year celebrations with cultural programs', color: '#8B1A1A' },
              { title: 'Deepavali', desc: 'Festival of lights with traditional celebrations', color: '#1a1a1a' },
            ].map((e) => (
              <div key={e.title} className="text-center rounded-2xl p-8 card-hover"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <Calendar className="w-12 h-12 mx-auto mb-4" style={{ color: e.color === '#1a1a1a' ? '#C9A84C' : e.color }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>{e.title}</h3>
                <p style={{ color: 'var(--text-muted)' }}>{e.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Impact */}
      <section className="py-24" style={{ background: 'linear-gradient(160deg, #111, #1a1a1a)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="section-label">Our Reach</span>
            <h2 className="font-bold font-serif text-white mt-3" style={{ fontSize: 'clamp(2rem, 3vw, 2.8rem)', letterSpacing: '-0.01em' }}>
              Our <em style={{ color: '#C9A84C', fontStyle: 'italic' }}>Impact</em>
            </h2>
            <div className="divider center" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <Users className="w-12 h-12 mx-auto mb-4" style={{ color: '#C9A84C' }} />
              <div className="text-4xl font-bold mb-2 font-serif" style={{ color: '#C9A84C' }}>500+</div>
              <div style={{ color: 'rgba(255,255,255,0.55)' }}>Community Members</div>
            </div>
            <div className="text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4" style={{ color: '#C9A84C' }} />
              <div className="text-4xl font-bold mb-2 font-serif" style={{ color: '#C9A84C' }}>3</div>
              <div style={{ color: 'rgba(255,255,255,0.55)' }}>Annual Events</div>
            </div>
            <div className="text-center">
              <Award className="w-12 h-12 mx-auto mb-4" style={{ color: '#C9A84C' }} />
              <div className="text-4xl font-bold mb-2 font-serif" style={{ color: '#C9A84C' }}>18+</div>
              <div style={{ color: 'rgba(255,255,255,0.55)' }}>Years of Service</div>
            </div>
          </div>
          <div className="pt-10" style={{ borderTop: '1px solid rgba(201,168,76,0.2)' }}>
            <h3 className="text-lg font-semibold text-center mb-6" style={{ color: '#C9A84C' }}>Supporting Our Community</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="flex items-center gap-3 rounded-xl px-5 py-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.12)' }}>
                <Heart className="w-5 h-5 flex-shrink-0" style={{ color: '#C9A84C' }} />
                <span style={{ color: 'rgba(255,255,255,0.65)' }}>Blood Donation Drives</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl px-5 py-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.12)' }}>
                <Heart className="w-5 h-5 flex-shrink-0" style={{ color: '#C9A84C' }} />
                <span style={{ color: 'rgba(255,255,255,0.65)' }}>Mustard Seed Volunteering</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
