'use client';

import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';

import {
  getTelemetryPreference,
  initializeAnalytics,
  setTelemetryPreference,
  type TelemetryPreference,
  trackPageView,
} from '@/lib/analytics';

import { type TelemetryContextValue, type TelemetryProviderProps } from './types';

const TelemetryContext = createContext<TelemetryContextValue | null>(null);

export function TelemetryProvider(props: TelemetryProviderProps) {
  const { children } = props;
  const pathname = usePathname();
  const [telemetry, setTelemetryState] = useState<TelemetryPreference>('enabled');

  useEffect(() => {
    const preference = getTelemetryPreference();

    initializeAnalytics(preference);
    void Promise.resolve().then(() => setTelemetryState(preference));
  }, []);

  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  function setTelemetry(preference: TelemetryPreference) {
    setTelemetryPreference(preference);
    setTelemetryState(preference);
  }

  return (
    <TelemetryContext.Provider value={{ setTelemetry, telemetry }}>
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetry() {
  const telemetry = useContext(TelemetryContext);

  if (!telemetry) throw new Error('useTelemetry must be used within TelemetryProvider.');

  return telemetry;
}
