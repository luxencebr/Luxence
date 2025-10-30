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

        return user;
      },
    }),
  ],
});
