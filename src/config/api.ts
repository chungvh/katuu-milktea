/**
 * Central API client configuration for Katuu Milk Tea
 * Communicates with the Laravel backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface FetchOptions extends RequestInit {
  data?: any;
}

export async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  
  // Set JSON content type if not uploading files
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');
  }

  // Set auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  if (options.data) {
    fetchOptions.body = JSON.stringify(options.data);
  }

  const response = await fetch(url, fetchOptions);

  if (response.status === 204) {
    return {} as T;
  }

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch (e) {
      // Ignore parsing errors on failed requests
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
