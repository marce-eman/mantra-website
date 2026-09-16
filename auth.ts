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

// Menyiapkan daftar provider secara aman
const providers: any[] = [
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
];

// Daftarkan Google Provider jika environment variables tersedia atau berikan safe fallback
const googleId = process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID;
const googleSecret = process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET;

if (googleId && googleSecret) {
  providers.push(
    Google({
      clientId: googleId,
      clientSecret: googleSecret,
      allowDangerousEmailAccountLinking: true,
    })
  );
} else {
  // Safe dummy initialization agar tidak crash jika tombol Google diklik sebelum env disetel
  providers.push(
    Google({
      clientId: googleId || "google-client-id-fallback",
      clientSecret: googleSecret || "google-client-secret-fallback",
      allowDangerousEmailAccountLinking: true,
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret:
    process.env.NEXTAUTH_SECRET ||
    process.env.AUTH_SECRET ||
    "mantra-super-secret-key-2026-xyz-99",
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // 1. Tangkap data saat pertama kali login
      if (user) {
        token.id = user.id;
      }
      
      // 2. MENCEGAH BUG NEXTAUTH: Fallback jika token.id kosong menggunakan token.sub
      const currentId = token.id || token.sub;
      
      // 3. TARIK DATA TERBARU DARI DATABASE
      if (currentId) {
        token.id = currentId;
        try {
          const dbUser = await prisma.user.findUnique({ 
            where: { id: currentId as string },
            select: { role: true }
          });
          if (dbUser) {
            token.role = dbUser.role;
          }
        } catch (err) {
          console.error("JWT role fetch error:", err);
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = (token.id as string) || (token.sub as string);
        session.user.role = (token.role as string) || "CUSTOMER";
      }
      return session;
    },
  },
});