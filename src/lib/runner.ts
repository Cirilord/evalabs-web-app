export const PYODIDE_RUNNERS = [
  {
    id: 'pyodide-022',
    pyodideVersion: '0.22.1',
    pythonVersion: '3.10',
  },
  {
    id: 'pyodide-025',
    pyodideVersion: '0.25.1',
    pythonVersion: '3.11',
  },
  {
    id: 'pyodide-026',
    pyodideVersion: '0.26.4',
    pythonVersion: '3.12',
  },
  {
    id: 'pyodide-029',
    pyodideVersion: '0.29.3',
    pythonVersion: '3.13',
  },
  {
    id: 'pyodide-314',
    pyodideVersion: '314.0.7',
    pythonVersion: '3.14',
  },
] as const;

export type PyodideRunnerId = (typeof PYODIDE_RUNNERS)[number]['id'];

export const DEFAULT_PYODIDE_RUNNER_ID: PyodideRunnerId = 'pyodide-314';

export function isPyodideRunnerId(value: string): value is PyodideRunnerId {
  return PYODIDE_RUNNERS.some((runner) => runner.id === value);
}

export function getPyodideRunner(runnerId: PyodideRunnerId) {
  const runner = PYODIDE_RUNNERS.find((item) => item.id === runnerId);

  if (!runner) {
    throw new Error(`Unsupported Pyodide runner: ${runnerId}`);
  }

  return runner;
}

export function getPyodideRunnerLabel(runnerId: PyodideRunnerId) {
  const runner = getPyodideRunner(runnerId);

  return `Pyodide ${runner.pyodideVersion} (Python ${runner.pythonVersion})`;
}
