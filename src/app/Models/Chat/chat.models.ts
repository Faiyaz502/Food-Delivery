
// chat.models.ts
export interface ChatMessage {
  id: string | number;
  sender_id: number;
  receiver_id: number;
  message: string;
  timestamp: string;
  message_type: 'text' | 'image' | 'file';
  is_read: boolean;
  sender_type: 'admin' | 'customer' | 'rider' | 'vendor';
   chatRoomId?: number;
  order_id?: number;
  participantIds?: number[];
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

export interface WebSocketMessage {
  action: string;
  message?: ChatMessage;
  status: string;
  error?: string;
}

///------------------------------

export interface PersonalChatMessageDTO {
  senderId: number;
  message: string;
  messageType: string; // or 'TEXT' | 'IMAGE' | 'SYSTEM' if you want strict enum
}

export interface PersonalChatResponseDTO {
  id: number;
  senderId: number;
  senderName: string;
  receiverId: number;
  receiverName: string;
  message: string;
  messageType: string;
  isRead: boolean;
  timestamp: string; // ISO 8601 string (e.g., "2025-10-31T12:00:00")
}

export interface MessageStatusUpdateDTO {
  messageId: number;
  isRead: boolean;
}


//Group chat

export interface GroupChatMessageDTO {
  senderId: number;
  message: string;
  messageType: string;
}

export interface GroupChatResponseDTO {
  id: number;
  groupCode: string;
  senderId: number;
  senderName: string;
  message: string;
  messageType: string;
  timestamp: string; // ISO 8601
}

export interface GroupJoinDTO {
  senderId: number;
  senderName: string;
}

export interface GroupLeaveDTO {
  senderId: number;
  senderName: string;
}
export interface SupportChatDTO {
  senderId: number;
  adminId: number;
  message: string;
}
export interface ErrorMessageDTO {
  error: string;
  timestamp: string; // ISO 8601
}

export interface ChatStatsDTO {
  unreadCount: number;
  totalChats: number;
  totalGroupChats: number;
  lastMessageTime: string | null; // ISO 8601 or null
}

export type MessageType = 'TEXT' | 'IMAGE' | 'SYSTEM' | 'ORDER_UPDATE';
