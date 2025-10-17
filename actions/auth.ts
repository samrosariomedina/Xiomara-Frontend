'use server'

import { LoginInput, SignupInput, User, LoginResponse } from "@/lib/types";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888';

/**
 * Server action to login a user
 */
export async function loginAction(credentials: LoginInput): Promise<LoginResponse> {
  try {
    const response = await axios.post(`${BACKEND_URL}/auth/login`, {
      email: credentials.email,
      password: credentials.password,
    });

    if (response.status === 200 && response.data.token) {
      // Store token in httpOnly cookie
      const cookieStore = await cookies();
      cookieStore.set('authToken', response.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
        sameSite: 'lax'
      });
      
      // Check user approval status
      try {
        const profileResult = await getUserProfileAction();
        if (profileResult.success && profileResult.user) {
          const isApproved = profileResult.user.approved;
          
          revalidatePath('/');
          
          return { 
            success: true, 
            token: response.data.token,
            user: profileResult.user,
            approved: isApproved
          };
        } else {
          // If profile fetch fails, still allow login but mark as unknown approval
          revalidatePath('/');
          
          return { 
            success: true, 
            token: response.data.token,
            approved: false // Default to false for safety
          };
        }
      } catch (profileError) {
        console.error('Profile fetch error during login:', profileError);
        // If profile check fails, still allow login but mark as unknown approval
        revalidatePath('/');
        
        return { 
          success: true, 
          token: response.data.token,
          approved: false // Default to false for safety
        };
      }
    } else {
      throw new Error('Authentication failed');
    }
  } catch (error: unknown) {
    console.error('Login error:', error);

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 403) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      } else if (axiosError.response?.status === 400) {
        return {
          success: false,
          error: 'Please provide valid email and password'
        };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login failed. Please try again.'
    };
  }
}

/**
 * Server action to sign up a new user
 */
export async function signupAction(userData: SignupInput) {
  try {
    const response = await axios.post(`${BACKEND_URL}/auth/signup`, {
      email: userData.email,
      password: userData.password,
      name: userData.name || userData.email.split('@')[0], // Use email prefix as name if not provided
    });

    if (response.status === 200) {
      return { success: true };
    } else {
      throw new Error('Signup failed');
    }
  } catch (error: unknown) {
    console.error('Signup error:', error);

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 409) {
        return {
          success: false,
          error: 'Email already in use. Please use a different email.'
        };
      } else if (axiosError.response?.status === 400) {
        return {
          success: false,
          error: 'Please provide valid information'
        };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Signup failed. Please try again.'
    };
  }
}

/**
 * Server action to get the current user profile
 */
export async function getUserProfileAction(): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      return { success: false, error: 'No authentication token found' };
    }

    const response = await axios.post(`${BACKEND_URL}/profile`, {
      token: token
    });

    if (response.status === 200) {
      return { 
        success: true, 
        user: response.data 
      };
    } else {
      throw new Error('Failed to fetch user profile');
    }
  } catch (error: unknown) {
    console.error('Get user profile error:', error);

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 401) {
        return { success: false, error: 'Unauthorized' };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch user profile'
    };
  }
}

/**
 * Server action to get the current user ID
 */
export async function getCurrentUserIdAction(): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    const profileResult = await getUserProfileAction();
    if (profileResult.success && profileResult.user) {
      return { 
        success: true, 
        userId: profileResult.user._id 
      };
    } else {
      return { 
        success: false, 
        error: profileResult.error || 'Failed to get user ID' 
      };
    }
  } catch (error: unknown) {
    console.error('Get current user ID error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get user ID'
    };
  }
}

/**
 * Server action to check if user is authenticated
 */
export async function checkAuthAction(): Promise<{ success: boolean; authenticated: boolean; error?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      return { success: true, authenticated: false };
    }

    const response = await axios.post(`${BACKEND_URL}/auth/check`, {
      token: token
    });

    return { 
      success: true, 
      authenticated: response.status === 200 
    };
  } catch (error: unknown) {
    console.error('Check auth error:', error);

    return {
      success: true,
      authenticated: false
    };
  }
}

/**
 * Server action to logout a user
 */
export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (token) {
      // Call backend to invalidate session
      try {
        await axios.post(`${BACKEND_URL}/auth/logout`, {
          token: token
        });
      } catch (error) {
        console.error('Error logging out on backend:', error);
        // Continue with local logout even if backend call fails
      }
    }

    // Delete the cookie
    cookieStore.delete('authToken');
    
    // Revalidate auth-dependent paths
    revalidatePath('/');
    
    return { success: true };
  } catch (error: unknown) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Logout failed'
    };
  }
}


/**
 * Server action to send forgot password email
 */
export async function forgotPasswordAction(email: string) {
  try {
    const response = await axios.post(`${BACKEND_URL}/auth/recover`, {
      email: email
    });

    if (response.status === 200) {
      return { success: true };
    } else {
      throw new Error('Forgot password request failed');
    }
  } catch (error: unknown) {
    console.error('Forgot password error:', error);

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 400) {
        return {
          success: false,
          error: 'Please provide a valid email address'
        };
      } else if (axiosError.response?.status === 501) {
        return {
          success: false,
          error: 'Email service is not available. Please try again later.'
        };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Forgot password request failed. Please try again.'
    };
  }
}

/**
 * Server action to recover password with token
 */
export async function recoverPasswordAction(token: string, password: string) {
  try {
    const response = await axios.post(`${BACKEND_URL}/auth/recover`, {
      token: token,
      password: password
    });

    if (response.status === 200) {
      return { success: true };
    } else {
      throw new Error('Password recovery failed');
    }
  } catch (error: unknown) {
    console.error('Recover password error:', error);

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 400) {
        return {
          success: false,
          error: 'Invalid request parameters'
        };
      } else if (axiosError.response?.status === 403) {
        return {
          success: false,
          error: 'Invalid or expired token'
        };
      } else if (axiosError.response?.status === 500) {
        return {
          success: false,
          error: 'Failed to update password. Please try again.'
        };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Password recovery failed. Please try again.'
    };
  }
}

/**
 * Server action to reset password for authenticated user
 */
export async function resetPasswordAction(data: {
  passwordOld: string;
  passwordNew: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    // Validate input data
    if (!data.passwordOld || typeof data.passwordOld !== 'string' || data.passwordOld.trim() === '') {
      return { success: false, error: 'Current password is required' };
    }

    if (!data.passwordNew || typeof data.passwordNew !== 'string' || data.passwordNew.trim() === '') {
      return { success: false, error: 'New password is required' };
    }

    // Debug logging to help identify the issue
    console.log('Reset password request:', {
      passwordOldLength: data.passwordOld?.length || 0,
      passwordNewLength: data.passwordNew?.length || 0,
      passwordOldType: typeof data.passwordOld,
      passwordNewType: typeof data.passwordNew,
      hasToken: !!token
    });

    const response = await axios.post(`${BACKEND_URL}/auth/reset`, {
      token: token,
      password_old: data.passwordOld,
      password_new: data.passwordNew
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      return { success: true };
    } else {
      throw new Error('Failed to reset password');
    }
  } catch (error: unknown) {
    console.error('Reset password error:', error);

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number; data?: unknown } };
      if (axiosError.response?.status === 401) {
        return { success: false, error: 'Authentication required' };
      } else if (axiosError.response?.status === 403) {
        return { success: false, error: 'Current password is incorrect' };
      } else if (axiosError.response?.status === 400) {
        return { success: false, error: 'Both old and new passwords are required' };
      } else if (axiosError.response?.status === 500) {
        return { success: false, error: 'Server error: Unable to process password reset. This may be due to account configuration issues. Please contact support.' };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Password reset failed. Please try again.'
    };
  }
}