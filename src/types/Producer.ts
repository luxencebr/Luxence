export interface User {
  id: number;
  email: string;
  role: "CLIENT" | "ADVERTISER";
  name: string;
  gender: "MALE" | "FEMALE" | "TRANS";
  locality: Locality | null;

  createdAt: Date;
  updatedAt: Date;
}

export interface Producer {
  id: number;
  userId: number;
  user: User;

  signature: "COPPER" | "SILVER" | "GOLD" | "DIAMOND";
  verificationStatus: "YELLOW" | "GREEN" | "RED";
  isVerified: boolean;

  birthday: Date;
  document: string;
  nationality: string;
  phone: string;

  documentFrontPhoto: string;
  documentBackPhoto: string;
  selfieWithDocument: string;

  profile: ProducerProfile;
}

export interface ProducerProfile {
  id: number;
  producerId: number;
  slogan: string;
  description: string;
  images: Array<{ name: string; level: string }>;
  scholarity: string;
  languages: Array<{ name: string; level: string }>;
  hasLocal: boolean;
  views: number;

  producer: Producer;
  local: ProducerLocal | null;
  appearance: ProducerAppearance[];
  prices: ProducerPrice[];
  services: ProducerService[];
  fetiches: ProducerFetish[];
  audience: ProducerAudience[];
  locations: ProducerLocations[];
  payments: ProducerPayment[];
  reviews: Review[];
}

export interface Locality {
  id: number;
  userId: number;
  country: string;
  state: string;
  city: string;
  zone?: string;
  neighborhoods?: string;
}

export interface ProducerLocal {
  id: number;
  profileId: number;
  country: string;
  state: string;
  city: string;
  neighborhood: string;
  street?: string;
  number?: string;
  complement?: string;
  amenities: LocalAmenity[];
}

export interface LocalAmenity {
  id: number;
  localId: number;
  amenityId: number;
  amenity: AmenityOption;
}

export interface AmenityOption {
  id: number;
  name: string;
  label: string;
}

export interface ProducerAppearance {
  id: number;
  profileId: number;
  appearanceId: number;
  height?: number;
  mannequin?: number;
  feet?: number;
  tattoos?: boolean;
  piercings?: boolean;
  silicone?: boolean;
  appearance: AppearanceOption;
}

export interface AppearanceOption {
  id: number;
  name: string;
  label: string;
  type: string;
}

export interface ProducerPrice {
  id: number;
  profileId: number;
  priceId: number;
  value: number;
  option: PriceOption;
}

export interface PriceOption {
  id: number;
  name: string;
  label: string;
}

export interface ProducerService {
  id: number;
  profileId: number;
  serviceId: number;
  service: ServiceOption;
}

export interface ServiceOption {
  id: number;
  name: string;
  label: string;
}

export interface ProducerFetish {
  id: number;
  profileId: number;
  fetishId: number;
  fetish: FetishOption;
}

export interface FetishOption {
  id: number;
  name: string;
  label: string;
}

export interface ProducerAudience {
  id: number;
  profileId: number;
  audienceId: number;
  audience: AudienceOption;
}

export interface AudienceOption {
  id: number;
  name: string;
  label: string;
}

export interface ProducerLocations {
  id: number;
  profileId: number;
  locationId: number;
  location: LocationOption;
}

export interface LocationOption {
  id: number;
  name: string;
  label: string;
}

export interface ProducerPayment {
  id: number;
  profileId: number;
  paymentId: number;
  payment: PaymentOption;
}

export interface PaymentOption {
  id: number;
  name: string;
  label: string;
}

export interface Review {
  id: string;
  userId: number;
  user: User;
  profileId: number;
  rating: number;
  comment: string;
  createdAt: Date;
}
