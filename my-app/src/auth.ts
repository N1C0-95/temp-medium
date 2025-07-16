import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

export const { handlers } = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
      issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
      authorization: {
        params: {
          scope: "openid profile email User.Read",
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
        // Extract OID from profile or account, depending on provider
        if (profile?.oid) {
          token.oid = profile.oid;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.oid as string; // oid da jwt
        //session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
});
