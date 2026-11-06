import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Adresse e-mail', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        const email =
          typeof credentials.email === 'string'
            ? credentials.email.trim().toLowerCase()
            : ''
        const password =
          typeof credentials.password === 'string' ? credentials.password : ''
        if (!email || !password) return null

        const user = await prisma.user.findUnique({ where: { email } })
        if (
          !user ||
          user.suspended ||
          !(await bcrypt.compare(password, user.passwordHash))
        ) {
          return null
        }

        return { id: user.id, name: user.name, email: user.email }
      },
    }),
  ],
  callbacks: {
    async authorized({ auth: session, request }) {
      const path = request.nextUrl.pathname
      const isProtectedPath =
        path === '/dashboard' ||
        path.startsWith('/dashboard/') ||
        path === '/admin' ||
        path.startsWith('/admin/') ||
        /^\/site\/[^/]+\/edit$/.test(path)

      if (!isProtectedPath) return true

      if (!session?.user?.id) return false
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { suspended: true },
      })
      return Boolean(user && !user.suspended)
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (session.user && typeof token.id === 'string') {
        session.user.id = token.id
      }
      return session
    },
  },
})
