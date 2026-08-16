// lib/api.ts
export async function syncToBackend(endpoint: string, method: 'POST' | 'PUT' | 'DELETE', data?: any) {
  try {
    const res = await fetch(`/api${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[Sync Warning] Failed to sync ${method} ${endpoint}: ${res.status}`, errText);
      if (typeof window !== 'undefined') {
        alert(`DB Error on ${endpoint}: ${errText}`);
      }
    }
    return res;
  } catch (error: any) {
    console.error(`[Sync Error] Error syncing ${method} ${endpoint}:`, error);
    if (typeof window !== 'undefined') {
      alert(`Network Error on ${endpoint}: ${error.message}`);
    }
  }
}
