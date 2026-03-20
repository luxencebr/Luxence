import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string;
      name?: string;
      role?: string;
      gender?: "MALE" | "FEMALE" | "TRANS" | null; // ✅
      signature?: string | null;
      preferences?: ("MALE" | "FEMALE" | "TRANS")[];
      producerId?: string | null;
    };
    sessionToken?: string;
  }

  interface User {
    id: string;
    role?: string;
    gender?: "MALE" | "FEMALE" | "TRANS" | null; // ✅
    signature?: string | null;
    preferences?: ("MALE" | "FEMALE" | "TRANS")[];
    producerId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string;
    gender?: "MALE" | "FEMALE" | "TRANS" | null; // ✅
    signature?: string | null;
    preferences?: ("MALE" | "FEMALE" | "TRANS")[];
    producerId?: string | null;
    sessionToken?: string;
  }
}
