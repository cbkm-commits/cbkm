import React from 'react';
import { Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLogo } from '../../context/LogoContext';

const Footer: React.FC = () => {
  const { logoUrl } = useLogo();
  return (
    <footer style={{ background: '#111' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-5">
              <img src={logoUrl} alt="CBKM Logo" className="w-11 h-11 object-contain rounded-full"
                style={{ border: '2px solid rgba(201,168,76,0.5)' }} />
              <div>
                <div className="text-base font-bold" style={{ color: '#C9A84C' }}>Calgary Bharathi Kalai Mandram</div>
                <div className="text-xs tracking-wide" style={{ color: '#666' }}>Tamil Association of Calgary</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: '#777' }}>
              Promoting Heritage, Unity, and Tradition in Calgary's Tamil Community.
            </p>
            <p className="font-serif italic text-sm mb-6" style={{ color: 'rgba(201,168,76,0.6)' }}>
              யாதும் ஊரே, யாவரும் கேளிர்
            </p>
            <a href="https://www.facebook.com/p/Calgary-Bharathi-Kalai-Mandram-Tamil-Association-100070095836250/"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm transition-colors duration-200"
              style={{ color: '#666' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#C9A84C')}
              onMouseLeave={e => (e.currentTarget.style.color = '#666')}>
              <Facebook className="w-4 h-4" /> Facebook
            </a>
          </div>

          {/* Navigation */}
          <div className="md:col-span-3">
            <h3 className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-5" style={{ color: 'rgba(201,168,76,0.7)' }}>Navigation</h3>
            <ul className="space-y-3">
              {[
                ['Events', '/events'], ['Sponsorship', '/sponsorship'], ['Gallery', '/gallery'],
                ['Blog', '/blog'], ['Contact', '/contact'], ['About Us', '/about'],
              ].map(([name, href]) => (
                <li key={name}>
                  <Link to={href} className="text-sm transition-colors duration-200"
                    style={{ color: '#777' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#C9A84C')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#777')}>
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div className="md:col-span-4">
            <h3 className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-5" style={{ color: 'rgba(201,168,76,0.7)' }}>Connect</h3>
            <div className="space-y-4 text-sm" style={{ color: '#777' }}>
              <div className="flex items-start gap-3">
                <span className="text-base">📍</span>
                <span>Calgary, Alberta, Canada</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-base">📧</span>
                <a href="mailto:bharathikalaimandram@gmail.com" className="transition-colors duration-200 break-all"
                  style={{ color: '#777' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#C9A84C')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#777')}>
                  bharathikalaimandram@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-xs" style={{ color: '#555' }}>
            &copy; 2026 Calgary Bharathi Kalai Mandram. All rights reserved.
          </p>
          <p className="font-serif italic text-xs" style={{ color: 'rgba(201,168,76,0.3)' }}>
            யாதும் ஊரே, யாவரும் கேளிர்
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
