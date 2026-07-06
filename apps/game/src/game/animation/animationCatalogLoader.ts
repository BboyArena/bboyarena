import localAnimationCatalogData from './data/animations.json';
import type { AnimationCatalog } from './animationCatalogTypes';
import {
  AnimationCatalogValidationError,
  parseAnimationCatalog
} from './animationCatalogValidation';

export interface AnimationCatalogSource {
  readonly id: string;
  load(signal?: AbortSignal): Promise<AnimationCatalog>;
}

export type AnimationCatalogLoadState =
  | { status: 'idle' }
  | { status: 'loading'; sourceId: string }
  | {
      status: 'ready';
      sourceId: string;
      catalog: AnimationCatalog;
      usedFallback: boolean;
    }
  | {
      status: 'failed';
      sourceId: string;
      error: AnimationCatalogLoadError;
    };

export class AnimationCatalogLoadError extends Error {
  readonly sourceId: string;
  readonly cause: unknown;

  constructor(sourceId: string, message: string, cause?: unknown) {
    super(message);
    this.name = 'AnimationCatalogLoadError';
    this.sourceId = sourceId;
    this.cause = cause;
  }
}

const createAbortError = () => {
  if (typeof DOMException === 'function') {
    return new DOMException('Animation catalog loading was aborted.', 'AbortError');
  }

  const error = new Error('Animation catalog loading was aborted.');
  error.name = 'AbortError';
  return error;
};

const throwIfAborted = (signal?: AbortSignal) => {
  if (signal?.aborted) {
    throw createAbortError();
  }
};

const isAbortError = (error: unknown, signal?: AbortSignal) =>
  signal?.aborted === true ||
  (typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError');

const normalizeLoadError = (sourceId: string, error: unknown) => {
  if (error instanceof AnimationCatalogLoadError) {
    return error;
  }

  if (error instanceof AnimationCatalogValidationError) {
    return new AnimationCatalogLoadError(
      sourceId,
      `Animation catalog from "${sourceId}" failed validation.`,
      error
    );
  }

  return new AnimationCatalogLoadError(
    sourceId,
    `Animation catalog from "${sourceId}" could not be loaded.`,
    error
  );
};

export class LocalJsonAnimationCatalogSource implements AnimationCatalogSource {
  readonly id: string;
  private readonly data: unknown;

  constructor(data: unknown = localAnimationCatalogData, id = 'local-json') {
    this.data = data;
    this.id = id;
  }

  async load(signal?: AbortSignal): Promise<AnimationCatalog> {
    throwIfAborted(signal);
    await Promise.resolve();
    throwIfAborted(signal);
    return parseAnimationCatalog(this.data);
  }
}

type FetchResponse = {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
};

export type AnimationCatalogFetch = (
  input: string,
  init?: { signal?: AbortSignal }
) => Promise<FetchResponse>;

export class HttpAnimationCatalogSource implements AnimationCatalogSource {
  readonly id: string;
  private readonly url: string;
  private readonly fetchCatalog: AnimationCatalogFetch;

  constructor(
    url: string,
    fetchCatalog: AnimationCatalogFetch = globalThis.fetch as AnimationCatalogFetch,
    id = `http:${url}`
  ) {
    const normalizedUrl = url.trim();
    if (!normalizedUrl) {
      throw new Error('Animation catalog URL must be a non-empty string.');
    }
    if (typeof fetchCatalog !== 'function') {
      throw new Error('A fetch implementation is required for HTTP animation catalogs.');
    }

    this.url = normalizedUrl;
    this.fetchCatalog = fetchCatalog;
    this.id = id;
  }

  async load(signal?: AbortSignal): Promise<AnimationCatalog> {
    throwIfAborted(signal);
    const response = await this.fetchCatalog(this.url, { signal });
    throwIfAborted(signal);

    if (!response.ok) {
      throw new AnimationCatalogLoadError(
        this.id,
        `Animation catalog request failed with HTTP ${response.status}.`
      );
    }

    const data = await response.json();
    throwIfAborted(signal);
    return parseAnimationCatalog(data);
  }
}

export type AnimationCatalogSourceSelection = {
  primary: AnimationCatalogSource;
  fallback?: AnimationCatalogSource;
};

export type AnimationCatalogSourceOptions = {
  remoteUrl?: string | null;
  fetchCatalog?: AnimationCatalogFetch;
  localData?: unknown;
};

export function createAnimationCatalogSources(
  options: AnimationCatalogSourceOptions = {}
): AnimationCatalogSourceSelection {
  const fallback = new LocalJsonAnimationCatalogSource(options.localData);
  const remoteUrl = options.remoteUrl?.trim();

  if (!remoteUrl) {
    return { primary: fallback };
  }

  return {
    primary: new HttpAnimationCatalogSource(remoteUrl, options.fetchCatalog),
    fallback
  };
}

export async function loadAnimationCatalog(
  selection: AnimationCatalogSourceSelection,
  signal?: AbortSignal
): Promise<AnimationCatalogLoadState> {
  const { primary, fallback } = selection;

  try {
    const catalog = await primary.load(signal);
    return {
      status: 'ready',
      sourceId: primary.id,
      catalog,
      usedFallback: false
    };
  } catch (primaryError) {
    if (isAbortError(primaryError, signal)) {
      throw primaryError;
    }

    if (!fallback || fallback.id === primary.id) {
      return {
        status: 'failed',
        sourceId: primary.id,
        error: normalizeLoadError(primary.id, primaryError)
      };
    }

    try {
      const catalog = await fallback.load(signal);
      return {
        status: 'ready',
        sourceId: fallback.id,
        catalog,
        usedFallback: true
      };
    } catch (fallbackError) {
      if (isAbortError(fallbackError, signal)) {
        throw fallbackError;
      }

      return {
        status: 'failed',
        sourceId: fallback.id,
        error: new AnimationCatalogLoadError(
          fallback.id,
          `Primary animation catalog "${primary.id}" and fallback "${fallback.id}" both failed.`,
          {
            primary: normalizeLoadError(primary.id, primaryError),
            fallback: normalizeLoadError(fallback.id, fallbackError)
          }
        )
      };
    }
  }
}
