export interface User {
  role: undefined | "advertiser";
  id: number;

  metadata: {
    createdAt: string;
    lastLogin?: string;
    email: string;
    password: string;
    status: "active" | "inactive" | "banned" | "pendingApproval";
  };
  profile: {
    name: string;
    gender?: "male" | "female" | "femaletrans";
    prefer?: "male" | "female" | "femaletrans";
  };
  locality: {
    country: string;
    state: string;
    city: string;
  };
}
