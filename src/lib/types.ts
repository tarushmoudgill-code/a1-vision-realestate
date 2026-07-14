// Shared TypeScript types for the frontend (mirrors Prisma models)
export interface Suburb {
  id: string;
  name: string;
  state: string;
  postcode: string;
  description: string;
  medianPrice: number;
  medianRent: number;
  growthRate: number;
  population: number;
  demographics: Record<string, number>;
  amenities: string[];
  lifestyle: string;
  image: string;
  featured: boolean;
}

export interface Agent {
  id: string;
  name: string;
  title: string;
  bio: string;
  photo: string;
  email: string;
  phone: string;
  specialisations: string[];
  suburbs: string[];
  languages: string[];
  activeListings: number;
  soldCount: number;
  totalSalesValue: number;
  yearsExperience: number;
  rating: number;
}

export interface Property {
  id: string;
  title: string;
  slug: string;
  description: string;
  address: string;
  suburbId: string;
  suburb?: Suburb;
  price: number;
  priceDisplay: string;
  listingType: string;
  status: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  carSpaces: number;
  landSize: number;
  buildingSize: number;
  features: string[];
  images: { url: string; caption?: string }[] | string[];
  floorPlan?: string | null;
  virtualTourUrl?: string | null;
  videoUrl?: string | null;
  agentId: string;
  agent?: Agent;
  featured: boolean;
  views: number;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  serviceType: string;
  message: string;
  avatar?: string | null;
  status?: string;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string;
  featuredImage: string;
  published: boolean;
  publishedAt: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  author?: { name: string } | null;
}

export interface Service {
  id: string;
  slug: string;
  title: string;
  category: string;
  tagline: string;
  description: string;
  process: { step: string; title: string; text: string }[];
  included: string[];
  feeInfo: string;
  icon: string;
  order: number;
}

export interface Inspection {
  id: string;
  propertyId: string;
  agentId?: string | null;
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
  status: string;
  createdAt: string;
  property?: Property;
  agent?: Agent | null;
}

export interface Lead {
  id: string;
  type: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  source: string;
  propertyId?: string | null;
  assignedAgentId?: string | null;
  notes: string;
  createdAt: string;
  property?: Property | null;
  agent?: Agent | null;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}
