import { type User } from "./User";
import { type ProducerAppearance } from "./ProducerAppearance";
import { type ProducerPrice } from "./ProducerPrice";
import { type ProducerReview } from "./ProducerReview";
import { type Services } from "./ProducerServices";

export interface Producer extends User {
  role: "advertiser";

  metadata: User["metadata"] & {
    verified: boolean;
    tags?: string[];
    signature: string;
    views: number;
  };

  profile: User["profile"] & {
    images: string[];
    age: number;
    nationality: string;
    slogan: string;
    description: string;
    languages: {
      name: string;
      level: "Básico" | "Intermediário" | "Fluente";
    }[];
    scholarity: { level: "Fundamental" | "Completo" | "Superior" };
  };

  appearance: ProducerAppearance;

  prices: ProducerPrice[];

  payments: {
    cash?: boolean;
    pix?: boolean;
    credit?: boolean;
    debit?: boolean;
  };

  services: Services;

  reviews?: ProducerReview[];

  locality: User["locality"] & {
    neighborhood: string;
    hasLocal: boolean;
    locations: {
      athome?: boolean;
      hotels?: boolean;
      motels?: boolean;
      events?: boolean;
    };
    local: {
      state: string;
      city: string;
      neighborhood: string;
      amenities: {
        wifi?: boolean;
        airconditioning?: boolean;
        shower?: boolean;
        condom?: boolean;
        parking?: boolean;
      };
    };
  };

  contact: {
    phone: string;
    instagram?: string;
    telegram?: string;
  };
}
