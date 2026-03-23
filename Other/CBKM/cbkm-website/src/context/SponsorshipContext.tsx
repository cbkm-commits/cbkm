import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SponsorshipContact {
  email: string;
  phone: string;
}

interface SponsorshipContextType {
  sponsorshipContact: SponsorshipContact;
  updateSponsorshipContact: (contact: SponsorshipContact) => void;
}

const SponsorshipContext = createContext<SponsorshipContextType | undefined>(undefined);

export const useSponsorship = () => {
  const context = useContext(SponsorshipContext);
  if (!context) {
    throw new Error('useSponsorship must be used within a SponsorshipProvider');
  }
  return context;
};

interface SponsorshipProviderProps {
  children: ReactNode;
}

export const SponsorshipProvider: React.FC<SponsorshipProviderProps> = ({ children }) => {
  const [sponsorshipContact, setSponsorshipContact] = useState<SponsorshipContact>({
    email: 'bharathikalaimandram@gmail.com',
    phone: '+1 (403) 123-4567'
  });

  const updateSponsorshipContact = (contact: SponsorshipContact) => {
    setSponsorshipContact(contact);
  };

  return (
    <SponsorshipContext.Provider value={{ sponsorshipContact, updateSponsorshipContact }}>
      {children}
    </SponsorshipContext.Provider>
  );
};
