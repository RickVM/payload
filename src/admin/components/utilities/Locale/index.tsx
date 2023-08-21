import React, { createContext, useContext, useState, useEffect } from 'react';
import { LabeledLocale } from '../../../../config/types';
import { useConfig } from '../Config';
import { useAuth } from '../Auth';
import { usePreferences } from '../Preferences';
import { useSearchParams } from '../SearchParams';
import extractLabeledLocale from '../../../../utilities/extractLabeledLocale';

const LocaleContext = createContext('');
const LabeledLocaleContext = createContext(null);

export const LocaleProvider: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const { localization } = useConfig();

  const { user } = useAuth();
  const defaultLocale = (localization && localization.defaultLocale)
    ? localization.defaultLocale
    : 'en';
  const searchParams = useSearchParams();
  const [locale, setLocale] = useState<string>(
    (searchParams?.locale as string) || defaultLocale,
  );
  const [labeledLocale, setLabeledLocale] = useState<LabeledLocale | null>(
    localization && extractLabeledLocale(localization, locale),
  );
  const { getPreference, setPreference } = usePreferences();
  const localeFromParams = searchParams.locale;

  useEffect(() => {
    if (!localization) {
      return;
    }

    // set locale from search param
    if (
      localeFromParams
      && localization.localeCodes.indexOf(localeFromParams as string) > -1
    ) {
      setLocale(localeFromParams as string);
      setLabeledLocale(
        extractLabeledLocale(localization, localeFromParams as string),
      );
      if (user) setPreference('locale', localeFromParams);
      return;
    }

    // set locale from preferences or default
    (async () => {
      let preferenceLocale: string;
      let isPreferenceInConfig: boolean;
      if (user) {
        preferenceLocale = await getPreference<string>('locale');
        isPreferenceInConfig = preferenceLocale
          && localization.localeCodes.indexOf(preferenceLocale) > -1;
        if (isPreferenceInConfig) {
          setLocale(preferenceLocale);
          setLabeledLocale(
            extractLabeledLocale(localization, preferenceLocale as string),
          );
          return;
        }
        setPreference('locale', defaultLocale);
      }
      setLocale(defaultLocale);
      setLabeledLocale(extractLabeledLocale(localization, defaultLocale));
    })();
  }, [
    defaultLocale,
    getPreference,
    localeFromParams,
    setPreference,
    user,
    localization,
  ]);

  return (
    <LocaleContext.Provider value={locale}>
      <LabeledLocaleContext.Provider value={labeledLocale}>
        {children}
      </LabeledLocaleContext.Provider>
    </LocaleContext.Provider>
  );
};

/**
 * A hook that returns the current locale code.
 */
export const useLocaleCode = (): string => useContext(LocaleContext);

/**
 * A hook that returns the current locale object.
 */
export const useLocale = (): LabeledLocale | null => useContext(LabeledLocaleContext);
export default LocaleContext;
