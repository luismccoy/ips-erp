import { createContext, useContext, useState, type ReactNode } from 'react';

type Language = 'es' | 'en';

const LanguageContext = createContext<{
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (es: string, en: string) => string;
}>({
  language: 'es',
  setLanguage: () => {},
  t: (es) => es
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('es');
  const t = (es: string, en: string) => language === 'es' ? es : en;
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
