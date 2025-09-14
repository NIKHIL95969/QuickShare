

// Client-side function (for client components)
export function isAuthenticatedClient(): boolean {
  if (typeof document === 'undefined') return false;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; auth_token=`);
  if (parts.length === 2) {
    const token = parts.pop()?.split(';').shift();
    return !!token && token.length > 20;
  }
  return false;
}
