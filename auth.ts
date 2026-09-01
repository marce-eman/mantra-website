import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) {
          throw new Error("Account not found");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return user;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // 1. Tangkap data saat pertama kali login
      if (user) {
        token.id = user.id;
      }
      
      // 2. MENCEGAH BUG NEXTAUTH: Diam-diam NextAuth menyimpan ID di 'token.sub'. 
      // Kita jadikan fallback kalau 'token.id' tiba-tiba kosong.
      const currentId = token.id || token.sub;
      
      // 3. TARIK DATA TERBARU DARI DATABASE (Trik Sakti)
      // Menjamin hak akses (Role) selalu up-to-date tanpa perlu re-login!
      if (currentId) {
        token.id = currentId;
        const dbUser = await prisma.user.findUnique({ 
          where: { id: currentId as string },
          select: { role: true }
        });
        if (dbUser) {
          token.role = dbUser.role;
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        // Petakan kembali id dan role dari token ke session dengan aman
        session.user.id = (token.id as string) || (token.sub as string);
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});