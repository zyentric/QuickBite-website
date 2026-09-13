const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const TOKEN_KEY = 'quickbite_user_token';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token && token !== 'undefined' && token !== 'null') {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: { ...getHeaders(), ...(options.headers || {}) },
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const d = await res.json(); msg = d.message || d.error || msg; } catch { /* noop */ }
    throw new Error(msg);
  }
  if (res.status === 204) return {} as T;
  return res.json() as Promise<T>;
}

export const api = {
  // Auth
  auth: {
    login: (email: string, password: string) =>
      request<{ accessToken: string; refreshToken?: string; token?: string; user: any }>('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (data: { name: string; email: string; password: string; phone?: string }) =>
      request<{ accessToken: string; token?: string; user: any }>('/users/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getProfile: () => request<any>('/users/profile'),
    updateProfile: (data: any) =>
      request<any>('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
  },

  // Menu Items
  menu: {
    getAll: () => request<any[]>('/menu-items'),
    getById: (id: string) => request<any>(`/menu-items/${id}`),
  },

  // Restaurants
  restaurants: {
    getAll: () => request<any[]>('/restaurants'),
    getById: (id: string) => request<any>(`/restaurants/${id}`),
  },

  // Orders
  orders: {
    getMyOrders: (page = 1, limit = 10) =>
      request<any>(`/orders/user?page=${page}&limit=${limit}`),
    getById: (id: string) => request<any>(`/orders/${id}`),
    create: (data: any) =>
      request<any>('/orders', { method: 'POST', body: JSON.stringify(data) }),
    cancel: (id: string) =>
      request<any>(`/orders/${id}/cancel`, { method: 'PUT' }),
  },

  // Addresses
  addresses: {
    add: (addr: any) =>
      request<any>('/users/addresses', { method: 'POST', body: JSON.stringify(addr) }),
    update: (id: string, addr: any) =>
      request<any>(`/users/addresses/${id}`, { method: 'PUT', body: JSON.stringify(addr) }),
    delete: (id: string) =>
      request<any>(`/users/addresses/${id}`, { method: 'DELETE' }),
    setDefault: (id: string) =>
      request<any>(`/users/addresses/${id}/default`, { method: 'PUT' }),
  },

  // Payment
  payment: {
    createRazorpayOrder: (amount: number) =>
      request<any>('/orders/payment/create', {
        method: 'POST',
        body: JSON.stringify({ amount }),
      }),
    confirmCOD: (orderId: string) =>
      request<any>(`/orders/${orderId}/confirm-cod`, { method: 'PUT' }),
  },

  TOKEN_KEY,
};
