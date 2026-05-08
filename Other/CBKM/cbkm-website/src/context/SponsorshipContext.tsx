import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSettings, setSetting } from '../lib/db/settings';

interface SponsorshipContact { email: string; phone: string; }
interface SponsorshipContextType {
  sponsorshipContact: SponsorshipContact;
  updateSponsorshipContact: (c: SponsorshipContact) => void;
}

const SponsorshipContext = createContext<SponsorshipContextType | undefined>(undefined);

export const useSponsorship = () => {
  const ctx = useContext(SponsorshipContext);
  if (!ctx) throw new Error('useSponsorship must be used within SponsorshipProvider');
  return ctx;
};

export const SponsorshipProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sponsorshipContact, setSponsorshipContact] = useState<SponsorshipContact>({
    email: 'bharathikalaimandram@gmail.com', phone: '+1 (403) 123-4567',
  });

  useEffect(() => {
    getSettings(['sponsorship_email', 'sponsorship_phone']).then(s => {
      setSponsorshipContact({
        email: s['sponsorship_email'] || 'bharathikalaimandram@gmail.com',
        phone: s['sponsorship_phone'] || '+1 (403) 123-4567',
      });
    }).catch(() => {});
  }, []);

  const updateSponsorshipContact = (c: SponsorshipContact) => {
    setSponsorshipContact(c);
    setSetting('sponsorship_email', c.email).catch(console.error);
    setSetting('sponsorship_phone', c.phone).catch(console.error);
  };

  return (
    <SponsorshipContext.Provider value={{ sponsorshipContact, updateSponsorshipContact }}>
      {children}
    </SponsorshipContext.Provider>
  );
};
