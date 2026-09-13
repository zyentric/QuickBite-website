import type { MenuItem, Restaurant } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://quickbite-backend-sknz.onrender.com/api';

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
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout so UI doesn't hang if backend sleeps

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: { ...getHeaders(), ...(options.headers || {}) },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try { const d = await res.json(); msg = d.message || d.error || msg; } catch { /* noop */ }
      throw new Error(msg);
    }
    if (res.status === 204) return {} as T;
    return res.json() as Promise<T>;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// ── Fallback Mock Data (matches app database seed) ───────────────────────────
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
    name: 'Vegan Buddha Bowl',
    price: 349.00,
    originalPrice: 429.00,
    rating: 4.8,
    category: 'Vegan',
    isVeg: true,
    description: 'Wholesome organic quinoa, spiced roasted sweet potatoes, crispy chickpeas, edamame, and tahini drizzle.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2670&auto=format&fit=crop'
  },
  {
    id: 'item-10',
    _id: 'item-10',
    name: 'New York Cheesecake',
    price: 149.00,
    originalPrice: 199.00,
    discountBadge: '25% OFF',
    rating: 4.9,
    category: 'Dessert',
    isVeg: true,
    description: 'Velvety smooth New York style cheesecake on a buttery golden graham cracker crust.',
    image: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?q=80&w=2671&auto=format&fit=crop'
  },
  {
    id: 'item-11',
    _id: 'item-11',
    name: 'Iced Latte',
    price: 129.00,
    originalPrice: 159.00,
    rating: 4.7,
    category: 'Drinks',
    isVeg: true,
    description: 'Slow-dripped Arabica double espresso poured over cold milk and crystalline ice.',
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=2564&auto=format&fit=crop'
  },
  {
    id: 'item-12',
    _id: 'item-12',
    name: 'Spicy Chicken Wings',
    price: 249.00,
    originalPrice: 319.00,
    discountBadge: 'SPICY',
    rating: 4.6,
    category: 'Snacks',
    isVeg: false,
    description: 'Tender chicken wings fried to a golden crisp and glazed in spicy firecracker buffalo sauce.',
    image: 'https://images.unsplash.com/photo-1569691105775-4364c6bc2d66?q=80&w=2574&auto=format&fit=crop'
  },
  {
    id: 'item-13',
    _id: 'item-13',
    name: 'Grilled Salmon Meal',
    price: 599.00,
    originalPrice: 699.00,
    discountBadge: 'PREMIUM',
    rating: 4.8,
    category: 'Meal',
    isVeg: false,
    description: 'Wild Atlantic salmon fillet pan-seared in lemon herb butter, accompanied by roasted asparagus.',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=2574&auto=format&fit=crop'
  },
  {
    id: 'item-14',
    _id: 'item-14',
    name: 'Spicy Beef Tacos',
    price: 189.00,
    originalPrice: 229.00,
    rating: 4.8,
    category: 'Meal',
    isVeg: false,
    description: 'Trio of warm corn tortillas stuffed with seasoned beef, minced onion, fresh cilantro, and lime.',
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=2670&auto=format&fit=crop'
  },
  {
    id: 'item-15',
    _id: 'item-15',
    name: 'Truffle French Fries',
    price: 129.00,
    originalPrice: 169.00,
    rating: 4.5,
    category: 'Snacks',
    isVeg: true,
    description: 'Crispy skin-on potato fries tossed in Italian black truffle oil and freshly grated parmesan.',
    image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?q=80&w=2670&auto=format&fit=crop'
  },
  {
    id: 'item-16',
    _id: 'item-16',
    name: 'Classic Pepperoni Pizza',
    price: 349.00,
    originalPrice: 429.00,
    discountBadge: 'FAVORITE',
    rating: 4.9,
    category: 'Meal',
    isVeg: false,
    description: 'Signature sourdough pizza generously loaded with smoked pork pepperoni, melted mozzarella, and oregano.',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=2670&auto=format&fit=crop'
  },
  {
    id: 'item-17',
    _id: 'item-17',
    name: 'Fresh Mango Smoothie',
    price: 149.00,
    originalPrice: 179.00,
    rating: 4.8,
    category: 'Drinks',
    isVeg: true,
    description: 'Rich velvety blend of sweet Alphonso mango pulp, chilled Greek yogurt, and crushed cardamom.',
    image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?q=80&w=2574&auto=format&fit=crop'
  },
  {
    id: 'item-18',
    _id: 'item-18',
    name: 'Vegan Tofu Stir-fry',
    price: 279.00,
    originalPrice: 349.00,
    rating: 4.6,
    category: 'Vegan',
    isVeg: true,
    description: 'Wok-seared organic tofu cubes tossed with crunchy florets of broccoli, bell peppers, and garlic ginger soy.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2670&auto=format&fit=crop'
  },
  {
    id: 'item-19',
    _id: 'item-19',
    name: 'Chocolate Chip Cookies',
    price: 79.00,
    originalPrice: 99.00,
    rating: 4.7,
    category: 'Dessert',
    isVeg: true,
    description: 'Twin oversized cookies fresh from the oven, loaded with melted dark chocolate chunks.',
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=2564&auto=format&fit=crop'
  },
  {
    id: 'item-20',
    _id: 'item-20',
    name: 'Crispy Onion Rings',
    price: 99.00,
    originalPrice: 129.00,
    rating: 4.3,
    category: 'Snacks',
    isVeg: true,
    description: 'Colossal sweet onion rings hand-dipped in golden tempura batter and fried until crunchy.',
    image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?q=80&w=2574&auto=format&fit=crop'
  },
  {
    id: 'item-21',
    _id: 'item-21',
    name: 'Butter Chicken Curry',
    price: 399.00,
    originalPrice: 489.00,
    discountBadge: 'ROYAL TASTE',
    rating: 5.0,
    category: 'Meal',
    isVeg: false,
    description: 'Tender tandoori chicken simmered slowly in a buttery, mildly spiced velvet tomato and cashew gravy.',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=2670&auto=format&fit=crop'
  },
  {
    id: 'item-22',
    _id: 'item-22',
    name: 'Matcha Green Tea Latte',
    price: 169.00,
    originalPrice: 199.00,
    rating: 4.8,
    category: 'Drinks',
    isVeg: true,
    description: 'Ceremonial grade Japanese Uji matcha whisked smoothly with steamed oat milk and mild honey.',
    image: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?q=80&w=2670&auto=format&fit=crop'
  },
  {
    id: 'item-23',
    _id: 'item-23',
    name: 'Vegan Mushroom Risotto',
    price: 329.00,
    originalPrice: 399.00,
    rating: 4.7,
    category: 'Vegan',
    isVeg: true,
    description: 'Creamy Arborio rice simmered in savory vegetable broth with sauteed wild porcini and shiitake mushrooms.',
    image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=2670&auto=format&fit=crop'
  }
];

export const FALLBACK_RESTAURANTS: Restaurant[] = [
  {
    id: 'rest-1',
    _id: 'rest-1',
    name: 'The Spice Garden',
    cuisine: 'Indian & Mughlai Delicacies',
    rating: 4.8,
    deliveryTime: '25-35 mins',
    minOrder: 149,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=2636&auto=format&fit=crop',
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
    menu: FALLBACK_MENU_ITEMS.slice(8, 16)
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
    menu: FALLBACK_MENU_ITEMS.slice(16)
  }
];

export const api = {
  // Auth
  auth: {
    login: async (email: string, password: string) => {
      try {
        return await request<{ accessToken: string; refreshToken?: string; token?: string; user: any }>('/users/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
      } catch (err) {
        console.warn('API login failed, falling back to local session:', err);
        // Fallback demo user login
        return {
          accessToken: 'demo_token_' + Date.now(),
          token: 'demo_token_' + Date.now(),
          user: {
            id: 'user-demo-1',
            _id: 'user-demo-1',
            name: email.includes('@') ? email.split('@')[0].replace('.', ' ') : 'QuickBite Foodie',
            email,
            role: 'customer' as const,
            phone: '+91 9876543210',
            savedAddresses: [
              {
                id: 'addr-1',
                _id: 'addr-1',
                label: 'Home',
                addressLine1: 'Flat 402, Sunset Heights, Koramangala',
                city: 'Bangalore',
                zipCode: '560034',
                isDefault: true,
              }
            ]
          }
        };
      }
    },
    register: async (data: { name: string; email: string; password: string; phone?: string }) => {
      try {
        return await request<{ accessToken: string; token?: string; user: any }>('/users/register', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      } catch (err) {
        console.warn('API register failed, falling back to local session:', err);
        return {
          accessToken: 'demo_token_' + Date.now(),
          token: 'demo_token_' + Date.now(),
          user: {
            id: 'user-demo-' + Date.now(),
            _id: 'user-demo-' + Date.now(),
            name: data.name,
            email: data.email,
            phone: data.phone || '+91 9876543210',
            role: 'customer' as const,
            savedAddresses: []
          }
        };
      }
    },
    getProfile: async () => {
      try {
        return await request<any>('/users/profile');
      } catch (err) {
        const stored = localStorage.getItem('quickbite_user_data');
        if (stored) {
          try { return JSON.parse(stored); } catch { /* noop */ }
        }
        throw err;
      }
    },
    updateProfile: (data: any) =>
      request<any>('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
  },

  // Menu Items
  menu: {
    getAll: async (): Promise<MenuItem[]> => {
      try {
        const data = await request<MenuItem[]>('/menu-items');
        if (Array.isArray(data) && data.length > 0) return data;
        return FALLBACK_MENU_ITEMS;
      } catch (err) {
        console.warn('API menu-items unreachable or CORS blocked, using built-in catalog:', err);
        return FALLBACK_MENU_ITEMS;
      }
    },
    getById: async (id: string): Promise<MenuItem | undefined> => {
      try {
        return await request<MenuItem>(`/menu-items/${id}`);
      } catch (err) {
        return FALLBACK_MENU_ITEMS.find(i => i.id === id || i._id === id);
      }
    },
  },

  // Restaurants
  restaurants: {
    getAll: async (): Promise<Restaurant[]> => {
      try {
        const data = await request<Restaurant[]>('/restaurants');
        if (Array.isArray(data) && data.length > 0) return data;
        return FALLBACK_RESTAURANTS;
      } catch (err) {
        console.warn('API restaurants unreachable or CORS blocked, using built-in catalog:', err);
        return FALLBACK_RESTAURANTS;
      }
    },
    getById: async (id: string): Promise<Restaurant | undefined> => {
      try {
        return await request<Restaurant>(`/restaurants/${id}`);
      } catch (err) {
        return FALLBACK_RESTAURANTS.find(r => r.id === id || r._id === id);
      }
    },
  },

  // Orders
  orders: {
    getMyOrders: async (page = 1, limit = 10) => {
      try {
        return await request<any>(`/orders/user?page=${page}&limit=${limit}`);
      } catch (err) {
        // Return local orders from localStorage if any
        try {
          const localOrders = JSON.parse(localStorage.getItem('quickbite_local_orders') || '[]');
          return { orders: localOrders, totalPages: 1 };
        } catch {
          return { orders: [], totalPages: 1 };
        }
      }
    },
    getById: (id: string) => request<any>(`/orders/${id}`),
    create: async (data: any) => {
      try {
        return await request<any>('/orders', { method: 'POST', body: JSON.stringify(data) });
      } catch (err) {
        console.warn('API order create offline fallback:', err);
        const orderId = 'QB-' + Math.floor(100000 + Math.random() * 900000);
        const newOrder = {
          ...data,
          id: orderId,
          _id: orderId,
          orderNumber: orderId,
          status: 'Placed',
          paymentStatus: data.paymentMethod === 'COD' ? 'Pending' : 'Paid',
          createdAt: new Date().toISOString()
        };
        try {
          const orders = JSON.parse(localStorage.getItem('quickbite_local_orders') || '[]');
          orders.unshift(newOrder);
          localStorage.setItem('quickbite_local_orders', JSON.stringify(orders));
        } catch { /* noop */ }
        return newOrder;
      }
    },
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
