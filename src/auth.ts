import NextAuth, { type DefaultSession } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import type { NextAuthConfig } from 'next-auth'
import { signInSchema } from '@/lib/zod'
import { getUserFromDb, AuthError, type UserData } from '@/utils/api'
import { setBearerToken } from '@/lib/axios'

declare module 'next-auth' {
    /**
     * Extend the built-in session types
     */
    interface Session {
        user: {
            id: string
            role: string
            permissions: string[]
        } & DefaultSession['user']
        accessToken: string
        refreshToken: string
        tokenType: string
        expires: string
    }
}

// Extend the JWT type to include our custom fields
declare module 'next-auth/jwt' {
    interface JWT {
        id: string
        name: string
        email: string
        role: string
        permissions: string[]
        accessToken: string
        refreshToken: string
        tokenType: string
        expiresAt: number
    }
}

const authConfig: NextAuthConfig = {
    theme: {
        logo: '/logo.png',
        brandColor: '#6366F1',
        buttonText: '#FFFFFF',
    },
    providers: [
        Credentials({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                try {
                    // Ensure credentials exist and have required fields
                    if (!credentials || typeof credentials !== 'object') {
                        console.error('Invalid credentials format')
                        return null
                    }

                    const { email, password } = credentials

                    if (!email || !password) {
                        console.error('Email and password are required')
                        return null
                    }

                    // Validate credentials using zod schema
                    await signInSchema.parseAsync({
                        email: email.toString(),
                        password: password.toString(),
                    })

                    // Use the getUserFromDb function to authenticate via your API
                    const user = await getUserFromDb(
                        email.toString(),
                        password.toString(),
                    )
                    if (!user) {
                        console.error('User not found or invalid credentials')
                        return null
                    }

                    return user
                } catch (error) {
                    console.error('Authentication error:', error)
                    return null
                }
            },
        }),
    ],
    pages: {
        signIn: '/login',
        error: '/error',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
    jwt: {
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    cookies: {
        sessionToken: {
            name: `authjs.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
            },
        },
        callbackUrl: {
            name: `authjs.callback-url`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
            },
        },
        csrfToken: {
            name: `authjs.csrf-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
            },
        },
    },
    debug: true,
    callbacks: {
        async jwt({ token, user, account }) {
            // Initial sign in
            if (account && user) {
                const userData = user as UserData

                const accessToken = userData.access_token
                console.log('Access token:', accessToken)
                if (accessToken) {
                    setBearerToken(accessToken)
                }

                const newToken = {
                    ...token,
                    id: userData.id,
                    name: userData.name,
                    email: userData.email,
                    role: userData.role || 'user',
                    permissions: userData.permissions || [],
                    accessToken: userData.access_token,
                    refreshToken: userData.refresh_token || '',
                    tokenType: userData.token_type || 'Bearer',
                    expiresAt:
                        Date.now() + (userData.expires_in || 3600) * 1000,
                }

                return newToken
            }

            // Return previous token if the access token has not expired yet
            if (Date.now() < token.expiresAt) {
                return token
            }

            // Access token has expired, try to update it
            // You can implement refresh token logic here if your API supports it
            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user = {
                    ...session.user,
                    id: token.id,
                    name: token.name,
                    email: token.email,
                    role: token.role,
                    permissions: token.permissions,
                }
                session.accessToken = token.accessToken
                session.refreshToken = token.refreshToken
                session.tokenType = token.tokenType
                session.expires = new Date(token.expiresAt).toISOString()

                // Set the bearer token for API requests
                if (token.accessToken) {
                    setBearerToken(token.accessToken)
                }
            }
            return session
        },
        async signIn({ user, account, profile }) {
            // This is called when the user signs in successfully
            return true
        },
    },
} satisfies NextAuthConfig

// Create the auth instance
const { handlers, auth, signIn, signOut } = NextAuth(authConfig)

// Export the handlers and auth functions
export { handlers, auth, signIn, signOut }

// Export individual handlers for route.ts
export const { GET, POST } = handlers
