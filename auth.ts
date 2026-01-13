import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import connector from "@/components/LogIn/connector";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,

  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await connector(
          credentials.email as string,
          credentials.password as string
        );

        if (!user) return null;

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          role: user.role,
          signature: user.signature,
          preferences: user.preferences,
          producerId: user.producer?.id ? String(user.producer.id) : null,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.signature = user.signature;
        token.preferences = user.preferences;
        token.producerId = user.producerId;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.signature = token.signature as string | null;
        session.user.preferences = token.preferences as
          | ("MALE" | "FEMALE" | "TRANS")[]
          | undefined;

        session.user.producerId = token.producerId as string | null;
      }
      return session;
    },
  },
});
