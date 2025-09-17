"use client"

// Client-side function (for client components)
export function isAuthenticatedClient(): boolean {
  const token = localStorage.getItem("auth_token")
  if(token) return true
  return false;
}

export function setLocalStorage(token: string){
    localStorage.setItem("auth_token", token)
}

// Emit a custom event so components can react to auth changes immediately
export function emitAuthChanged() {
  try {
    window.dispatchEvent(new Event("auth-changed"))
  } catch (_) {}
}

// Helper to log in and notify listeners
export function loginClient(token: string, email?: string) {
  try {
    localStorage.setItem("auth_token", token)
    if (email) localStorage.setItem("auth_email", email)
  } catch (_) {}
  emitAuthChanged()
}

// Helper to log out and notify listeners
export function logoutClient() {
  try {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_email")
  } catch (_) {}
  emitAuthChanged()
}