export interface ChatMessage {
  id: string;
  sender_id: number;
  receiver_id: number;
  message: string;
  timestamp: string;
  message_type: 'text' | 'image' | 'file';
  is_read: boolean;
  sender_type: 'admin' | 'customer' | 'rider' | 'vendor';
}

export interface ChatContact {
  id: number;
  name: string;
  avatar: string;
  type: 'customer' | 'rider' | 'vendor';
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
  status: 'online' | 'offline' | 'away';
}

export interface ChatRoom {
  id: number;
  participants: string[];
  order_id?: number;
  created_at: string;
  type: 'direct' | 'order_specific';
}
