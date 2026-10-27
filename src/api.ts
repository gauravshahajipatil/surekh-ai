export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status = 500, details?: unknown) { super(message); this.name = 'ApiError'; this.status = status; this.details = details; }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      credentials: 'include',
      ...init,
      headers: {
        ...(init.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(init.headers || {}),
      },
    });
  } catch {
    throw new ApiError('Cannot reach the SUREKH API. Start the app with npm run dev and check port 4000.', 0);
  }
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const json = await response.json() as { data?: T; error?: string; issues?: unknown };
    if (!response.ok) throw new ApiError(json.error || 'Request failed.', response.status, json.issues);
    return (Object.prototype.hasOwnProperty.call(json, 'data') ? json.data : json) as T;
  }
  if (!response.ok) throw new ApiError(`Request failed (${response.status}).`, response.status);
  return await response.blob() as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  upload: <T>(path: string, form: FormData) => request<T>(path, { method: 'POST', body: form }),
  logout: () => request<{ ok: boolean }>('/auth/logout', { method: 'POST', body: '{}' }),
  download: async (path: string, filename: string) => {
    let response: Response;
    try { response = await fetch(`/api${path}`, { credentials: 'include' }); }
    catch { throw new ApiError('Cannot reach the SUREKH API.', 0); }
    if (!response.ok) {
      let message = 'Could not download file.';
      try { message = ((await response.json()) as { error?: string }).error || message; } catch { /* no-op */ }
      throw new ApiError(message, response.status);
    }
    const blob = await response.blob(); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
  },
};
