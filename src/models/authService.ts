import { apiFetch } from '@/config/api';

/**
 * Authentication Service using Laravel Backend
 */

export interface User {
  id?: string;
  username: string;
  role: 'admin' | 'staff' | 'guest';
  displayName?: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

/**
 * Login with username and password
 * Returns user info and token
 */
export async function login(username: string, password: string): Promise<LoginResponse> {
  try {
    const response = await apiFetch<LoginResponse>('/api/login', {
      method: 'POST',
      data: { username, password }
    });

    if (response.success && response.token) {
      localStorage.setItem('authToken', response.token);
    }

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login failed. Please try again.'
    };
  }
}

/**
 * Verify token and get user info
 */
export async function verifyToken(token: string): Promise<User | null> {
  try {
    // Temporarily save token so apiFetch can use it in header
    localStorage.setItem('authToken', token);
    const user = await apiFetch<User>('/api/verify', {
      method: 'GET'
    });
    return user;
  } catch (error) {
    console.error('Token verification error:', error);
    localStorage.removeItem('authToken');
    return null;
  }
}

/**
 * Get current user from localStorage token
 */
export async function getCurrentUser(): Promise<User | null> {
  const token = localStorage.getItem('authToken');
  if (!token) {
    return null;
  }

  return verifyToken(token);
}
