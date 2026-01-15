type Gender = "MALE" | "FEMALE" | "TRANS";

export interface User {
  id: number;
  email: string;
  role: "CLIENT" | "ADVERTISER";
  name: string;
  gender: Gender;
  preferences: Gender[];
  locality: Locality | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Locality {
  id: number;
  userId: number;
  country: string;
  state: string;
  city: string;
  neighborhood?: string;
}

export interface Producer {
  id: number;
  userId: number;
  user: User;

  signature: "COPPER" | "SILVER" | "GOLD" | "DIAMOND";
  verificationStatus: "YELLOW" | "GREEN" | "RED";
  isVerified: boolean;

  name: string;
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
  images: Array<{ id: string; name: string; url: string }>;
  scholarity: string;
  languages: Array<{ name: string; level: string }>;
  hasLocal: boolean;
  views: number;

  producer: Producer;
  contacts: ProducerContact[];
  local: ProducerLocal | null;
  appearance: ProducerAppearance[];
  prices: ProducerPrice[];
  services: ProducerService[];
  fetiches: ProducerFetish[];
  audience: ProducerAudience[];
  locations: ProducerLocation[];
  neighborhoods: Array<{ name: string }>;
  payments: ProducerPayment[];
  reviews: Review[];
}

export interface ProducerContact {
  id: number;
  profileId: number;
  contactId: number;

  value: string;
  label?: string;
  isPrimary: boolean;
  isPublic: boolean;
  order: number;

  option: Option;
}

export interface ProducerLocal {
  id: number;
  profileId: number;
  cep: string;
  country: string;
  state: string;
  city: string;
  neighborhood: string;
  street?: string;
  number?: string;
  complement?: string;
  amenities: LocalAmenity[];
}

export interface Option {
  id: number;
  name: string;
  label: string;
}

export interface LocalAmenity {
  id?: number;
  localId?: number;
  amenityId: number;
  option: Option;
}

export interface ProducerAppearance {
  id: number;
  profileId: number;
  appearanceId: number;

  valueBoolean?: boolean | null;
  valueNumber?: number | null;
  valueString?: string | null;

  option: Option & {
    valueType: "BOOLEAN" | "NUMBER" | "OPTION";
  };
}

export interface ProducerLocation {
  id?: number;
  profileId?: number;
  locationId: number;
  option: Option;
}

export interface ProducerPrice {
  id?: number;
  profileId?: number;
  priceId: number;
  value: number;
  option: Option;
}

export interface ProducerService {
  id: number;
  profileId: number;
  serviceId: number;
  status: string;
  option: Option;
}

export interface ProducerFetish {
  id: number;
  profileId: number;
  fetishId: number;
  status: string;
  option: Option;
}

export interface ProducerAudience {
  id: number;
  profileId: number;
  audienceId: number;
  status: string;
  option: Option;
}

export interface ProducerPayment {
  id?: number;
  profileId?: number;
  paymentId: number;
  option: Option;
}

export interface Review {
  id: string;
  userId: number;
  user: User;
  profileId: number;
  rating: number;
  comment: string | null;
  isApproved: boolean;
  hasComment: boolean;
  createdAt: Date;
}
