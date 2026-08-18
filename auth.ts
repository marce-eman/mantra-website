import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
      if (user) {
        token.id = user.id;
        const dbUser = await prisma.user.findUnique({ where: { id: user.id! } });
        token.role = dbUser?.role || "CUSTOMER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },

  // --- FITUR NOTIFIKASI EMAIL SAAT BERHASIL SIGN IN ---
  events: {
    async signIn({ user }) {
      if (!user?.email) return;

      const loginTime = new Date().toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
        dateStyle: "full",
        timeStyle: "medium",
      });

      try {
        await resend.emails.send({
          from: "MANTRA Security <onboarding@resend.dev>", // Nanti bisa diganti no-reply@domainmu.com jika domain sudah siap
          to: user.email,
          subject: "[MANTRA] Security Alert: New Sign-in Detected",
          html: `
            <div style="background-color: #050505; color: #ececec; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; text-align: center;">
              <div style="max-width: 480px; margin: 0 auto; background-color: #0a0a0a; border: 1px solid #1f1f1f; border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                
                <h1 style="letter-spacing: 0.25em; font-weight: 300; font-size: 20px; margin: 0 0 8px 0; color: #ffffff; text-transform: uppercase;">
                  M A N T R A
                </h1>
                <p style="color: #666; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; margin: 0 0 28px 0; font-family: monospace;">
                  Exclusive Profile Security
                </p>

                <div style="height: 1px; background-color: #1f1f1f; margin-bottom: 24px;"></div>

                <div style="text-align: left; margin-bottom: 24px;">
                  <h2 style="font-size: 14px; font-weight: 500; color: #ececec; margin: 0 0 10px 0;">
                    New Sign-in Detected
                  </h2>
                  <p style="font-size: 11px; line-height: 1.6; color: #888888; margin: 0 0 16px 0; font-family: monospace;">
                    Hello <strong style="color: #ececec;">${user.name || user.email}</strong>, your MANTRA account was recently accessed.
                  </p>
                  
                  <div style="background-color: #111111; border: 1px solid #1f1f1f; border-radius: 8px; padding: 14px; margin-bottom: 16px;">
                    <p style="font-size: 10px; color: #888; margin: 0 0 4px 0; font-family: monospace;">TIME (WIB):</p>
                    <p style="font-size: 11px; color: #ececec; margin: 0 0 10px 0; font-family: monospace;">${loginTime}</p>
                    
                    <p style="font-size: 10px; color: #888; margin: 0 0 4px 0; font-family: monospace;">METHOD:</p>
                    <p style="font-size: 11px; color: #10b981; margin: 0; font-family: monospace;">Secure Password & Biometric Passkey</p>
                  </div>

                  <p style="font-size: 10px; color: #555555; line-height: 1.5; margin: 0; font-family: monospace;">
                    If this was you, you can safely ignore this email. If you did not perform this login, please change your credentials immediately.
                  </p>
                </div>

                <div style="height: 1px; background-color: #1f1f1f; margin-bottom: 20px;"></div>
                <p style="color: #444; font-size: 9px; margin: 0; letter-spacing: 0.1em; font-family: monospace; text-transform: uppercase;">
                  Automated Security Alert &bull; Do Not Reply
                </p>
              </div>
            </div>
          `,
        });
      } catch (err) {
        console.error("Failed to send login notification email:", err);
      }
    },
  },
});