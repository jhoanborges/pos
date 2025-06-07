'use client'

import Link from 'next/link'
import { getSession } from 'next-auth/react';

const LoginLinks = () => {
    const session = getSession()

    return (
        <div className="hidden fixed top-0 right-0 px-6 py-4 sm:block">
            {session ? (
                <Link
                    href="/dashboard"
                    className="ml-4 text-sm text-gray-700 underline"
                >
                    Dashboard
                </Link>
            ) : (
                <>
                    <Link
                        href="/login"
                        className="text-sm text-gray-700 underline"
                    >
                        Login
                    </Link>

                    <Link
                        href="/register"
                        className="ml-4 text-sm text-gray-700 underline"
                    >
                        Register
                    </Link>
                </>
            )}
        </div>
    )
}

export default LoginLinks
