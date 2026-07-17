export const authStorageKey = "bboyarena.auth.token";

export const getPublicApiUrl = () =>
  import.meta.env.PUBLIC_API_URL?.trim() || "http://localhost:8787";
