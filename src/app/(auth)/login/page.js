'use client'

import Button from '@/components/Button'
import Input from '@/components/Input'
import InputError from '@/components/InputError'
import Label from '@/components/Label'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthSessionStatus from '@/app/(auth)/AuthSessionStatus'
import { toast } from 'react-toastify';
import { getSession } from 'next-auth/react';
import axios from 'axios';

const Login = () => {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [shouldRemember, setShouldRemember] = useState(false)
    const [errors, setErrors] = useState([])
    const [status, setStatus] = useState(null)

    useEffect(() => {
        if (router.reset?.length > 0 && errors.length === 0) {
            setStatus(atob(router.reset))
        } else {
            setStatus(null)
        }
    })

    const submitForm = async event => {
        event.preventDefault()
        
        try {
            // Use direct API call to backend instead of NextAuth's signIn
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
            console.log('Backend URL:', backendUrl);
            
            const response = await axios.post(`${backendUrl}/api/login`, {
                email,
                password
            });
            
            console.log('Login response:', response.data);
            
            // Check for the token in the response data structure
            if (response.data && response.data.data && response.data.data.token) {
                const token = response.data.data.token;
                
                // Store the token in localStorage
                localStorage.setItem('access_token', token);
                
                // Also set as a cookie for the middleware
                document.cookie = `access_token=${token}; path=/; max-age=86400; SameSite=Strict`;
                
                // Show success toast
                toast.success('¡Inicio de sesión exitoso!', {
                    position: 'top-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                
                // Get user data from response
                const userData = response.data.data || {};
                const userName = userData.name || 'Usuario';
                console.log(`Login successful for user: ${userName}`);
                
                // Redirect to app
                const redirectPath = '/app';
                console.log(`Redirecting to ${redirectPath}`);
                
                // Use window.location.href for direct navigation
                setTimeout(() => {
                    window.location.href = redirectPath;
                }, 100);
            } else {
                // Show error toast
                toast.error('Error al iniciar sesión. Respuesta inválida del servidor.', {
                    position: 'top-right',
                    autoClose: 3000,
                });
            }
        } catch (error) {
            console.error('Login error:', error);
            
            // Get error message from response if available
            const errorMessage = error.response?.data?.message || 
                                error.response?.data?.error || 
                                error.message || 
                                'Verifique sus credenciales';
            
            toast.error('Error al iniciar sesión: ' + errorMessage, {
                position: 'top-right',
                autoClose: 3000,
            });
        }
    }

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
                    />

                    <InputError
                        messages={errors.password}
                        className="mt-2"
                    />
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

                    <Button className="ml-3">Login</Button>
                </div>
            </form>
        </>
    )
}

export default Login
