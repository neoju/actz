import { SvelteKitAuth } from "@auth/sveltekit";
import Google from "@auth/sveltekit/providers/google";
import Credentials from "@auth/sveltekit/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "$lib/prisma";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  AUTH_SECRET,
} from "$env/static/private";

export const { handle, signIn, signOut } = SvelteKitAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "Guest",
      credentials: {
        guestUserId: { label: "Guest User ID", type: "text" },
      },
      async authorize(credentials) {
        const guestUserId = credentials.guestUserId as string | undefined;

        if (guestUserId) {
          const user = await prisma.user.findUnique({
            where: { id: guestUserId },
            include: { accounts: true },
          });

          // If user exists and has no linked accounts, it's a valid guest
          if (user && user.accounts.length === 0) {
            return user;
          }
        }

        // If no guestUserId provided, or user not found, or user has accounts:
        // Create a NEW guest user. We let the database generate the unique ID.
        const newGuest = await prisma.user.create({
          data: {
            name: "Guest",
          },
        });

        return newGuest;
      },
    }),
  ],
  secret: AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user && token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  trustHost: true,
});
