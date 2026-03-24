export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'customer';
  phoneNumber?: string;
  createdAt?: string;
}

export interface Van {
  id: string;
  name: string;
  status: 'active' | 'maintenance';
}

export interface Seat {
  seatNumber: number;
  status: 'available' | 'pending' | 'booked';
  userId?: string;
  userName?: string;
  userPhone?: string;
  paymentStatus?: 'unpaid' | 'paid';
  transactionId?: string;
}

export interface Trip {
  id: string;
  destination: string;
  date: string; // ISO string
  pricePerSeat: number;
  vanId: string;
  seats: Seat[];
}

export interface PrivateHire {
  id: string;
  userId: string;
  pickupPoint: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  numVans: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  totalPrice?: number;
  createdAt: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  url: string;
  createdAt: string;
}
