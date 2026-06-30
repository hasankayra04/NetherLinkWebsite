export const API_BASE = "https://api.mccompanion.net";

export async function authedFetch(url, options = {}, getToken) {
  const token = getToken ? await getToken() : null;
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
