export interface PendingRequest {
  id: string;
  type: 'restaurant' | 'rider' | 'catering';
  name: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  documents: string[];
  
  // Restaurant specific
  address?: string;
  description?: string;
  
  // Rider specific
  vehicle_type?: string;
  license_number?: string;
  
  // Catering specific
  speciality?: string;
  capacity?: number;
}