import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "./db";
import { v4 as uuidv4 } from "uuid";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;
      const client = await db.connect();
      try {
        // Check if user exists
        const { rows } = await client.query('SELECT id FROM users WHERE email = $1', [user.email]);
        
        if (rows.length === 0) {
          const newId = uuidv4();
          // Try to insert with NextAuth standard column "image", fallback to just email/name if error
          try {
            await client.query(
              'INSERT INTO users (id, email, name, image) VALUES ($1, $2, $3, $4)',
              [newId, user.email, user.name, user.image]
            );
          } catch (insertErr: any) {
            console.error('Failed to insert user with image column:', insertErr?.message);
            try {
               await client.query(
                 'INSERT INTO users (id, email, name, avatar_url) VALUES ($1, $2, $3, $4)',
                 [newId, user.email, user.name, user.image]
               );
            } catch (fallbackErr: any) {
               console.error('Failed fallback insert user:', fallbackErr?.message);
               try {
                 await client.query(
                   'INSERT INTO users (id, email, name) VALUES ($1, $2, $3)',
                   [newId, user.email, user.name]
                 );
               } catch (finalErr: any) {
                 console.error('Final fallback insert user failed:', finalErr?.message);
               }
            }
          }
        }
      } catch (err) {
        console.error("signIn db error", err);
      } finally {
        client.release();
      }
      return true;
    },
    async session({ session, token }) {
      if (session?.user?.email) {
        try {
          const { rows } = await db.query('SELECT id FROM users WHERE email = $1', [session.user.email]);
          if (rows.length > 0) {
            (session.user as any).id = rows[0].id; // DB UUID!
          } else {
            (session.user as any).id = token.sub; // Fallback
          }
        } catch (err) {
          console.error("session fetch user error", err);
          (session.user as any).id = token.sub;
        }
      }
      return session;
    },
  },
};
