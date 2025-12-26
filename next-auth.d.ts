import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role?: string;
    signature?: string | null;
    preferences?: ("MALE" | "FEMALE" | "TRANS")[];
  }

  interface Session {
    user: {
      id: string;
      role?: string;
      signature?: string | null;
      preferences?: ("MALE" | "FEMALE" | "TRANS")[];
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    signature?: string | null;
    preferences?: ("MALE" | "FEMALE" | "TRANS")[];
  }
}
