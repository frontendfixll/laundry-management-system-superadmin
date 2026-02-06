/**
 * Authentication utilities for consistent token handling
 */

export const getAuthToken = (): string | null => {
  let token = null;

  // Try unified auth-storage (new unified store)
  const authData = localStorage.getItem('auth-storage');
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      token = parsed.state?.token || parsed.token;
      if (token) {
        // console.log('🔑 Token found in auth-storage');
        return token;
      }
    } catch (e) {
      console.error('Error parsing auth-storage:', e);
    }
  }

  // Fallback to old superadmin-storage
  const superAdminData = localStorage.getItem('superadmin-storage');
  if (superAdminData) {
    try {
      const parsed = JSON.parse(superAdminData);
      token = parsed.state?.token || parsed.token;
      if (token) {
        // console.log('🔑 Token found in superadmin-storage (fallback)');
        return token;
      }
    } catch (e) {
      console.error('Error parsing superadmin-storage:', e);
    }
  }

  // console.warn('🔑 No auth token found in any storage');
  return null;
};

export const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const clearAuthStorage = (): void => {
  // Clear all possible auth storage keys
  localStorage.removeItem('auth-storage');
  localStorage.removeItem('superadmin-storage');
  localStorage.removeItem('superadmin-token');
  localStorage.removeItem('superAdminToken');
  // console.log('🔑 All auth storage cleared');
};