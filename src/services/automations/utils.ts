export function getCloneAutomationName(name: string): string {
  const suffix = ' copy';

  return `${name.slice(0, 100 - suffix.length).trimEnd()}${suffix}`;
}
