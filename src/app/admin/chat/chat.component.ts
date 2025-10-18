import { Component, ElementRef, ViewChild } from '@angular/core';
import { ChatContact, ChatMessage } from 'src/app/Models/chat.models';
import { Restaurant } from 'src/app/Models/restaurant.model';
import { Rider } from 'src/app/Models/rider.model';
import { User } from 'src/app/Models/Users/user.models';

import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  activeTab: 'customers' | 'riders' | 'vendors' = 'customers';
  selectedContact: ChatContact | null = null;
  newMessage: string = '';
  searchTerm: string = '';

  // Data
  customers: ChatContact[] = [];
  riders: ChatContact[] = [];
  vendors: ChatContact[] = [];
  messages: ChatMessage[] = [];
  users : User[] = [];

  // UI state
  isTyping: boolean = false;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadContacts();

    //mock User

    this.generateMockMessages();
  }

  loadContacts() {
    // Load customers
    this.apiService.getUsers().subscribe(users => {
      this.customers = users
        .filter(user => user.primaryRole === 'CUSTOMER')
        .map(user => this.mapUserToContact(user, 'customer'));
    });

    this.apiService.getUsers().subscribe(users =>{
      this.users = users ;
    })

    // Load riders
    this.apiService.getRiders().subscribe(riders => {
      this.apiService.getUsers().subscribe(users => {
        this.riders = riders.map(rider => {
          const user = users.find(u => u.id === rider.id);
          return this.mapRiderToContact(rider, user);
        });
      });
    });

    // Load vendors (restaurant owners)
    this.apiService.getRestaurants().subscribe(restaurants => {
      this.apiService.getUsers().subscribe(users => {
        this.vendors = restaurants.map(restaurant => {
          const user = users.find(u => u.id === restaurant.ownerId);
          return this.mapRestaurantToContact(restaurant, user);
        });
      });
    });
  }

  mapUserToContact(user: User, type: 'customer'): ChatContact {
    return {
      id: user.id,
      name: user.firstName,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName)}&background=random`,
      type: type,
      last_message: this.getRandomMessage(),
      last_message_time: this.getRandomTime(),
      unread_count: Math.floor(Math.random() * 5),
      status: this.getRandomStatus()
    };
  }

  mapRiderToContact(rider: Rider, user?: User): ChatContact {
    return {
      id: rider.id,
      name: user?.firstName || 'Unknown Rider',
      avatar: rider.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.firstName || 'Rider')}&background=random`,
      type: 'rider',
      last_message: this.getRandomMessage(),
      last_message_time: this.getRandomTime(),
      unread_count: Math.floor(Math.random() * 3),
      status: rider.availabilityStatus ? 'online' : 'offline'
    };
  }

  mapRestaurantToContact(restaurant: Restaurant, user?: User): ChatContact {
    return {
      id: restaurant.id!,
      name: restaurant.name,
      avatar: restaurant.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(restaurant.name)}&background=random`,
      type: 'vendor',
      last_message: this.getRandomMessage(),
      last_message_time: this.getRandomTime(),
      unread_count: Math.floor(Math.random() * 2),
      status: this.getRandomStatus()
    };
  }

  getRandomMessage(): string {
    const messages = [
      "Hello, I need help with my order",
      "Thank you for the quick delivery!",
      "Is my order ready?",
      "Having trouble with the payment",
      "Great service, thank you!",
      "Where is my delivery?",
      "Can you update me on the status?"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  getRandomTime(): string {
    const times = ['2m', '5m', '10m', '1h', '2h', '1d'];
    return times[Math.floor(Math.random() * times.length)];
  }

  getRandomStatus(): 'online' | 'offline' | 'away' {
    const statuses: ('online' | 'offline' | 'away')[] = ['online', 'offline', 'away'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  generateMockMessages() {
    // Generate some mock messages for demonstration
    this.messages = [
      {
        id: '1',
        sender_id: 10 ,
        receiver_id: 20 ,
        message: 'Hello, I need help with my recent order',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        message_type: 'text',
        is_read: true,
        sender_type: 'customer'
      },
      {
        id: '2',
        sender_id: 10,
        receiver_id:  20,
        message: 'Hi! I\'d be happy to help you with your order. What seems to be the issue?',
        timestamp: new Date(Date.now() - 240000).toISOString(),
        message_type: 'text',
        is_read: true,
        sender_type: 'admin'
      },
      {
        id: '3',
        sender_id: 10,
        receiver_id:  20,
        message: 'My order was supposed to arrive 30 minutes ago, but I haven\'t received it yet.',
        timestamp: new Date(Date.now() - 180000).toISOString(),
        message_type: 'text',
        is_read: true,
        sender_type: 'customer'
      },
      {
        id: '4',
        sender_id: 10,
        receiver_id: 20,
        message: 'I understand your concern. Let me check the status of your order right away.',
        timestamp: new Date(Date.now() - 120000).toISOString(),
        message_type: 'text',
        is_read: false,
        sender_type: 'admin'
      }
    ];
  }

  getActiveContacts(): ChatContact[] {
    let contacts: ChatContact[] = [];
    switch (this.activeTab) {
      case 'customers':
        contacts = this.customers;
        break;
      case 'riders':
        contacts = this.riders;
        break;
      case 'vendors':
        contacts = this.vendors;
        break;
    }

    if (this.searchTerm) {
      contacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    return contacts;
  }

  selectContact(contact: ChatContact) {
    this.selectedContact = contact;
    // Mark messages as read
    contact.unread_count = 0;
    // In a real app, load messages for this contact
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedContact) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      sender_id: 22,
      receiver_id: this.selectedContact.id,
      message: this.newMessage,
      timestamp: new Date().toISOString(),
      message_type: 'text',
      is_read: false,
      sender_type: 'admin'
    };

    this.messages.push(message);
    this.selectedContact.last_message = this.newMessage;
    this.selectedContact.last_message_time = 'now';

    this.newMessage = '';
    this.scrollToBottom();

    // Simulate typing indicator and response
    this.simulateResponse();
  }

  simulateResponse() {
    this.isTyping = true;

    setTimeout(() => {
      this.isTyping = false;
      if (this.selectedContact) {
        const responses = [
          "Thank you for your help!",
          "That sounds great, thanks!",
          "I appreciate your assistance.",
          "Perfect, that works for me.",
          "Thanks for the quick response!"
        ];

        const response: ChatMessage = {
          id: Date.now().toString(),
          sender_id: this.selectedContact.id,
          receiver_id: 1254 ,
          message: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date().toISOString(),
          message_type: 'text',
          is_read: false,
          sender_type: this.selectedContact.type === 'customer' ? 'customer' :
                      this.selectedContact.type === 'rider' ? 'rider' : 'vendor'
        };

        this.messages.push(response);
        this.selectedContact.last_message = response.message;
        this.selectedContact.last_message_time = 'now';
        this.scrollToBottom();
      }
    }, 2000);
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.messagesContainer) {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    }, 100);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'online': return 'bg-green-400';
      case 'away': return 'bg-yellow-400';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  }

  formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return date.toLocaleDateString();
  }

}
