type AnalyticsValue = string | number | boolean;
type AnalyticsData = Record<string, AnalyticsValue>;

interface UmamiTracker {
  track: (eventName: string, data?: AnalyticsData) => void;
  identify: (data: AnalyticsData) => void;
}

declare global {
  interface Window {
    umami?: UmamiTracker;
  }

  interface Navigator {
    standalone?: boolean;
  }
}

type LaunchMode = 'pwa' | 'browser';

interface PwaAnalyticsOptions {
  appVersion: string;
}

const TRACKER_WAIT_MS = 10_000;
const TRACKER_POLL_MS = 100;
const FIRST_PWA_OPEN_KEY = 'bboyarena-pwa-seen';
const SESSION_OPEN_KEY_PREFIX = 'bboyarena-launch';

const getLaunchMode = (): LaunchMode =>
  window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true ? 'pwa' : 'browser';

const getPlatform = (): string => {
  const userAgent = navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
  if (userAgent.includes('android')) return 'android';
  if (userAgent.includes('windows')) return 'windows';
  if (userAgent.includes('mac os')) return 'macos';
  if (userAgent.includes('linux')) return 'linux';

  return 'other';
};

const safeStorageGet = (storage: Storage, key: string): string | null => {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
};

const safeStorageSet = (storage: Storage, key: string): void => {
  try {
    storage.setItem(key, '1');
  } catch {
    // Analytics must keep working when storage is unavailable or restricted.
  }
};

const waitForTracker = async (): Promise<UmamiTracker | undefined> => {
  if (window.umami) return window.umami;

  const startedAt = Date.now();

  return new Promise((resolve) => {
    const poll = window.setInterval(() => {
      if (window.umami || Date.now() - startedAt >= TRACKER_WAIT_MS) {
        window.clearInterval(poll);
        resolve(window.umami);
      }
    }, TRACKER_POLL_MS);
  });
};

export const initializePwaAnalytics = ({ appVersion }: PwaAnalyticsOptions): void => {
  const launchMode = getLaunchMode();
  const platform = getPlatform();
  const commonData: AnalyticsData = {
    mode: launchMode === 'pwa' ? 'standalone' : 'browser',
    platform,
    app_version: appVersion
  };

  const track = async (eventName: string, data: AnalyticsData = commonData): Promise<void> => {
    const tracker = await waitForTracker();
    tracker?.track(eventName, data);
  };

  void waitForTracker().then((tracker) => {
    tracker?.identify({
      launch_mode: launchMode,
      install_state: launchMode === 'pwa' ? 'installed' : 'unknown',
      app_version: appVersion,
      platform
    });
  });

  const sessionOpenKey = `${SESSION_OPEN_KEY_PREFIX}-${launchMode}`;
  if (!safeStorageGet(window.sessionStorage, sessionOpenKey)) {
    safeStorageSet(window.sessionStorage, sessionOpenKey);
    void track(launchMode === 'pwa' ? 'pwa-open' : 'browser-open');
  }

  if (launchMode === 'pwa' && !safeStorageGet(window.localStorage, FIRST_PWA_OPEN_KEY)) {
    safeStorageSet(window.localStorage, FIRST_PWA_OPEN_KEY);
    void track('pwa-first-open');
  }

  window.addEventListener(
    'beforeinstallprompt',
    () => {
      void track('pwa-install-available');
    },
    { once: true }
  );

  window.addEventListener(
    'appinstalled',
    () => {
      void track('pwa-installed', {
        ...commonData,
        install_state: 'installed'
      });
    },
    { once: true }
  );
};
