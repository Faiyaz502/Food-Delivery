// src/app/services/web-Socket/web-socket.service.ts
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as SockJS from 'sockjs-client';
import { Client, Message } from '@stomp/stompjs';
import { PersonalChatResponseDTO } from 'src/app/Models/Chat/chat.models';
import { NotificationResponseDTO } from '../notificationAndcoupon/notification.service';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private client: Client | null = null;
  private userId: string | null = null; // Changed to string to match Spring

  constructor(private toastr: ToastrService) {}

  connect(userId: number): void {
    // Convert to string immediately (Spring uses string user IDs)
    const userIdStr = userId.toString();

    // Avoid duplicate connections
    if (this.client?.connected) {
      console.log('✅ Already connected');
      return;
    }

    const socket = new SockJS('http://localhost:8080/ws-chat');

    this.client = new Client({
      webSocketFactory: () => socket as any,
      connectHeaders: {
        userId: userIdStr // Send as string
      },
      debug: (msg: string) => {
        console.log('[STOMP Debug]:', msg);
      },
      onConnect: () => {
        console.log('✅ WebSocket connected as user:', userIdStr);
        this.userId = userIdStr;
        this.subscribeToNotifications();
      },
      onStompError: (frame) => {
        console.error('❌ STOMP error:', frame);
      }
    });

    this.client.activate();
  }

  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.userId = null;
    }
  }

   subscribeToNotifications(): void {
    if (!this.client || !this.userId) {
      console.warn('⚠️ Cannot subscribe: not connected or no userId');
      return;
    }

    console.log(`📡 Subscribing to /user/${this.userId}/queue/notifications`);

    this.client.subscribe(`/user/${this.userId}/queue/notifications`, (message: Message) => {
      console.log('📩 RAW NOTIFICATION RECEIVED:', message.body);
      try {
        const notification: NotificationResponseDTO = JSON.parse(message.body);
        this.handleNotification(notification);
      } catch (e) {
        console.error('❌ Failed to parse notification:', e);
      }
    });
  }

  subscribeToPersonalChat(): void {
    if (!this.client || !this.userId) return;

    this.client.subscribe(`/user/${this.userId}/queue/messages`, (message: Message) => {
      const chatMsg: PersonalChatResponseDTO = JSON.parse(message.body);
      this.toastr.info(chatMsg.message, 'New Message', { timeOut: 4000 });
    });

    this.client.subscribe(`/user/${this.userId}/queue/sent`, (message: Message) => {
      console.log('Message delivered:', JSON.parse(message.body));
    });
  }

  subscribeToSupport(): void {
    if (!this.client || !this.userId) return;

    this.client.subscribe(`/user/${this.userId}/queue/support`, (message: Message) => {
      const supportMsg: PersonalChatResponseDTO = JSON.parse(message.body);
      this.toastr.warning(supportMsg.message, 'Support Reply', { timeOut: 6000 });
    });
  }

  subscribeToGroup(groupCode: string): void {
    if (!this.client) return;

    this.client.subscribe(`/topic/group/${groupCode}`, (message: Message) => {
      const groupMsg = JSON.parse(message.body);
      this.toastr.info(groupMsg.message, `Group: ${groupCode}`, { timeOut: 4000 });
    });
  }

  subscribeToErrors(): void {
    if (!this.client || !this.userId) return;

    this.client.subscribe(`/user/${this.userId}/queue/errors`, (message: Message) => {
      const error = JSON.parse(message.body);
      this.toastr.error(error.message, 'Error');
    });
  }

  // ===== SEND METHODS =====
sendPersonalMessage(receiverId: number, content: string): void {
  if (!this.userId || !this.client?.connected) return;
  const payload = {
    senderId: parseInt(this.userId),
    message: content,
    messageType: 'TEXT'
  };

  this.client.publish({
    destination: `/app/chat.send/${receiverId}`,
    body: JSON.stringify(payload),
    headers: {}
  });
}

sendGroupMessage(groupCode: string, content: string): void {
  if (!this.userId || !this.client?.connected) return;
  const payload = {
    senderId: parseInt(this.userId),
    message: content,
    messageType: 'TEXT'
  };

  this.client.publish({
    destination: `/app/group.send/${groupCode}`,
    body: JSON.stringify(payload),
    headers: {}
  });
}
  // ===== PRIVATE HELPERS =====
  private handleNotification(notification: NotificationResponseDTO): void {
    let title = 'Notification';
    if (notification.type === 'ORDER') title = 'Order Update';
    if (notification.type === 'CHAT') title = 'New Message';

    this.toastr.info(notification.message, title, {
      timeOut: 5000,
      progressBar: true,
      closeButton: true
    });
  }
}
