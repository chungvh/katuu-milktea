import { supabase, isSupabaseConfigured } from '@/config/supabase';

/**
 * Authentication Service using Supabase
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

// Simple in-memory fallback users (when Supabase not configured)
const FALLBACK_USERS = {
  admin: { username: 'admin', password: 'admin123', role: 'admin' as const, displayName: 'Administrator' },
  staff: { username: 'staff', password: 'staff123', role: 'staff' as const, displayName: 'Staff Member' }
};

/**
 * Login with username and password
 * Returns user info and token
 */
export async function login(username: string, password: string): Promise<LoginResponse> {
  if (!isSupabaseConfigured()) {
    // Fallback to in-memory users
    console.warn('Using fallback authentication (Supabase not configured)');
    const user = Object.values(FALLBACK_USERS).find(
      u => u.username === username && u.password === password
    );

    if (user) {
      const token = btoa(`${user.username}:${user.role}`); // Simple token
      return {
        success: true,
        user: {
          username: user.username,
          role: user.role,
          displayName: user.displayName
        },
        token
      };
    }

    return {
      success: false,
      error: 'Invalid username or password'
    };
  }

  try {
    // Query Supabase users table
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !data) {
      return {
        success: false,
        error: 'Invalid username or password'
      };
    }

    // Note: In production, password should be hashed and verified properly
    // For now, we'll do simple comparison (NOT SECURE - for demo only!)
    if (password !== data.password_hash) {
      return {
        success: false,
        error: 'Invalid username or password'
      };
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', data.id);

    // Create simple token
    const token = btoa(`${data.username}:${data.role}:${data.id}`);

    return {
      success: true,
      user: {
        id: data.id,
        username: data.username,
        role: data.role,
        displayName: data.display_name || data.username
      },
      token
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: 'Login failed. Please try again.'
    };
  }
}

/**
 * Verify token and get user info
 */
export async function verifyToken(token: string): Promise<User | null> {
  try {
    const decoded = atob(token);
    const [username, role, id] = decoded.split(':');

    if (!username || !role) {
      return null;
    }

    if (!isSupabaseConfigured()) {
      // Fallback
      const user = Object.values(FALLBACK_USERS).find(u => u.username === username);
      return user ? {
        username: user.username,
        role: user.role,
        displayName: user.displayName
      } : null;
    }

    // Verify with Supabase
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      username: data.username,
      role: data.role,
      displayName: data.display_name || data.username
    };
  } catch (error) {
    console.error('Token verification error:', error);
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
