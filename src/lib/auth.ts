// Helper function to get the authentication token from cookies
export function getToken(): string | null {
  if (typeof window === 'undefined') {
    return null; // Server-side rendering
  }

  // Try to get token from localStorage
  const token =
    localStorage.getItem('token') ||
    document.cookie
      .split('; ')
      .find((row) => row.startsWith('token='))
      ?.split('=')[1];

  return token || null;
}

// Helper function to check if user is authenticated
export function isAuthenticated(): boolean {
  return !!getToken();
}

// Helper function to set the authentication token
export function setToken(token: string, rememberMe: boolean = false): void {
  if (typeof window === 'undefined') return;

  if (rememberMe) {
    // Store in localStorage for persistent sessions
    localStorage.setItem('token', token);
  } else {
    // Store in sessionStorage for session-only
    sessionStorage.setItem('token', token);
  }

  // Also set in cookies for HTTP-only security
  const expires = new Date();
  expires.setDate(expires.getDate() + (rememberMe ? 30 : 1)); // 30 days or 1 day
  document.cookie = `token=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

// Helper function to remove the authentication token
export function removeToken(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}
