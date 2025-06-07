'use client'

import Button from '@/components/Button'
import Input from '@/components/Input'
import InputError from '@/components/InputError'
import Label from '@/components/Label'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthSessionStatus from '@/app/(auth)/AuthSessionStatus'
import { toast } from 'react-toastify'
import { signIn, getSession } from 'next-auth/react'

const Login = () => {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [shouldRemember, setShouldRemember] = useState(false)
    const [errors, setErrors] = useState([])
    const [status, setStatus] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (router.reset?.length > 0 && errors.length === 0) {
            setStatus(atob(router.reset))
        } else {
            setStatus(null)
        }
    })

    const submitForm = async event => {
        event.preventDefault()
        setIsLoading(true)
        setErrors([])

        try {
            // Use NextAuth's signIn function instead of direct API call
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false, // Don't redirect automatically
            })

            if (result?.error) {
                // Handle authentication errors
                toast.error(
                    'Error al iniciar sesión: Verifique sus credenciales',
                    {
                        position: 'top-right',
                        autoClose: 3000,
                    },
                )
            } else if (result?.ok) {
                // Success - get the session to confirm
                const session = await getSession()

                if (session) {
                    toast.success('¡Inicio de sesión exitoso!', {
                        position: 'top-right',
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    })

                    // Redirect to app
                    router.push('/app')
                } else {
                    toast.error('Error al obtener la sesión', {
                        position: 'top-right',
                        autoClose: 3000,
                    })
                }
            }
        } catch (error) {
            toast.error('Error al iniciar sesión: ' + error.message, {
                position: 'top-right',
                autoClose: 3000,
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            setEmail(process.env.NEXT_PUBLIC_DEFAULT_EMAIL || '')
            setPassword(process.env.NEXT_PUBLIC_DEFAULT_PASSWORD || '')
        }
    }, [])

    return (
        <>
            <AuthSessionStatus className="mb-4" status={status} />
            <form onSubmit={submitForm}>
                {/* Email Address */}
                <div>
                    <Label htmlFor="email">Email</Label>

                    <Input
                        id="email"
                        type="email"
                        value={email}
                        className="block mt-1 w-full"
                        onChange={event => setEmail(event.target.value)}
                        required
                        autoFocus
                        disabled={isLoading}
                    />

                    <InputError messages={errors.email} className="mt-2" />
                </div>

                {/* Password */}
                <div className="mt-4">
                    <Label htmlFor="password">Password</Label>

                    <Input
                        id="password"
                        type="password"
                        value={password}
                        className="block mt-1 w-full"
                        onChange={event => setPassword(event.target.value)}
                        required
                        autoComplete="current-password"
                        disabled={isLoading}
                    />

                    <InputError messages={errors.password} className="mt-2" />
                </div>

                {/* Remember Me */}
                <div className="block mt-4">
                    <label
                        htmlFor="remember_me"
                        className="inline-flex items-center">
                        <input
                            id="remember_me"
                            type="checkbox"
                            name="remember"
                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            onChange={event =>
                                setShouldRemember(event.target.checked)
                            }
                            disabled={isLoading}
                        />

                        <span className="ml-2 text-sm text-gray-600">
                            Remember me
                        </span>
                    </label>
                </div>

                <div className="flex items-center justify-end mt-4">
                    <Link
                        href="/forgot-password"
                        className="underline text-sm text-gray-600 hover:text-gray-900">
                        Forgot your password?
                    </Link>

                    <Button className="ml-3" disabled={isLoading}>
                        {isLoading ? 'Signing in...' : 'Login'}
                    </Button>
                </div>
            </form>
        </>
    )
}

export default Login
