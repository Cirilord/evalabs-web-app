'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

import { type ReactQueryProviderProps } from './types';

export function ReactQueryProvider(props: ReactQueryProviderProps) {
  const { children } = props;
  const [queryClient] = useState(() => new QueryClient());

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
