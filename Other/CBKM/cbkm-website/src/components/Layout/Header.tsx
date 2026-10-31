import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useLogo } from '../../context/LogoContext';
import { getSetting } from '../../lib/db/settings';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [votePageEnabled, setVotePageEnabled] = useState(false);
  const { logoUrl } = useLogo();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    getSetting('vote_page_enabled').then(v => setVotePageEnabled(v === 'true')).catch(() => {});
  }, []);

  const allNavigation = [
    { name: 'Home', href: '/' },
    { name: 'Events', href: '/events' },
    { name: 'Sponsorship', href: '/sponsorship' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
    { name: 'About Us', href: '/about' },
    { name: 'Vote', href: '/vote' },
  ];

  const navigation = allNavigation.filter(item => item.href !== '/vote' || votePageEnabled);

  const isActiveLink = (href: string) => location.pathname === href;

  return (
    <header className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid rgba(201,168,76,0.12)' : '1px solid transparent',
        boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.04)' : 'none',
      }}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <img src={logoUrl} alt="CBKM Logo" className="w-10 h-10 object-contain rounded-full transition-transform duration-300 group-hover:scale-105"
                style={{ border: '2px solid #C9A84C' }} />
            </div>
            <div className="hidden sm:block">
              <div className="text-[15px] font-bold tracking-tight" style={{ color: '#1a1a1a' }}>Calgary Bharathi Kalai Mandram</div>
              <div className="text-[11px] font-medium tracking-wide" style={{ color: '#C9A84C' }}>Tamil Association of Calgary</div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-0.5">
            {navigation.map((item) => (
              <Link key={item.name} to={item.href}
                className="px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-200"
                style={{
                  color: isActiveLink(item.href) ? '#C9A84C' : '#555',
                  background: isActiveLink(item.href) ? 'rgba(201,168,76,0.08)' : 'transparent',
                }}>
                {item.name}
              </Link>
            ))}
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-lg transition-colors"
              style={{ color: '#555' }}>
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden pb-4 animate-fade-in" style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
            <div className="pt-2 space-y-0.5">
              {navigation.map((item) => (
                <Link key={item.name} to={item.href} onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-[15px] font-medium transition-colors"
                  style={{
                    color: isActiveLink(item.href) ? '#C9A84C' : '#555',
                    background: isActiveLink(item.href) ? 'rgba(201,168,76,0.06)' : 'transparent',
                  }}>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
