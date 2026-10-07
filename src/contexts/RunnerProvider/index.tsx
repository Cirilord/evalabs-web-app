'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import { DEFAULT_PYODIDE_RUNNER_ID, isPyodideRunnerId, type PyodideRunnerId } from '@/lib/runner';

import { type RunnerContextValue, type RunnerProviderProps } from './types';

const RUNNER_STORAGE_KEY = 'eva-labs-runner';
const RunnerContext = createContext<RunnerContextValue | null>(null);

export function RunnerProvider(props: RunnerProviderProps) {
  const { children } = props;
  const [runnerId, setRunnerIdState] = useState<PyodideRunnerId>(DEFAULT_PYODIDE_RUNNER_ID);

  useEffect(() => {
    const storedRunnerId = window.localStorage.getItem(RUNNER_STORAGE_KEY);

    if (storedRunnerId && isPyodideRunnerId(storedRunnerId)) {
      void Promise.resolve().then(() => setRunnerIdState(storedRunnerId));
    }
  }, []);

  function setRunnerId(nextRunnerId: PyodideRunnerId) {
    window.localStorage.setItem(RUNNER_STORAGE_KEY, nextRunnerId);
    setRunnerIdState(nextRunnerId);
  }

  return (
    <RunnerContext.Provider value={{ runnerId, setRunnerId }}>{children}</RunnerContext.Provider>
  );
}

export function useRunner() {
  const runner = useContext(RunnerContext);

  if (!runner) {
    throw new Error('useRunner must be used within RunnerProvider.');
  }

  return runner;
}
