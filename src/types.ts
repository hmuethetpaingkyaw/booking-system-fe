export type Role = "admin" | "owner" | "user";

export interface User {
  id: number;
  name: string;
  role: Role;
}

export interface Booking {
  id: number;
  userId: number;
  startTime: string;
  endTime: string;
  createdAt: string;
  user: User;
}

export interface BookingSummaryRow {
  userId: number;
  userName: string | null;
  userRole: Role | null;
  totalBookings: number;
}

export interface BookingSummaryResponse {
  totalBookings: number;
  totalUsersWithBookings: number;
  bookingsPerUser: BookingSummaryRow[];
}
