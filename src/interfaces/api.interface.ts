export interface APIResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  timestamp: string;
}

export interface ScheduleEvent {
  _id?: string;
  time: string;
  event: string;
  description?: string;
  location?: string;
  responsible?: string;
  status: 'pending' | 'confirmed' | 'completed';
}

export interface GalleryImage {
  _id?: string;
  url: string;
  name: string;
  size: number;
  uploadedAt: Date;
  description?: string;
}

export interface Gift {
  _id?: string;
  name: string;
  description?: string;
  price: number;
  link?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'available' | 'reserved' | 'purchased';
  category: string;
  quantity: number;
  purchased: number;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}