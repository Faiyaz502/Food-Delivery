// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { BehaviorSubject, Observable, Subject } from 'rxjs';
// import * as SockJS from 'sockjs-client';
// import { ChatMessage } from 'src/app/Models/Chat/chat.models';






// @Injectable({
//   providedIn: 'root'
// })
// export class ChatService {

//  private apiUrl = 'http://localhost:8080/api/chat';
//   private wsUrl = 'ws://localhost:8080/ws-chat';

//   private stompClient: any;
//   private messageSubject = new Subject<ChatMessage>();
//   private typingSubject = new Subject<any>();
//   private onlineUsersSubject = new BehaviorSubject<string[]>([]);
//   private connectionSubject = new BehaviorSubject<boolean>(false);

//   public messages$ = this.messageSubject.asObservable();
//   public typing$ = this.typingSubject.asObservable();
//   public onlineUsers$ = this.onlineUsersSubject.asObservable();
//   public connected$ = this.connectionSubject.asObservable();

//   constructor(private http: HttpClient) {
//     this.initializeWebSocket();
//   }

//   private initializeWebSocket() {
//     const socket = new SockJS(this.wsUrl);


//     this.stompClient.connect({}, (frame: any) => {
//       console.log('Connected: ' + frame);
//       this.connectionSubject.next(true);

//       this.stompClient.subscribe('/user/queue/messages', (msg: any) => {
//         const parsedMsg = JSON.parse(msg.body);
//         if (parsedMsg.message) {
//           this.messageSubject.next(parsedMsg.message);
//         }
//       });

//       this.stompClient.subscribe('/user/queue/typing', (msg: any) => {
//         const parsedMsg = JSON.parse(msg.body);
//         this.typingSubject.next(parsedMsg);
//       });

//       this.stompClient.subscribe('/topic/read-receipts', (msg: any) => {
//         const parsedMsg = JSON.parse(msg.body);
//         console.log('Message read:', parsedMsg);
//       });

//       this.stompClient.subscribe('/topic/online-users', (msg: any) => {
//         const parsedMsg = JSON.parse(msg.body);
//         console.log('Online status:', parsedMsg);
//       });
//     },
//     (error: any) => {
//       console.error('WebSocket connection error:', error);
//       this.connectionSubject.next(false);
//       setTimeout(() => this.initializeWebSocket(), 5000);
//     });
//   }

//   public sendMessage(message: ChatMessage): void {
//     if (this.stompClient && this.stompClient.connected) {
//       this.stompClient.send('/app/send-message', {}, JSON.stringify(message));
//     } else {
//       this.http.post(`${this.apiUrl}/send-message`, message).subscribe();
//     }
//   }

//   public notifyTyping(message: ChatMessage): void {
//     if (this.stompClient && this.stompClient.connected) {
//       this.stompClient.send('/app/typing', {}, JSON.stringify({
//         action: 'TYPING',
//         message: message
//       }));
//     }
//   }

//   public markAsRead(messageId: number, receiverId: number): void {
//     const message: ChatMessage = {
//       id: messageId,
//       sender_id: receiverId,
//       receiver_id: 0,
//       message: '',
//       timestamp: new Date().toISOString(),
//       message_type: 'text',
//       is_read: true,
//       sender_type: 'admin'
//     };

//     if (this.stompClient && this.stompClient.connected) {
//       this.stompClient.send('/app/mark-read', {}, JSON.stringify(message));
//     } else {
//       this.http.put(`${this.apiUrl}/mark-read/${receiverId}`, {}).subscribe();
//     }
//   }

//   public getConversation(userId1: number, userId2: number): Observable<ChatMessage[]> {
//     return this.http.get<ChatMessage[]>(
//       `${this.apiUrl}/conversation/${userId1}/${userId2}`
//     );
//   }

//   public getUnreadMessages(userId: number): Observable<ChatMessage[]> {
//     return this.http.get<ChatMessage[]>(
//       `${this.apiUrl}/unread/${userId}`
//     );
//   }

//   public getUnreadCount(userId: number): Observable<any> {
//     return this.http.get<any>(
//       `${this.apiUrl}/unread-count/${userId}`
//     );
//   }

//   public sendMessageViaHttp(message: ChatMessage): Observable<ChatMessage> {
//     return this.http.post<ChatMessage>(
//       `${this.apiUrl}/send-message`,
//       message
//     );
//   }

//   public disconnect(): void {
//     if (this.stompClient && this.stompClient.connected) {
//       this.stompClient.disconnect(() => {
//         console.log('Disconnected from WebSocket');
//         this.connectionSubject.next(false);
//       });
//     }
//   }

//   public isConnected(): boolean {
//     return this.connectionSubject.value;
//   }
// }
