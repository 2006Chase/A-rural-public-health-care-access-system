import en from './en.json';
import hi from './hi.json';
import mr from './mr.json';

export type Language = 'en' | 'hi' | 'mr';

export const translations = {
  en,
  hi,
  mr,
};

export const LANGUAGES: { code: Language; label: string; nativeName: string }[] = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिंदी' },
  { code: 'mr', label: 'Marathi', nativeName: 'मराठी' },
];

/**
 * Nested key lookup with automatic English fallback.
 * Example: t('patientHome.findCare', 'mr')
 */
export function getTranslation(keyPath: string, lang: Language = 'en'): string {
  const keys = keyPath.split('.');
  
  // Try selected language
  let current: any = translations[lang];
  let found = true;
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      found = false;
      break;
    }
  }

  if (found && typeof current === 'string') {
    return current;
  }

  // Fallback to English
  let fallback: any = translations.en;
  for (const k of keys) {
    if (fallback && typeof fallback === 'object' && k in fallback) {
      fallback = fallback[k];
    } else {
      return keyPath; // If completely missing, return keyPath
    }
  }

  return typeof fallback === 'string' ? fallback : keyPath;
}
