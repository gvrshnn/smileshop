import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
    isAdmin?: boolean;
  }

  interface User {
    isAdmin?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isAdmin?: boolean;
  }
}
