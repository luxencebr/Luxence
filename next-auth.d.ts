import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role?: string;
    signature?: string | null;
  }

  interface Session {
    user: {
      id: string;
      role?: string;
      signature?: string | null;
    } & DefaultSession["user"];
  }

  interface JWT {
    id: string;
    role?: string;
    signature?: string | null;
  }
}
