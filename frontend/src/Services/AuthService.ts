// src/Services/authService.ts

export interface User {
  id: number;
  name: string;
  email: string;
  specialisation?: string;
  contact?: string;
}

const API_URL = 'http://127.0.0.1:8000/api/v1';

const getToken = () => localStorage.getItem('token');

export const authService = {
  // -------------------------------
  // Register new user
  // -------------------------------
  registerUser: async (
    name: string,
    email: string,
    password: string,
    contact?: string,
    specialisation: string = 'Doctor'
  ): Promise<{ user: User; access_token: string }> => {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, contact, specialisation }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw err;
    }

    const result = await res.json();
    localStorage.setItem('token', result.access_token);
    localStorage.setItem('role', result.user.specialisation ?? '');
    localStorage.setItem('name', result.user.name);
    return result;
  },

  // -------------------------------
  // Login existing user
  // -------------------------------
  loginUser: async (
    email: string,
    password: string
  ): Promise<{ user: User; access_token: string }> => {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw err;
    }

    const result = await res.json();
    localStorage.setItem('token', result.access_token);
    localStorage.setItem('role', result.user.specialisation ?? '');
    localStorage.setItem('name', result.user.name);
    return result;
  },

  // -------------------------------
  // Logout
  // -------------------------------
  logoutUser: async (): Promise<void> => {
    const token = getToken();
    if (!token) return;

    await fetch(`${API_URL}/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
  },

  // -------------------------------
  // Get current authenticated user
  // -------------------------------
  getCurrentUser: async (): Promise<User | null> => {
    const token = getToken();
    if (!token) return null;

    try {
      const res = await fetch(`${API_URL}/user`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        console.error('Failed to fetch user:', res.status);
        return null;
      }

      const data = await res.json();
      // Ensure the user object is returned consistently
      return data.user ?? data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  },

  // -------------------------------
  // Check if user is authenticated
  // -------------------------------
  isAuthenticated: (): boolean => {
    return !!getToken();
  },
};