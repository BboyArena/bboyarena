const ABSOLUTE_URL_PATTERN = /^(?:[a-z][a-z\d+.-]*:)?\/\//i;
const PROTOCOL_URL_PATTERN = /^[a-z][a-z\d+.-]*:/i;

const normalizeBasePath = (value: string | undefined) => {
  if (!value || value === '.') {
    return '/';
  }

  const trimmed = value.trim();

  if (!trimmed || trimmed === '/') {
    return '/';
  }

  const prefixed = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return prefixed.endsWith('/') ? prefixed : `${prefixed}/`;
};

export const getBasePath = () => normalizeBasePath(import.meta.env.BASE_URL as string | undefined);

export const isExternalUrl = (value: string) => ABSOLUTE_URL_PATTERN.test(value) || PROTOCOL_URL_PATTERN.test(value);

export const withBasePath = (pathname: string) => {
  if (!pathname || pathname.startsWith('#') || isExternalUrl(pathname)) {
    return pathname;
  }

  const basePath = getBasePath();

  if (basePath === '/') {
    return pathname.startsWith('/') ? pathname : `/${pathname}`;
  }

  if (pathname.startsWith(basePath)) {
    return pathname;
  }

  const normalized = pathname.startsWith('/') ? pathname.slice(1) : pathname;
  return normalized ? `${basePath}${normalized}` : basePath;
};
