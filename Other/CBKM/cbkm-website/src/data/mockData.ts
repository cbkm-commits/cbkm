import { Event, Sponsor, GalleryImage, Contact, Registration, FormField, SponsorshipPackage, Blog } from '../types';

export const mockEvents: Event[] = [
  {
    id: '1',
    name: 'Pongal Festival 2024',
    image: '/api/placeholder/400/300',
    description: 'Join us for our annual Pongal celebration with traditional food, music, and cultural performances.',
    poster: '/api/placeholder/800/600',
    date: '2024-01-15',
    location: 'Calgary Tamil Community Centre',
    attendeeForm: [
      { id: '1', name: 'fullName', type: 'text', label: 'Full Name', required: true },
      { id: '2', name: 'email', type: 'email', label: 'Email', required: true },
      { id: '3', name: 'phone', type: 'phone', label: 'Phone Number', required: true },
      { id: '4', name: 'numberOfTickets', type: 'number', label: 'Number of Tickets', required: true },
      { id: '5', name: 'adults', type: 'number', label: 'Number of Adults', required: true },
      { id: '6', name: 'kidsAbove6', type: 'number', label: 'Kids > 6 years', required: false },
      { id: '7', name: 'kidsBelow6', type: 'number', label: 'Kids < 6 years', required: false },
    ],
    participantForm: [
      { id: '1', name: 'fullName', type: 'text', label: 'Full Name', required: true },
      { id: '2', name: 'email', type: 'email', label: 'Email', required: true },
      { id: '3', name: 'phone', type: 'phone', label: 'Phone Number', required: true },
      { id: '4', name: 'numberOfParticipants', type: 'number', label: 'Number of Participants', required: true },
      { id: '5', name: 'adults', type: 'number', label: 'Number of Adults', required: true },
      { id: '6', name: 'category', type: 'select', label: 'Performance Category', required: true, options: ['Music', 'Dance', 'Drama', 'Poetry', 'Other'] },
      { id: '7', name: 'performanceDetails', type: 'textarea', label: 'Performance Details', required: false },
    ]
  },
  {
    id: '2',
    name: 'Tamil New Year Celebration',
    image: '/api/placeholder/400/300',
    description: 'Celebrate Tamil New Year with cultural programs, traditional games, and community gathering.',
    poster: '/api/placeholder/800/600',
    date: '2024-04-14',
    location: 'Bowness Community Centre',
    attendeeForm: [
      { id: '1', name: 'fullName', type: 'text', label: 'Full Name', required: true },
      { id: '2', name: 'email', type: 'email', label: 'Email', required: true },
      { id: '3', name: 'phone', type: 'phone', label: 'Phone Number', required: true },
      { id: '4', name: 'numberOfTickets', type: 'number', label: 'Number of Tickets', required: true },
      { id: '5', name: 'adults', type: 'number', label: 'Number of Adults', required: true },
      { id: '6', name: 'kidsAbove6', type: 'number', label: 'Kids > 6 years', required: false },
      { id: '7', name: 'kidsBelow6', type: 'number', label: 'Kids < 6 years', required: false },
    ],
    participantForm: [
      { id: '1', name: 'fullName', type: 'text', label: 'Full Name', required: true },
      { id: '2', name: 'email', type: 'email', label: 'Email', required: true },
      { id: '3', name: 'phone', type: 'phone', label: 'Phone Number', required: true },
      { id: '4', name: 'numberOfParticipants', type: 'number', label: 'Number of Participants', required: true },
      { id: '5', name: 'adults', type: 'number', label: 'Number of Adults', required: true },
      { id: '6', name: 'category', type: 'select', label: 'Performance Category', required: true, options: ['Music', 'Dance', 'Drama', 'Poetry', 'Other'] },
      { id: '7', name: 'performanceDetails', type: 'textarea', label: 'Performance Details', required: false },
    ]
  }
];

export const mockRegistrations: Registration[] = [
  {
    id: '1',
    eventId: '1',
    type: 'attendee',
    name: 'Ravi Kumar',
    email: 'ravi.kumar@example.com',
    phone: '403-123-4567',
    registrationDate: '2024-01-10',
    numberOfTickets: 4,
    adults: 2,
    kidsAbove6: 1,
    kidsBelow6: 1
  },
  {
    id: '2',
    eventId: '1',
    type: 'participant',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '403-987-6543',
    registrationDate: '2024-01-11',
    numberOfParticipants: 3,
    adults: 3,
    category: 'Dance',
    performanceDetails: 'Classical Bharatanatyam performance'
  },
  {
    id: '3',
    eventId: '2',
    type: 'attendee',
    name: 'Arun Patel',
    email: 'arun.patel@example.com',
    phone: '403-555-1234',
    registrationDate: '2024-04-10',
    numberOfTickets: 2,
    adults: 2,
    kidsAbove6: 0,
    kidsBelow6: 0
  }
];

export const mockSponsorshipPackages: SponsorshipPackage[] = [
  {
    id: '1',
    name: 'Bronze Package',
    amount: '$500 - $999',
    description: 'Logo on website, social media mention, event recognition',
    logo: '/api/placeholder/100/50'
  },
  {
    id: '2',
    name: 'Silver Package',
    amount: '$1,000 - $2,499',
    description: 'All Bronze benefits plus logo on event materials and verbal recognition',
    logo: '/api/placeholder/100/50'
  },
  {
    id: '3',
    name: 'Gold Package',
    amount: '$2,500 - $4,999',
    description: 'All Silver benefits plus banner placement and sponsor booth space',
    logo: '/api/placeholder/100/50'
  },
  {
    id: '4',
    name: 'Platinum Package',
    amount: '$5,000+',
    description: 'All Gold benefits plus title sponsorship and VIP event access',
    logo: '/api/placeholder/100/50'
  }
];

export const mockBlogs: Blog[] = [
  {
    id: '1',
    title: 'Celebrating Pongal Festival 2024',
    description: '<p>Join us as we celebrate the harvest festival with traditional Pongal cooking, cultural performances, and community gathering.</p><p>This year\'s celebration will feature authentic Tamil cuisine, music performances, and traditional games for children.</p>',
    image: '/api/placeholder/800/400',
    author: 'CBKM Team',
    publishDate: '2024-01-15'
  },
  {
    id: '2',
    title: 'Tamil Language Classes for Children',
    description: '<p>We are excited to announce new Tamil language classes starting this month!</p><p>Classes will be held every Saturday from 10 AM to 12 PM at our community centre.</p>',
    image: '/api/placeholder/800/400',
    author: 'Education Committee',
    publishDate: '2024-02-01'
  }
];

export const mockSponsors: Sponsor[] = [
  {
    id: '1',
    name: 'Tamil Supermarket',
    logo: '/api/placeholder/200/100',
    description: 'Your trusted source for authentic Tamil groceries and products in Calgary.',
    website: 'https://example.com',
    level: 'platinum'
  },
  {
    id: '2',
    name: 'Spice Garden Restaurant',
    logo: '/api/placeholder/200/100',
    description: 'Authentic South Indian cuisine in heart of Calgary.',
    website: 'https://example.com',
    level: 'gold'
  }
];

export const mockGallery: GalleryImage[] = [
  {
    id: '1',
    url: '/api/placeholder/400/300',
    title: 'Pongal Celebration 2024',
    description: 'Community gathering for Pongal festival',
    uploadDate: '2024-01-15'
  },
  {
    id: '2',
    url: '/api/placeholder/400/300',
    title: 'Cultural Performance',
    description: 'Traditional dance performance at our annual event',
    uploadDate: '2024-02-20'
  }
];

export const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Ravi Kumar',
    email: 'ravi.kumar@example.com',
    phone: '403-123-4567',
    message: 'Interested in volunteering for upcoming events.',
    contactDate: '2024-03-01'
  },
  {
    id: '2',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '403-987-6543',
    message: 'Would like more information about membership.',
    contactDate: '2024-03-02'
  }
];
