export const AUTH_BASE = "http://localhost:8000";

const req = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const r = await fetch(`/api${path}`, {
    credentials: "include",
    ...init,
    headers: init?.body
      ? { "content-type": "application/json", ...init.headers }
      : init?.headers,
  });
  if (!r.ok) throw new Error(`api ${r.status}`);
  if (r.status === 204) return undefined as T;
  return (await r.json()) as T;
};

export const getJson = <T>(path: string): Promise<T> => req<T>(path);

export const postJson = <T>(path: string, body?: unknown): Promise<T> =>
  req<T>(path, {
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
  });

export const patchJson = <T>(path: string, body: unknown): Promise<T> =>
  req<T>(path, { method: "PATCH", body: JSON.stringify(body) });

export const delJson = <T>(path: string): Promise<T> =>
  req<T>(path, { method: "DELETE" });
