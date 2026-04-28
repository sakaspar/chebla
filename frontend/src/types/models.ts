export type Role = "client" | "admin";
export type OrderStatus = "pending" | "in_progress" | "delivered" | "cancelled";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
