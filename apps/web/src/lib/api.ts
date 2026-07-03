const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; role: string };
};

export function getSession(): AuthSession | null {
  const raw = localStorage.getItem('trading-copilot-session');
  return raw ? (JSON.parse(raw) as AuthSession) : null;
}

export function setSession(session: AuthSession | null) {
  if (session) localStorage.setItem('trading-copilot-session', JSON.stringify(session));
  else localStorage.removeItem('trading-copilot-session');
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const session = getSession();
  if (session) headers.set('Authorization', `Bearer ${session.accessToken}`);
  if (!(init.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<T>;
}

export async function upload<T>(path: string, file: File): Promise<T> {
  const form = new FormData();
  form.append('file', file);
  return api<T>(path, { method: 'POST', body: form });
}
