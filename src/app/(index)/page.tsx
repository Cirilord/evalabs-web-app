'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { Button } from '@/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/card';

import { type HomePageProps } from './types';

export default function HomePage(props: HomePageProps) {
  void props;
  const { t } = useTranslation();

  return (
    <main className="grid min-h-full place-items-center bg-muted/30 p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>EVA Labs</CardTitle>
          <CardDescription>{t('home.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{t('home.description')}</p>
        </CardContent>
        <CardFooter>
          <Button
            className="!bg-card !text-card-foreground hover:!bg-card/80"
            nativeButton={false}
            render={<Link href="/automations/new" />}
            type="button"
          >
            {t('home.createAutomation')}
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
