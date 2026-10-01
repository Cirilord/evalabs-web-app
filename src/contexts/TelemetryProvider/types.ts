import { type ReactNode } from 'react';

import { type TelemetryPreference } from '@/lib/analytics';

export type TelemetryProviderProps = Readonly<{
  children: ReactNode;
}>;

export type TelemetryContextValue = Readonly<{
  setTelemetry: (telemetry: TelemetryPreference) => void;
  telemetry: TelemetryPreference;
}>;
