import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useEvents } from '../context/EventsContext';
import { toSlug } from './EventDetail';
import { formatEventDate } from '../lib/dateUtils';
import KolamSVG from '../components/KolamSVG';

const homeEvents = [
  { month: 'JAN', day: '14', title: 'Pongal Thiruvizha', type: 'Harvest Festival', desc: 'Celebrating the harvest festival with traditional rituals, music, dance, and community feast.', color: '#C9A84C' },
  { month: 'MAY', day: '22', title: 'Chithrai Thiruvizha', type: 'Dance Competition', desc: 'A vibrant dance competition featuring folk, classical, and fusion styles across all age groups.', color: '#8B1A1A' },
  { month: 'OCT', day: '20', title: 'Deepavali Vizha', type: 'Festival of Lights', desc: 'The grand festival of lights, celebrated with cultural programs, fireworks, and community gathering.', color: '#c94040' },
];

const offerCards = [
  { icon: '🎭', title: 'Events', desc: 'Cultural celebrations, festivals, and community gatherings throughout the year.', href: '/events' },
  { icon: '🤝', title: 'Sponsorship', desc: 'Partner with us to support Tamil community initiatives and cultural programs.', href: '/sponsorship' },
  { icon: '📸', title: 'Gallery', desc: 'Memories and highlights from our events, performances, and community activities.', href: '/gallery' },
];

const Home: React.FC = () => {
  const { events } = useEvents();
  const upcomingEvents = events.slice(0, 2);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #c94040 0%, #a83535 40%, #c94040 100%)', minHeight: '90vh' }}>
        {/* Grain overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")' }} />
        {/* Kolam decorations */}
        <div className="absolute right-[-8%] top-1/2 -translate-y-1/2 opacity-[0.05]">
          <KolamSVG size={700} />
        </div>
        <div className="absolute left-[-5%] bottom-[-15%] opacity-[0.03]">
          <KolamSVG size={400} />
        </div>
        {/* Gradient orbs */}
        <div className="absolute top-20 right-1/4 w-96 h-96 rounded-full opacity-[0.07]" style={{ background: 'radial-gradient(circle, #C9A84C, transparent 70%)' }} />
        <div className="absolute bottom-20 left-1/4 w-64 h-64 rounded-full opacity-[0.05]" style={{ background: 'radial-gradient(circle, #8B1A1A, transparent 70%)' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center" style={{ minHeight: '90vh' }}>
          <div className="max-w-2xl animate-fade-in">
            <span className="section-label" style={{ color: 'rgba(201,168,76,0.8)' }}>Calgary Bharathi Kalai Mandram</span>
            <h1 className="mt-6 text-white leading-[1.1]" style={{ fontSize: 'clamp(3rem, 6vw, 4.5rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Celebrating<br />
              <span className="font-serif italic" style={{ color: '#C9A84C' }}>Tamil Heritage</span><br />
              in Calgary
            </h1>
            <p className="mt-8 text-lg font-serif italic" style={{ color: 'rgba(201,168,76,0.9)' }}>
              யாதும் ஊரே, யாவரும் கேளிர்
            </p>
            <p className="mt-2 text-sm tracking-wide" style={{ color: 'rgba(255,255,255,0.35)' }}>
              "The world is my home; all people are my kin."
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/events" className="btn btn-primary">
                Upcoming Events <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <Link to="/about" className="btn btn-outline">
                Learn More
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3" style={{ animation: 'scroll-bounce 2.5s ease-in-out infinite' }}>
          <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>Scroll</span>
          <div className="w-px h-10" style={{ background: 'linear-gradient(to bottom, rgba(201,168,76,0.4), transparent)' }} />
        </div>
      </section>

      {/* ── Mission Strip ── */}
      <section style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              ['🏛️', 'Community Building', 'Creating a strong, united Tamil community in Calgary'],
              ['🎉', 'Cultural Events', 'Celebrating Tamil festivals and traditions year-round'],
              ['📖', 'Language Preservation', 'Teaching and preserving Tamil for future generations'],
            ].map(([icon, title, desc]) => (
              <div className="flex items-start gap-4" key={title}>
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-lg" style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.12)' }}>
                  {icon}
                </div>
                <div>
                  <h3 className="font-semibold text-base" style={{ color: 'var(--text)' }}>{title}</h3>
                  <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Welcome ── */}
      <section className="py-24" style={{ background: 'var(--surface)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <span className="section-label">Welcome</span>
              <h2 className="mt-3 font-bold leading-tight" style={{ fontSize: 'clamp(2rem, 3vw, 2.8rem)', color: 'var(--text)', letterSpacing: '-0.01em' }}>Who We Are</h2>
              <div className="divider" />
              <p className="text-base leading-[1.8]" style={{ color: 'var(--text-muted)' }}>
                CBKM is an active organization committed to promoting and safeguarding the diverse Tamil culture and language. Our goal is to build a strong community and offer opportunities for people to connect, learn, and honour our heritage.
              </p>
              <p className="text-base leading-[1.8] mt-5" style={{ color: 'var(--text-muted)' }}>
                Through various events and activities, we seek to cultivate a profound understanding and appreciation of Tamil culture and language among individuals from all walks of life.
              </p>
              <Link to="/about" className="btn btn-outline mt-8">
                Our Mission <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
            <div>
              <div className="rounded-3xl p-8 relative" style={{ background: 'linear-gradient(145deg, rgba(201,168,76,0.05), rgba(139,26,26,0.03))', border: '1px solid rgba(201,168,76,0.12)' }}>
                <div className="text-7xl font-serif leading-none mb-3 select-none" style={{ color: 'rgba(201,168,76,0.2)' }}>"</div>
                <p className="text-lg font-serif italic leading-relaxed mb-8" style={{ color: '#444' }}>
                  Tamil culture encompasses language, literature, music, dance, and 5,500+ years of unbroken civilizational history.
                </p>
                <div className="grid grid-cols-3 gap-4 pt-6" style={{ borderTop: '1px solid rgba(201,168,76,0.12)' }}>
                  {[
                    ['5,500+', 'Years of History', '#C9A84C'],
                    ['80M+', 'Tamil Speakers', '#8B1A1A'],
                    ['18+', 'Years of Service', '#C9A84C'],
                  ].map(([num, label, color]) => (
                    <div key={label} className="text-center">
                      <div className="text-2xl font-bold" style={{ color }}>{num}</div>
                      <div className="text-[11px] mt-1 tracking-wide uppercase" style={{ color: '#999' }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Annual Celebrations ── */}
      <section className="py-24" style={{ background: 'var(--surface-alt)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="section-label" style={{ display: 'block' }}>Upcoming</span>
            <h2 className="mt-3 font-bold" style={{ fontSize: 'clamp(2rem, 3vw, 2.8rem)', color: 'var(--text)', letterSpacing: '-0.01em' }}>Annual Celebrations</h2>
            <div className="divider center" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {homeEvents.map((e) => (
              <div key={e.title} className="card-hover bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                <div className="flex items-center px-6 py-5 gap-4" style={{ background: e.color }}>
                  <div className="text-center leading-none" style={{ color: e.color === '#c94040' ? '#C9A84C' : 'rgba(255,255,255,0.95)' }}>
                    <div className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-70">{e.month}</div>
                    <div className="text-4xl font-bold mt-0.5">{e.day}</div>
                  </div>
                  <div style={{ color: e.color === '#c94040' ? '#C9A84C' : '#fff' }}>
                    <div className="text-[10px] font-semibold tracking-[0.15em] uppercase opacity-70">{e.type}</div>
                    <div className="text-lg font-bold mt-0.5">{e.title}</div>
                  </div>
                </div>
                <div className="px-6 py-5">
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{e.desc}</p>
                  <Link to="/events" className="inline-flex items-center mt-4 text-sm font-semibold" style={{ color: '#C9A84C' }}>
                    Learn More <ArrowUpRight className="ml-1 w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/events" className="btn btn-primary">View All Events</Link>
          </div>

          {/* Annual Events Detail Cards */}
          <div className="mt-16">
            <h3 className="text-center text-2xl font-bold font-serif mb-10" style={{ color: 'var(--text)', letterSpacing: '-0.01em' }}>
              ஆண்டு நிகழ்வுகள்
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Pongal Card */}
              <div className="rounded-2xl p-8 card-hover" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <h4 className="text-xl font-bold mb-4 font-serif" style={{ color: 'var(--text)' }}>பொங்கல் திருநாளின் நோக்கம்</h4>
                <p className="text-sm leading-[1.8] mb-4" style={{ color: 'var(--text-muted)' }}>
                  பொங்கல். இது ஒரு தமிழர் இனத் திருவிழா. சாதி, சமயம் மற்றும் பல வேறுபாடுகளை மறந்து, கல் தோன்றி, மண் தோன்றாக் காலத்தே, முன்தோன்றிய மூத்த குடியின் அடையாள, பண்பாட்டு விழாவாக பொங்கல் திகழ்கிறது. உழைப்பின் மகிமையை ஊர்ருக்கு, உலகுக்கு சொல்லும் விழா, பொங்கல் விழா, இது இயற்கையோடு இயைந்த மூத்த குடியின் திருநாள்.
                </p>
                <p className="text-sm leading-[1.8]" style={{ color: 'var(--text-muted)' }}>
                  மனிதன் உயிர் வாழ உணவு தேவை. நமது முக்கியமான உணவுப் பொருள் அரிசி. இதனை விளைவித்து, அறுவடை செய்து, வயத்து உயிர்க்கெல்லாம் சோறிடும், அறுவடைத் திருநாளான பொங்கல் விழா போற்றத் தகுந்ததல்லவா! பொங்கல் நன்றி தெரிவிக்கும் விழா.
                </p>
              </div>
              {/* Deepavali Card */}
              <div className="rounded-2xl p-8 card-hover" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <h4 className="text-xl font-bold mb-4 font-serif" style={{ color: 'var(--text)' }}>தீபாவளியின் பெருமை</h4>
                <p className="text-sm leading-[1.8] mb-4" style={{ color: 'var(--text-muted)' }}>
                  ஆண்டு முழுவதும் பல பண்டிகைகள் வந்தாலும் தீபாவளிக்கு என்று தனிச்சிறப்பு ஒன்று உண்டு. அன்றைய தினம் ஏழை, பணக்காரர் என்ற பாகுபாடு இல்லாமல் எல்லோரும் எண்ணெய் நீராடி, புத்தாடை அணிந்து, தீபம் ஏற்றிக் கொண்டாடுவது அவசியம் என்று புராணமே கூறுவதுதான் அந்தச் சிறப்பு.
                </p>
                <p className="text-sm leading-[1.8]" style={{ color: 'var(--text-muted)' }}>
                  உலகெங்கிலும் மக்கள் விழாக்களை கொண்டாடுவதன் நோக்கம். இயந்திர கதியிலான தங்கள் இயல்பு வாழ்க்கையில் சோர்வு நீங்கி, சுறுசுறுப்படைவதற்காகத்தான். தேக்கமான வாழ்க்கைக்கு வடிகாலாக இருப்பவைதான் விழாக்கள். கொண்டாடுவதன் மூலம், புத்துணர்வும், புது எழுச்சியும், புதிய நம்பிக்கையும் பிறக்கிறது. காலைக் கதிரவன் அன்றைய நாளின், நம்பிக்கையின் அடையாளம். விழாக்கள், வாழ்க்கை வாழ்வதற்கே என்ற மகிழ்ச்சியின் அடையாளம்.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Culture ── */}
      <section className="py-24" style={{ background: 'var(--surface)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <span className="section-label">தமிழ் கலாச்சாரம்</span>
              <h2 className="mt-3 font-bold" style={{ fontSize: 'clamp(2rem, 3vw, 2.8rem)', color: 'var(--text)', letterSpacing: '-0.01em' }}>Tamil Culture & Heritage</h2>
              <div className="divider" />
              <p className="text-base leading-[1.8]" style={{ color: 'var(--text-muted)' }}>
                தமிழர் பண்பாடு தமிழ் மக்களின் கலாச்சாரம் ஆகும். எஞ்சியிருக்கும் பழமையான மொழிகளில் ஒன்றான தமிழ் மொழியை தமிழ் மக்கள் பேசுகிறார்கள். தமிழகம் 400 ஆயிரம் ஆண்டுகளுக்கும் மேலாக மக்கள் வசிக்கும் பகுதியாக உள்ளது மற்றும் 5,500 ஆண்டுகளுக்கும் மேலான தொடர்ச்சியான கலாச்சார வரலாற்றைக் கொண்டுள்ளது. எனவே, தமிழர் பண்பாடு பல ஆண்டுகளாக பல்வேறு தாக்கங்களைக் கண்டது.
              </p>
              <p className="text-base leading-[1.8] mt-4" style={{ color: 'var(--text-muted)' }}>
                தமிழ் கலாச்சாரம் மொழி, இலக்கியம், இசை, நடனம், நாட்டுப்புற கலை, தற்காப்பு கலை, ஓவியம், சிற்பம், கட்டிடகலை, விளையாட்டு, ஊடகங்கள், நகைச்சுவை, உணவு, ஆடைகள், கொண்டாட்டங்கள், தத்துவம், மதங்கள், மரபுகள், சடங்குகள், நிறுவனங்கள், அறிவியலை வெளிப்படுத்துகிறது. தமிழர் பண்பாடு தமிழ் மொழியின் <u>ஊடாகவும்</u>, தமிழர் தாயகப் பிணைப்பின் <u>ஊடாகவும்</u>, தமிழர் மரபுகள், வரலாறு, விழுமியங்கள், கலைகள் <u>ஊடாகவும்</u>, சமூக, பொருளாதார, அரசியல் தளங்கள் ஊடாகவும் பேணப்படும் தனித்துவ பண்பாட்டுக் கூறுகளை குறிக்கும்.
              </p>
              <div className="flex flex-wrap gap-2 mt-8">
                {['Bharatanatyam', 'Carnatic Music', 'Tamil Literature', 'Pongal', 'Kolam Art', 'Silambam'].map((tag) => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.3), transparent 70%)' }} />
                <KolamSVG size={300} className="kolam-rotate" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── What We Offer ── */}
      <section className="py-24" style={{ background: 'linear-gradient(160deg, #111, #1a1a1a)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="section-label" style={{ display: 'block' }}>Explore</span>
            <h2 className="mt-3 font-bold text-white" style={{ fontSize: 'clamp(2rem, 3vw, 2.8rem)', letterSpacing: '-0.01em' }}>What We Offer</h2>
            <div className="divider center" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {offerCards.map((c) => (
              <Link to={c.href} key={c.title}
                className="group block rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.1)', backdropFilter: 'blur(4px)' }}>
                <div className="text-4xl mb-5">{c.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{c.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{c.desc}</p>
                <span className="inline-flex items-center mt-5 text-sm font-semibold transition-transform duration-300 group-hover:translate-x-1" style={{ color: '#C9A84C' }}>
                  Explore <ArrowUpRight className="ml-1 w-3.5 h-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Upcoming Events from DB ── */}
      {upcomingEvents.length > 0 && (
        <section className="py-24" style={{ background: 'var(--surface-alt)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-14">
              <div>
                <span className="section-label">Don't Miss Out</span>
                <h2 className="mt-3 font-bold" style={{ fontSize: 'clamp(2rem, 3vw, 2.8rem)', color: 'var(--text)', letterSpacing: '-0.01em' }}>Upcoming Events</h2>
              </div>
              <Link to="/events" className="hidden sm:flex items-center font-semibold text-sm" style={{ color: '#C9A84C' }}>
                View All <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {upcomingEvents.map(event => (
                <div key={event.id} className="card-hover bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                  <div className="h-52 overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(139,26,26,0.2))' }}>
                    {event.image && !event.image.includes('/api/placeholder') && (
                      <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="p-7">
                    <div className="flex items-center text-sm mb-3" style={{ color: '#999' }}>
                      <Calendar className="w-4 h-4 mr-1.5" style={{ color: '#C9A84C' }} />
                      {formatEventDate(event.date)}
                    </div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>{event.name}</h3>
                    {event.location && (
                      <div className="flex items-center text-sm mb-4" style={{ color: '#999' }}>
                        <MapPin className="w-4 h-4 mr-1.5" style={{ color: '#8B1A1A' }} />{event.location}
                      </div>
                    )}
                    <p className="text-sm mb-5 line-clamp-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{event.description}</p>
                    <Link to={`/events/${toSlug(event)}`} className="inline-flex items-center text-sm font-semibold" style={{ color: '#C9A84C' }}>
                      Learn More <ArrowUpRight className="ml-1 w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section style={{ background: 'linear-gradient(145deg, rgba(201,168,76,0.06), rgba(139,26,26,0.04))', borderTop: '1px solid rgba(201,168,76,0.1)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text)', letterSpacing: '-0.01em' }}>
                Get Involved With <span className="font-serif italic" style={{ color: '#C9A84C' }}>CBKM</span>
              </h2>
              <p className="mt-3 text-base" style={{ color: 'var(--text-muted)' }}>Join our community and help us preserve and celebrate Tamil culture in Calgary</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link to="/contact" className="btn btn-primary">Contact Us</Link>
              <Link to="/sponsorship" className="btn btn-outline-crimson">Become a Sponsor</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
