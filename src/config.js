// src/config.js
export const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export async function handleApiResponse(res) {
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || data.message || `Request failed (${res.status})`);
    }
    return data;
  } else {
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('API endpoint not found (404). Please verify backend server is running.');
      }
      if (res.status === 502 || res.status === 504 || res.status === 503) {
        throw new Error(`Backend server unreachable (${res.status} ${res.statusText}).`);
      }
      throw new Error(`Server returned status ${res.status} ${res.statusText}`);
    }
    throw new Error('Received HTML or non-JSON response from server.');
  }
}
