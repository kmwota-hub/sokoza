const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('sokoza_token');
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const text = await response.text();
  let data;

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data.data !== undefined ? data.data : data;
}