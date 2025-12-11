import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import connector from "@/components/LogIn/connector";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        console.log(credentials);

        const user = await connector(
          credentials.email as string,
          credentials.password as string
        );

        if (user) {
          return {
            id: String(user.id),
            email: user.email,
            name: user.name,
            role: user.role,
            signature: user.signature,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.signature = user.signature;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.signature = token.signature as string | null | undefined;
      }
      return session;
    },
  },
});
