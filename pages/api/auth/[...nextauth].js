import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

const authOptions = ({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
      	try {
					const [users] = await pool.query('SELECT * FROM Users WHERE email = ?', [credentials.email]);
					if (users.length === 0) {
						throw new Error('Неправильний email або пароль');
					}
					
					const user = users[0];
					const isValid = await bcrypt.compare(credentials.password, user.password);
					if (!isValid) {
						throw new Error('Неправильний email або пароль');
					}
					
					return {
						id: user.user_id.toString(),
						email: user.email,
						user_role: user.user_role
					}
				
				} catch (error) {
					throw error; 
				}
      }
    })
  ],
  session: {
    strategy: 'jwt',
		maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
		async jwt({ token, user, trigger, session }) {
			if (user) {
				token.id = user.id;
				token.email = user.email;
				token.user_role = user.user_role; 
			}

			if (trigger === "update" && session?.email) {
				token.email = session.email;
			}

			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id; 
				session.user.email = token.email;
				session.user.user_role = token.user_role; 
			}
			return session;
		},
	},
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    error: '/login',
  },
});

export default NextAuth(authOptions);
export { authOptions };