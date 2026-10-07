export type TelemetryPreference = 'disabled' | 'enabled';

type AnalyticsParameters = Record<string, boolean | number | string | undefined>;

const TELEMETRY_STORAGE_KEY = 'eva-labs-telemetry';
const measurementId = process.env['NEXT_PUBLIC_GA_MEASUREMENT_ID'];

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...arguments_: unknown[]) => void;
  }
}

function isTelemetryPreference(value: string | null): value is TelemetryPreference {
  return value === 'disabled' || value === 'enabled';
}

function isAnalyticsEnabled(preference: TelemetryPreference) {
  return Boolean(measurementId) && preference === 'enabled';
}

function setGoogleAnalyticsDisabled(disabled: boolean) {
  if (measurementId) {
    Reflect.set(window, `ga-disable-${measurementId}`, disabled);
  }
}

function ensureAnalyticsIsLoaded(preference: TelemetryPreference) {
  if (!isAnalyticsEnabled(preference) || !measurementId) {
    return;
  }

  setGoogleAnalyticsDisabled(false);
  window.dataLayer ??= [];
  window.gtag ??= function gtag() {
    // Google Tag expects the native Arguments object in dataLayer.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer?.push(arguments);
  };

  if (document.querySelector(`script[data-ga-measurement-id="${measurementId}"]`)) {
    return;
  }

  window.gtag('js', new Date());
  window.gtag('consent', 'default', { analytics_storage: 'granted' });
  window.gtag('config', measurementId, { send_page_view: false });

  const script = document.createElement('script');
  script.async = true;
  script.dataset['gaMeasurementId'] = measurementId;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.append(script);
}

export function getTelemetryPreference(): TelemetryPreference {
  if (typeof window === 'undefined') {
    return 'enabled';
  }

  const preference = window.localStorage.getItem(TELEMETRY_STORAGE_KEY);

  return isTelemetryPreference(preference) ? preference : 'enabled';
}

export function setTelemetryPreference(preference: TelemetryPreference) {
  window.localStorage.setItem(TELEMETRY_STORAGE_KEY, preference);

  if (preference === 'disabled') {
    setGoogleAnalyticsDisabled(true);
    window.gtag?.('consent', 'update', { analytics_storage: 'denied' });
    return;
  }

  ensureAnalyticsIsLoaded(preference);
}

export function initializeAnalytics(preference: TelemetryPreference) {
  setGoogleAnalyticsDisabled(!isAnalyticsEnabled(preference));

  if (isAnalyticsEnabled(preference)) {
    ensureAnalyticsIsLoaded(preference);
  }
}

export function trackEvent(name: string, parameters?: AnalyticsParameters) {
  const preference = getTelemetryPreference();

  if (!isAnalyticsEnabled(preference)) {
    return;
  }

  ensureAnalyticsIsLoaded(preference);
  window.gtag?.('event', name, parameters);
}

export function trackPageView(path: string) {
  trackEvent('page_view', {
    page_location: window.location.href,
    page_path: path,
    page_title: document.title,
  });
}
