export async function rateLimit(ip: string): Promise<{ allowed: boolean; retryAfter?: number }> {
  return { allowed: true };
}



