import type { MenuItem, Restaurant, CustomerOrderSummary, DeliveryAddress, Notification } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
export const TOKEN_KEY = 'quickbite_user_token';
export const REFRESH_TOKEN_KEY = 'quickbite_refresh_token';

/**
 * Standard HTTP headers builder with bearer authorization
 */
function getHeaders(): HeadersInit {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token && token !== 'undefined' && token !== 'null') {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Standard generic HTTP request client with timeout and descriptive error parsing
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout for network requests

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        ...getHeaders(),
        ...(options.headers || {}),
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      let errorMessage = `HTTP ${res.status} ${res.statusText}`;
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        /* noop */
      }
      throw new Error(errorMessage);
    }

    if (res.status === 204) {
      return {} as T;
    }

    return (await res.json()) as T;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please check your network connection.');
    }
    throw err;
  }
}

// ── Default Catalog Data (Used when catalog endpoints are loading/starting) ─
export const FALLBACK_MENU_ITEMS: MenuItem[] = [
  {
    id: 'item-1',
    _id: 'item-1',
    name: 'Mexican Appetizer',
    price: 199.00,
    originalPrice: 249.00,
    discountBadge: '20% OFF',
    rating: 5.0,
    category: 'Snacks',
    isVeg: true,
    description: 'Tortilla Chips With Toppings, delicious Mexican appetizers served fresh with house salsa and sour cream.',
    image: 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?q=80&w=2670&auto=format&fit=crop',
    customizations: [{ title: 'Toppings', options: [{ id: 'c1', name: 'Guacamole', price: 49 }, { id: 'c2', name: 'Jalapeños', price: 19 }, { id: 'c3', name: 'Pico de Gallo', price: 29 }] }]
  },
  {
    id: 'item-2',
    _id: 'item-2',
    name: 'Pork Skewer',
    price: 149.00,
    originalPrice: 189.00,
    discountBadge: 'HOT',
    rating: 4.8,
    category: 'Snacks',
    isVeg: false,
    description: 'Grilled pork skewers marinated in rich blend of herbs, cracked pepper, and aromatic spices.',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2574&auto=format&fit=crop'
  },
  {
    id: 'item-3',
    _id: 'item-3',
    name: 'Fresh Prawn Ceviche',
    price: 499.00,
    originalPrice: 599.00,
    discountBadge: 'CHEF SPECIAL',
    rating: 4.7,
    category: 'Meal',
    isVeg: false,
    description: 'Fresh succulent shrimp marinated in zesty lime juice with red onions, ripe tomatoes, and cilantro.',
    image: 'https://images.unsplash.com/photo-1594954005886-f131a4794e79?q=80&w=2574&auto=format&fit=crop'
  },
  {
    id: 'item-4',
    _id: 'item-4',
    name: 'Vegan Avocado Salad',
    price: 249.00,
    originalPrice: 299.00,
    discountBadge: 'HEALTHY',
    rating: 4.9,
    category: 'Vegan',
    isVeg: true,
    description: 'Fresh Hass avocado with organic greens, kalamata olives, cherry tomatoes, and extra virgin olive oil.',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=2584&auto=format&fit=crop'
  },
  {
    id: 'item-5',
    _id: 'item-5',
    name: 'Chocolate Lava Muffin',
    price: 99.00,
    originalPrice: 129.00,
    discountBadge: 'BESTSELLER',
    rating: 4.6,
    category: 'Dessert',
    isVeg: true,
    description: 'Warm chocolate muffin baked with a molten Belgian cocoa core that oozes on the first bite.',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=2574&auto=format&fit=crop'
  },
  {
    id: 'item-6',
    _id: 'item-6',
    name: 'Fresh Strawberry Mojito',
    price: 119.00,
    originalPrice: 149.00,
    rating: 4.8,
    category: 'Drinks',
    isVeg: true,
    description: 'Chilled sparkling cooler infused with crushed sweet strawberries, garden mint leaves, and lime wedge.',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=2574&auto=format&fit=crop'
  },
  {
    id: 'item-7',
    _id: 'item-7',
    name: 'Classic Cheeseburger',
    price: 159.00,
    originalPrice: 199.00,
    discountBadge: 'TOP SELLER',
    rating: 4.9,
    category: 'Snacks',
    isVeg: false,
    description: 'Juicy grilled beef patty topped with aged cheddar cheese, crisp lettuce, tomato, and secret signature sauce.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=2599&auto=format&fit=crop',
    customizations: [{ title: 'Extras', options: [{ id: 'e1', name: 'Extra Cheddar Cheese', price: 20 }, { id: 'e2', name: 'Crispy Bacon', price: 40 }] }]
  },
  {
    id: 'item-8',
    _id: 'item-8',
    name: 'Margherita Pizza',
    price: 299.00,
    originalPrice: 379.00,
    discountBadge: 'POPULAR',
    rating: 4.7,
    category: 'Meal',
    isVeg: true,
    description: 'Stone-baked thin crust pizza with San Marzano tomato sauce, fresh buffalo mozzarella, and basil.',
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=2669&auto=format&fit=crop',
    customizations: [{ title: 'Crust Type', options: [{ id: 's1', name: 'Regular Thin Crust', price: 0 }, { id: 's2', name: 'Cheese Burst Crust', price: 90 }] }]
  },
  {
    id: 'item-9',
    _id: 'item-9',
    name: 'Golden French Fries',
    price: 89.00,
    originalPrice: 119.00,
    rating: 4.5,
    category: 'Snacks',
    isVeg: true,
    description: 'Crispy golden potato fries lightly seasoned with sea salt and peri-peri spice blend.',
    image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?q=80&w=2574&auto=format&fit=crop'
  },
  {
    id: 'item-10',
    _id: 'item-10',
    name: 'Tandoori Paneer Tikka',
    price: 229.00,
    originalPrice: 289.00,
    discountBadge: 'INDIAN SPECIAL',
    rating: 4.8,
    category: 'Meal',
    isVeg: true,
    description: 'Cottage cheese cubes marinated in spiced yogurt and grilled to perfection in traditional clay oven.',
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?q=80&w=2574&auto=format&fit=crop'
  },
  {
    id: 'item-11',
    _id: 'item-11',
    name: 'Crispy Chicken Wings (6 pcs)',
    price: 219.00,
    originalPrice: 269.00,
    rating: 4.8,
    category: 'Snacks',
    isVeg: false,
    description: 'Deep-fried chicken wings glazed with smoky barbecue sauce and served with ranch dip.',
    image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?q=80&w=2574&auto=format&fit=crop'
  },
  {
    id: 'item-12',
    _id: 'item-12',
    name: 'Cold Brew Iced Coffee',
    price: 139.00,
    originalPrice: 169.00,
    rating: 4.7,
    category: 'Drinks',
    isVeg: true,
    description: 'Steeped for 18 hours using single-origin Arabica beans, poured over ice with a splash of sweet cream.',
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=2574&auto=format&fit=crop'
  }
];

export const FALLBACK_RESTAURANTS: Restaurant[] = [
  {
    id: 'rest-1',
    _id: 'rest-1',
    name: 'La Trattoria Italiana',
    cuisine: 'Authentic Italian & Wood-fired Pizzas',
    rating: 4.8,
    deliveryTime: '25-35 mins',
    minOrder: 149,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2574&auto=format&fit=crop',
    menu: FALLBACK_MENU_ITEMS.slice(0, 8)
  },
  {
    id: 'rest-2',
    _id: 'rest-2',
    name: 'Burger Republic',
    cuisine: 'American Burgers & Shakes',
    rating: 4.5,
    deliveryTime: '20-30 mins',
    minOrder: 99,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=2599&auto=format&fit=crop',
    menu: FALLBACK_MENU_ITEMS.slice(6, 12)
  },
  {
    id: 'rest-3',
    _id: 'rest-3',
    name: 'Verde Vegan Kitchen',
    cuisine: '100% Organic Plant-based Bowls',
    rating: 4.7,
    deliveryTime: '30-40 mins',
    minOrder: 199,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2670&auto=format&fit=crop',
    menu: FALLBACK_MENU_ITEMS.slice(2, 8)
  }
];

export const api = {
  TOKEN_KEY,
  REFRESH_TOKEN_KEY,

  // ── Authentication ──────────────────────────────────────────────────────────
  auth: {
    login: (email: string, password: string) =>
      request<{ accessToken: string; refreshToken?: string; token?: string; user: any }>('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    register: (data: { name: string; email: string; password: string; phone?: string; role?: string }) =>
      request<{ accessToken: string; refreshToken?: string; token?: string; user: any }>('/users/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getProfile: () =>
      request<any>('/users/profile'),

    updateProfile: (data: any) =>
      request<any>('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    changePassword: (currentPassword: string, newPassword: string) =>
      request<any>('/users/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      }),
  },

  // ── Menu Catalog ────────────────────────────────────────────────────────────
  menu: {
    getAll: async (params?: { category?: string; search?: string; isVeg?: boolean }): Promise<MenuItem[]> => {
      try {
        const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
        const data = await request<MenuItem[]>(`/menu-items${query}`);
        if (Array.isArray(data) && data.length > 0) return data;
        return FALLBACK_MENU_ITEMS;
      } catch {
        return FALLBACK_MENU_ITEMS;
      }
    },

    getById: async (id: string): Promise<MenuItem | undefined> => {
      try {
        return await request<MenuItem>(`/menu-items/${id}`);
      } catch {
        return FALLBACK_MENU_ITEMS.find(i => i.id === id || i._id === id);
      }
    },
  },

  // ── Restaurants ─────────────────────────────────────────────────────────────
  restaurants: {
    getAll: async (): Promise<Restaurant[]> => {
      try {
        const data = await request<Restaurant[]>('/restaurants');
        if (Array.isArray(data) && data.length > 0) return data;
        return FALLBACK_RESTAURANTS;
      } catch {
        return FALLBACK_RESTAURANTS;
      }
    },

    getById: async (id: string): Promise<Restaurant | undefined> => {
      try {
        return await request<Restaurant>(`/restaurants/${id}`);
      } catch {
        return FALLBACK_RESTAURANTS.find(r => r.id === id || r._id === id);
      }
    },
  },

  // ── Orders ──────────────────────────────────────────────────────────────────
  orders: {
    getMyOrders: async (page = 1, limit = 10): Promise<{ orders: CustomerOrderSummary[]; totalPages?: number }> => {
      let backendOrders: any[] = [];
      let totalPages = 1;
      try {
        const data = await request<any>(`/orders?page=${page}&limit=${limit}`);
        backendOrders = Array.isArray(data) ? data : (data?.orders || data?.items || []);
        totalPages = data?.totalPages || 1;
      } catch {
        /* backend offline or token issue */
      }

      // Merge with local client-side storage orders
      let localOrders: any[] = [];
      try {
        localOrders = JSON.parse(localStorage.getItem('quickbite_local_orders') || '[]');
      } catch {
        /* noop */
      }

      const combined: CustomerOrderSummary[] = [...backendOrders];
      const seenIds = new Set(backendOrders.map((o: any) => (o._id || o.id || o.orderNumber)?.toString()));

      for (const loc of localOrders) {
        const locId = (loc._id || loc.id || loc.orderNumber)?.toString();
        if (locId && !seenIds.has(locId)) {
          combined.push(loc);
          seenIds.add(locId);
        }
      }

      return { orders: combined, totalPages };
    },

    getById: async (id: string): Promise<CustomerOrderSummary> => {
      try {
        const res = await request<any>(`/orders/${id}`);
        return res?.order || res;
      } catch (err) {
        try {
          const orders = JSON.parse(localStorage.getItem('quickbite_local_orders') || '[]');
          const found = orders.find((o: any) => o.id === id || o._id === id || o.orderNumber === id);
          if (found) return found;
        } catch {
          /* noop */
        }
        throw err;
      }
    },

    create: async (payload: any): Promise<CustomerOrderSummary> => {
      try {
        const res = await request<any>('/orders', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        const order = res?.order || res;
        // Keep order in client-side storage cache
        try {
          const orders = JSON.parse(localStorage.getItem('quickbite_local_orders') || '[]');
          orders.unshift(order);
          localStorage.setItem('quickbite_local_orders', JSON.stringify(orders));
        } catch {
          /* noop */
        }
        return order;
      } catch (err: any) {
        // Handle gracefully if backend is offline
        const orderId = 'QB-' + Math.floor(100000 + Math.random() * 900000);
        const pin = Math.floor(1000 + Math.random() * 9000).toString();
        const fallbackOrder: CustomerOrderSummary = {
          ...payload,
          id: orderId,
          _id: orderId,
          orderNumber: orderId,
          status: 'Placed',
          deliveryPin: pin,
          createdAt: new Date().toISOString(),
          paymentStatus: (payload.paymentMethod || '').toLowerCase() === 'cod' ? 'Pending' : 'Paid',
        };
        try {
          const orders = JSON.parse(localStorage.getItem('quickbite_local_orders') || '[]');
          orders.unshift(fallbackOrder);
          localStorage.setItem('quickbite_local_orders', JSON.stringify(orders));
        } catch {
          /* noop */
        }
        return fallbackOrder;
      }
    },

    cancel: async (id: string, reason?: string): Promise<{ success: boolean }> => {
      try {
        await request<any>(`/orders/${id}/cancel`, {
          method: 'PUT',
          body: JSON.stringify({ reason }),
        });
      } catch {
        /* noop */
      }
      try {
        const orders = JSON.parse(localStorage.getItem('quickbite_local_orders') || '[]');
        const updated = orders.map((o: any) =>
          o.id === id || o._id === id || o.orderNumber === id ? { ...o, status: 'Cancelled' } : o
        );
        localStorage.setItem('quickbite_local_orders', JSON.stringify(updated));
      } catch {
        /* noop */
      }
      return { success: true };
    },

    confirmCod: (id: string) =>
      request<any>(`/orders/${id}/confirm-cod`, { method: 'POST' }),

    createRazorpayOrder: (amount: number) =>
      request<{ id: string; amount: number; currency: string }>('/orders/create-razorpay-order', {
        method: 'POST',
        body: JSON.stringify({ amount }),
      }),

    verifyRazorpayPayment: (payload: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      order_id: string;
    }) =>
      request<{ success: boolean; message?: string }>('/orders/verify-payment', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },

  // ── Delivery Addresses ──────────────────────────────────────────────────────
  addresses: {
    getAll: () =>
      request<DeliveryAddress[]>('/users/addresses'),

    add: (addr: Partial<DeliveryAddress>) =>
      request<DeliveryAddress>('/users/addresses', {
        method: 'POST',
        body: JSON.stringify(addr),
      }),

    update: (id: string, addr: Partial<DeliveryAddress>) =>
      request<DeliveryAddress>(`/users/addresses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(addr),
      }),

    delete: (id: string) =>
      request<any>(`/users/addresses/${id}`, { method: 'DELETE' }),

    setDefault: (id: string) =>
      request<any>(`/users/addresses/${id}/default`, { method: 'PUT' }),
  },

  // ── Favorites ───────────────────────────────────────────────────────────────
  favorites: {
    getAll: async (): Promise<any[]> => {
      try {
        const data = await request<any>('/favorites');
        return Array.isArray(data) ? data : (data?.items || []);
      } catch {
        return [];
      }
    },

    toggle: (foodId: string) =>
      request<{ isFavorite: boolean; favorites?: any[] }>(`/favorites/toggle/${foodId}`, {
        method: 'POST',
      }),

    remove: (foodId: string) =>
      request<{ success: boolean }>(`/favorites/${foodId}`, {
        method: 'DELETE',
      }),
  },

  // ── Notifications ───────────────────────────────────────────────────────────
  notifications: {
    getAll: async (): Promise<Notification[]> => {
      try {
        const data = await request<any>('/notifications');
        return Array.isArray(data) ? data : (data?.notifications || []);
      } catch {
        return [];
      }
    },

    getUnreadCount: async (): Promise<number> => {
      try {
        const data = await request<any>('/notifications');
        const list: Notification[] = Array.isArray(data) ? data : (data?.notifications || []);
        return list.filter(n => !n.isRead).length;
      } catch {
        return 0;
      }
    },

    markAllRead: () =>
      request<any>('/notifications/mark-read', { method: 'PUT' }).catch(() => {}),
  },

  // ── Reviews ─────────────────────────────────────────────────────────────────
  reviews: {
    submit: (payload: { orderId: string; rating: number; review?: string }) =>
      request<any>('/reviews', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },
};
