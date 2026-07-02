export type SupportPlatformId = 'buyMeACoffee' | 'patreon';

export interface SupportPlatform {
  id: SupportPlatformId;
  label: string;
  href: string;
}

const isEnabled = (value: string | undefined) => ['1', 'true', 'yes', 'on'].includes(value?.trim().toLowerCase() ?? '');

const toPublicUrl = (value: string | undefined) => {
  const candidate = value?.trim();
  if (!candidate) return undefined;

  try {
    const url = new URL(candidate);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : undefined;
  } catch {
    return undefined;
  }
};

const supportEnabled = isEnabled(import.meta.env.PUBLIC_SUPPORT_ENABLED);

const candidates = [
  {
    id: 'buyMeACoffee' as const,
    label: 'Buy Me a Coffee',
    enabled: isEnabled(import.meta.env.PUBLIC_BUYMEACOFFEE_ENABLED),
    href: toPublicUrl(import.meta.env.PUBLIC_BUYMEACOFFEE_URL)
  },
  {
    id: 'patreon' as const,
    label: 'Patreon',
    enabled: isEnabled(import.meta.env.PUBLIC_PATREON_ENABLED),
    href: toPublicUrl(import.meta.env.PUBLIC_PATREON_URL)
  }
];

export const supportPlatforms: SupportPlatform[] = supportEnabled
  ? candidates
      .filter((platform): platform is typeof platform & { href: string } => platform.enabled && Boolean(platform.href))
      .map(({ id, label, href }) => ({ id, label, href }))
  : [];

export const isSupportVisible = supportPlatforms.length > 0;
