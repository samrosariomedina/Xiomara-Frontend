import { LoginInput, SignupInput } from "@/lib/schemas";
import { setCookie, deleteCookie } from 'cookies-next';

export async function login(credentials: LoginInput) {
  try {
    // Ensure we're using the correct API endpoint
    const url = '/api/auth/login';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Invalid email or password');
      }
      throw new Error('Login failed');
    }

    const data = await response.json();
    // Store token in localStorage and cookies for future authenticated requests
    if (data.token) {
      // Store in localStorage for client-side access
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', data.token);
      }
      
      // Store in cookies for server-side access (middleware)
      setCookie('authToken', data.token, {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });
      
      return { success: true, token: data.token };
    } else {
      throw new Error('Authentication failed');
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

export async function signup(userData: SignupInput) {
  try {
    // Backend requires a name field that isn't in our form
    // Using email as name for now - you might want to add a name field to your form later
    const url = '/api/auth/signup';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        name: userData.email.split('@')[0], // Using part of email as name
      }),
    });

    if (!response.ok) {
      if (response.status === 409) {
        throw new Error('Email already in use');
      }
      throw new Error('Signup failed');
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

export async function checkAuth() {
  try {
    // Make sure we're on the client side
    if (typeof window === 'undefined') {
      return { authenticated: false };
    }
    
    const token = localStorage.getItem('authToken');
    if (!token) {
      return { authenticated: false };
    }

    const url = '/api/auth/check';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      return { authenticated: false, error: `Auth check failed with status: ${response.status}` };
    }

    return { authenticated: true };
  } catch (error) {
    return { authenticated: false, error: error instanceof Error ? error.message : 'Auth check failed' };
  }
}

export function logout() {
  try {
    // Remove from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
    
    // Remove from cookies
    deleteCookie('authToken', { path: '/' });
    
    return { success: true };
  } catch (error) {
    return { 
      success: false,
      error: error instanceof Error ? error.message : 'Logout failed'
    };
  }
}
