export type Role = "client" | "admin";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  company?: string;
  createdAt: string;
}

export type OrderStatus = "pending" | "in_progress" | "delivered" | "cancelled";

export interface OrderMessage {
  id: string;
  senderId: string;
  senderRole: Role;
  message: string;
  createdAt: string;
}

export interface Order {
  id: string;
  clientId: string;
  serviceId: string;
  status: OrderStatus;
  brief: string;
  attachments: string[];
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
  messages?: OrderMessage[];
}

export type ServiceCategory = "video" | "facebook_ads" | "seo_google";

export interface Service {
  id: string;
  title: string;
  category: ServiceCategory;
  description: string;
  price: number;
  deliveryDays: number;
  isActive: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  role: Role;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Admin {
  id: string;
  email: string;
  passwordHash: string;
}

export interface RefreshTokenRecord {
  id: string;
  userId: string;
  role: Role;
  tokenHash: string;
  expiresAt: string;
}
