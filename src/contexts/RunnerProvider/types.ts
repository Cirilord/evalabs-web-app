import { type ReactNode } from 'react';

import { type PyodideRunnerId } from '@/lib/runner';

export type RunnerProviderProps = Readonly<{
  children: ReactNode;
}>;

export type RunnerContextValue = Readonly<{
  runnerId: PyodideRunnerId;
  setRunnerId: (runnerId: PyodideRunnerId) => void;
}>;
