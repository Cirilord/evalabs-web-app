import { Button } from '@/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/card';

import { type HomePageProps } from './types';

export default function HomePage(props: HomePageProps) {
  void props;

  return (
    <main className="grid min-h-screen place-items-center bg-muted/30 p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>shadcn/ui</CardTitle>
          <CardDescription>Base UI components are ready to use.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This page uses the shadcn Card and Button components.</p>
        </CardContent>
        <CardFooter>
          <Button type="button">Get started</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
