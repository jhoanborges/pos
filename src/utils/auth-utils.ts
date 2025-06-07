import { signOut } from 'next-auth/react'
import { logoutUser } from './api'

/**
 * Custom sign out function that handles both client and server-side cleanup
 */
export const customSignOut = async (): Promise<void> => {
    try {
        // First, call the server-side logout
        const logout = await logoutUser()
        console.log('Logout successful', logout)

        // Clear all client-side auth state
        clearAuthState()

        // Sign out using next-auth's client-side signOut
        await signOut({ redirect: false })

        // Force a full page reload to ensure all auth state is cleared
        window.location.href = '/login'
    } catch (error) {
        console.error('Error during sign out:', error)
        // Clear client state and redirect even if there's an error
        clearAuthState()
        window.location.href = '/login'
    }
}

/**
 * Clears all client-side authentication state
 */
const clearAuthState = (): void => {
    if (typeof window === 'undefined') return

    // Clear all auth-related cookies
    const cookies = document.cookie.split(';')
    const domains = [
        window.location.hostname,
        `.${window.location.hostname}`,
        window.location.hostname.split('.').slice(-2).join('.'),
        `.${window.location.hostname.split('.').slice(-2).join('.')}`,
    ]

    // Clear cookies for all relevant domains and paths
    cookies.forEach(cookie => {
        const [name] = cookie.trim().split('=')
        if (
            name.startsWith('authjs.') ||
            name.startsWith('next-auth.') ||
            name === 'session'
        ) {
            domains.forEach(domain => {
                document.cookie = `${name}=; path=/; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:00 GMT`
                document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
                document.cookie = `${name}=; path=/; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure`
            })
        }
    })

    // Clear all storage
    sessionStorage.clear()
    localStorage.clear()
}
