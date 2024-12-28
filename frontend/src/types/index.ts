

export interface Ticket {
  id: string;
  eventId: string;
  userId: string;
  organizationId: string;
  seatNumber?: string;
  purchaseDate: string;
  status: 'active' | 'used' | 'cancelled';
}

export interface Seat {
  id: string;
  eventId: string;
  number: string;
  status: 'available' | 'reserved' | 'occupied';
  userId?: string;
}