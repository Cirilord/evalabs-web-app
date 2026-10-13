'use client';

import { useEffect, useState } from 'react';

import { trackEvent } from '@/lib/analytics';

import { OnboardingScreen } from '../OnboardingScreen';
import { OnboardingTutorial } from '../OnboardingTutorial';
import { type OnboardingGateProps } from './types';

const ONBOARDING_COMPLETED_KEY = 'eva-labs-onboarding-completed';
const TUTORIAL_COMPLETED_KEY = 'eva-labs-tutorial-completed';

export function OnboardingGate(props: Readonly<OnboardingGateProps>) {
  const { children } = props;
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);
  const [isTutorialComplete, setIsTutorialComplete] = useState<boolean | null>(null);

  useEffect(() => {
    const completed = window.localStorage.getItem(ONBOARDING_COMPLETED_KEY) === 'true';
    const tutorialCompleted = window.localStorage.getItem(TUTORIAL_COMPLETED_KEY) === 'true';

    void Promise.resolve().then(() => setIsOnboardingComplete(completed));
    void Promise.resolve().then(() => setIsTutorialComplete(tutorialCompleted));
  }, []);

  function completeOnboarding() {
    window.localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    trackEvent('onboarding_completed');
    setIsOnboardingComplete(true);
  }

  function completeTutorial() {
    window.localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
    setIsTutorialComplete(true);
  }

  if (isOnboardingComplete === null || isTutorialComplete === null) {
    return null;
  }

  if (!isOnboardingComplete) {
    return <OnboardingScreen onComplete={completeOnboarding} />;
  }

  return (
    <>
      {children}
      {!isTutorialComplete && <OnboardingTutorial onComplete={completeTutorial} />}
    </>
  );
}
