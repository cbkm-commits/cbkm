import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSetting, setSetting } from '../lib/db/settings';

const DEFAULT_LOGO = '/cbkm-logo.jpeg';

interface LogoContextType { logoUrl: string; updateLogo: (url: string) => void; }

const LogoContext = createContext<LogoContextType>({ logoUrl: DEFAULT_LOGO, updateLogo: () => {} });

export const LogoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logoUrl, setLogoUrl] = useState(DEFAULT_LOGO);

  useEffect(() => {
    getSetting('logo').then(val => { if (val) setLogoUrl(val); }).catch(() => {});
  }, []);

  const updateLogo = (url: string) => {
    setLogoUrl(url);
    setSetting('logo', url).catch(console.error);
  };

  return <LogoContext.Provider value={{ logoUrl, updateLogo }}>{children}</LogoContext.Provider>;
};

export const useLogo = () => useContext(LogoContext);
