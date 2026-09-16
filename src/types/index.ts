export interface MenuItem {
  restaurant: any;
  id: string;
  _id?: string;
  name: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  discountBadge?: string;
  description: string;
  image?: string;
  rating?: number;
  category?: string;
  isVeg?: boolean;
  customizations?: { title: string; options: { id: string; name: string; price: number }[] }[];
}

export interface Restaurant {
  id: string;
  _id?: string;
  name: string;
  cuisine: string;
  rating: number;
  image: string;
  deliveryTime?: string;
  minOrder?: number;
  menu?: MenuItem[];
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface DeliveryAddress {
  id?: string;
  _id?: string;
  label?: string;
  addressLine1?: string;
  addressLine2?: string;
  address?: string;
  formattedAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
  isDefault?: boolean;
}

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'shopkeeper' | 'delivery_man' | 'admin';
  profilePicture?: string;
  savedAddresses?: DeliveryAddress[];
}

export interface OrderItemDish {
  id?: string;
  _id?: string;
  name?: string;
  price?: number;
  originalPrice?: number;
  image?: string;
  description?: string;
  category?: string;
  rating?: number;
}

export interface RawOrderItem {
  id?: string;
  _id?: string;
  menuItem?: OrderItemDish;
  quantity: number;
  price?: number;
  name?: string;
  image?: string;
  description?: string;
  category?: string;
  rating?: number;
}

export interface DeliveryPartnerProfile {
  id?: string;
  _id?: string;
  name?: string;
  phone?: string;
  email?: string;
  profilePicture?: string;
  avatar?: string;
  vehicleType?: string;
  vehicleNumber?: string;
  rating?: number | string;
  currentLocation?: {
    latitude?: number;
    longitude?: number;
    address?: string;
    updatedAt?: string | Date;
  };
}

export interface ShopkeeperProfile {
  id?: string;
  _id?: string;
  name?: string;
  phone?: string;
  email?: string;
  profilePicture?: string;
}

export interface CustomerOrderSummary {
  id: string;
  _id?: string;
  orderNumber?: string;
  name?: string;
  itemsSummary?: string;
  rawItems?: RawOrderItem[];
  items?: RawOrderItem[];
  date?: string;
  createdAt?: string;
  itemsCount?: number;
  price?: number;
  totalAmount?: number;
  subtotal?: number;
  deliveryFee?: number;
  discountAmount?: number;
  couponCode?: string;
  deliverySpeed?: string;
  deliveryInstructions?: string;
  image?: string;
  status:
    | 'PendingPayment'
    | 'Placed'
    | 'Accepted'
    | 'Preparing'
    | 'ReadyForPickup'
    | 'OutForDelivery'
    | 'Delivered'
    | 'Cancelled'
    | string;
  deliveryAddress?: DeliveryAddress;
  paymentStatus?: 'Pending' | 'Paid' | 'Failed' | string;
  paymentMethod?: string;
  deliveryPin?: string;
  deliveryMan?: DeliveryPartnerProfile;
  shopkeeper?: ShopkeeperProfile;
}

// Legacy alias kept for backward compat
export type Order = CustomerOrderSummary;

export interface FilterOptions {
  category?: string;
  sortBy?: 'popular' | 'rating' | 'price_asc' | 'price_desc' | 'fast_delivery';
  dietary?: 'all' | 'veg' | 'non_veg' | 'vegan';
  minRating?: number;
  maxPrice?: number;
  subCategories?: string[];
  freeDeliveryOnly?: boolean;
  offersOnly?: boolean;
}

export interface Notification {
  id?: string;
  _id?: string;
  type?: 'order' | 'delivery' | 'promotion' | string;
  title?: string;
  message?: string;
  isRead?: boolean;
  createdAt?: string;
  orderId?: string;
}

export type ToastType = 'success' | 'error' | 'info' | 'order';
export interface Toast { id: string; message: string; sub?: string; type: ToastType; }
