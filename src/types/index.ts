export interface MenuItem {
  id: string;
  _id?: string;
  name: string;
  price: number;
  originalPrice?: number;
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
  address?: string;
  city?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
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

export interface Order {
  id: string;
  _id?: string;
  orderNumber?: string;
  items: { menuItem?: MenuItem; quantity: number; price?: number; name?: string }[];
  totalAmount: number;
  status: 'PendingPayment' | 'Placed' | 'Accepted' | 'Preparing' | 'ReadyForPickup' | 'OutForDelivery' | 'Delivered' | 'Cancelled';
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  deliveryAddress?: DeliveryAddress;
  deliveryPin?: string;
  deliveryMan?: { name?: string; phone?: string; vehicleType?: string; vehicleNumber?: string };
  shopkeeper?: { name?: string; phone?: string };
  createdAt?: string;
}

export type ToastType = 'success' | 'error' | 'info' | 'order';
export interface Toast { id: string; message: string; sub?: string; type: ToastType; }
