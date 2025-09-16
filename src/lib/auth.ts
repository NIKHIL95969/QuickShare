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
