export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  status: 'active' | 'away' | 'offline';
  last_active: string;
  avatar: string;
}