import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return { id: user.id.toString(), email: user.email, isAdmin: user.isAdmin };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user && 'isAdmin' in user) {
        token.isAdmin = user.isAdmin;
      }
      // Добавляем id пользователя в токен (чтобы использовать на клиенте)
      if (user?.id) {
        token.sub = String(user.id);
      }
      return token;
    },
    async session({ session, token }) {
      if (token && 'isAdmin' in token) {
        session.isAdmin = token.isAdmin;
      }
      if (session.user && token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};
