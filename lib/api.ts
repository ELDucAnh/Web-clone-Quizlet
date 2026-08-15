// lib/api.ts
export async function syncToBackend(endpoint: string, method: 'POST' | 'PUT' | 'DELETE', data?: any) {
  try {
    const res = await fetch(`/api/proxy${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!res.ok) {
      console.warn(`[Sync Warning] Failed to sync ${method} ${endpoint}: ${res.status}`);
    }
    return res;
  } catch (error) {
    console.error(`[Sync Error] Error syncing ${method} ${endpoint}:`, error);
  }
}
