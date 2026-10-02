import { type Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { AppLayout } from '@/components/AppLayout';
import { LocaleProvider } from '@/contexts/LocaleProvider';
import { ReactQueryProvider } from '@/contexts/ReactQueryProvider';
import { RunnerProvider } from '@/contexts/RunnerProvider';
import { TelemetryProvider } from '@/contexts/TelemetryProvider';
import { ThemeProvider } from '@/contexts/ThemeProvider';

import './globals.css';
import { type RootLayoutProps } from './types';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'EVA Labs',
  description: 'Create and run Python automations.',
};

export const dynamic = 'force-dynamic';

export default function RootLayout(props: RootLayoutProps) {
  const { children } = props;

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <LocaleProvider>
          <ReactQueryProvider>
            <TelemetryProvider>
              <RunnerProvider>
                <ThemeProvider>
                  <AppLayout>{children}</AppLayout>
                </ThemeProvider>
              </RunnerProvider>
            </TelemetryProvider>
          </ReactQueryProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
