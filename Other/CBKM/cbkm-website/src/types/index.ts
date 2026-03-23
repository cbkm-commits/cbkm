export interface Event {
  id: string;
  name: string;
  image: string;
  description: string;
  poster: string;
  date: string;
  location: string;
  attendeeForm?: FormField[];
  participantForm?: FormField[];
}

export interface FormField {
  id: string;
  name: string;
  type: 'text' | 'email' | 'phone' | 'number' | 'select' | 'textarea';
  label: string;
  required: boolean;
  options?: string[];
}

export interface Registration {
  id: string;
  eventId: string;
  type: 'attendee' | 'participant';
  name: string;
  email: string;
  phone: string;
  address?: string;
  specialRequirements?: string;
  registrationDate: string;
  // Attendee specific fields
  numberOfTickets?: number;
  adults?: number;
  kidsAbove6?: number;
  kidsBelow6?: number;
  // Participant specific fields
  numberOfParticipants?: number;
  category?: string;
  performanceDetails?: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  description?: string;
  website?: string;
  level: 'platinum' | 'gold' | 'silver' | 'bronze';
}

export interface SponsorshipPackage {
  id: string;
  name: string;
  amount: string;
  description: string;
  logo?: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  title?: string;
  description?: string;
  uploadDate: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  contactDate: string;
}

export interface AdminUser {
  username: string;
  password: string;
}

export interface SponsorshipContact {
  email: string;
  phone: string;
}

export interface SiteSettings {
  logo?: string;
  contactEmail: string;
  contactPhone: string;
}

export interface Blog {
  id: string;
  title: string;
  description: string;
  image: string;
  author: string;
  publishDate: string;
}
