'use client';

import { useEffect, useState } from 'react';

import { trackEvent } from '@/lib/analytics';

import { OnboardingScreen } from '../OnboardingScreen';
import { type OnboardingGateProps } from './types';

const ONBOARDING_COMPLETED_KEY = 'eva-labs-onboarding-completed';

export function OnboardingGate(props: Readonly<OnboardingGateProps>) {
  const { children } = props;
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    const completed = window.localStorage.getItem(ONBOARDING_COMPLETED_KEY) === 'true';

    void Promise.resolve().then(() => setIsOnboardingComplete(completed));
  }, []);

  function completeOnboarding() {
    window.localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    trackEvent('onboarding_completed');
    setIsOnboardingComplete(true);
  }

  if (isOnboardingComplete === null) {
    return null;
  }

  if (!isOnboardingComplete) {
    return <OnboardingScreen onComplete={completeOnboarding} />;
  }

  return children;
}
