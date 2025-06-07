import { getSession } from 'next-auth/react'
import { axios } from '@/lib/axios'

export const clearBearerToken = (): void => {
    if (typeof window !== 'undefined') {
        // Remove token from localStorage
        localStorage.removeItem('auth_token')

        // Remove authorization header
        delete axios.defaults.headers.common['Authorization']

        console.log('Bearer token cleared')
    }
}

export const getBearerToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('auth_token')
    }
    return null
}

// Login function to handle your specific response format
export const getUserFromDb = async (
    email: string,
    password: string,
): Promise<UserData | null> => {
    try {
        const response = await axios.post('/api/login', { email, password })
        const responseData = response.data

        // Handle your specific response format
        if (
            responseData &&
            responseData.status === 200 &&
            responseData.data &&
            responseData.data.token
        ) {
            const token = responseData.data.token
            const name = responseData.data.name

            return {
                id: responseData.data.id,
                email: email,
                name: name || email.split('@')[0],
                role: 'user', // or get from response if available
                permissions: [],
                access_token: token,
                refresh_token: '', // Add if your API provides one
                token_type: 'Bearer',
                expires_in: 3600, // Adjust based on your token expiry
            }
        }
        return null
    } catch (error) {
        console.error('Login error:', error)
        throw new AuthError('Login failed. Please check your credentials.')
    }
}
/**
 * Register request interface
 */
export interface RegisterRequest {
    name: string
    lastname: string
    username: string
    email: string
    password: string
    password_confirmation: string
}

/**
 * Register response interface
 */
export interface RegisterResponse {
    message: string
    user?: {
        id: string
        name: string
        email: string
    }
}

/**
 * Response from the forgot password API
 */
export interface ForgotPasswordResponse {
    message: string
    temp_password?: string
    token?: string
    reset_url?: string
}

/**
 * API success response format
 */
export interface ApiSuccessResponse<T> {
    status: number
    message: string
    data: T
}

/**
 * API error response format
 */
export interface ApiErrorResponse {
    errors: {
        status: number
        title: string
        detail: string
    }[]
}

/**
 * Reset password request interface
 */
export interface ResetPasswordRequest {
    email: string
    token: string
    password: string
    password_confirmation: string
}

/**
 * Reset password response interface
 */
export interface ResetPasswordResponse {
    message: string
}

/**
 * Token verification response interface
 */
export interface VerifyTokenResponse {
    valid: boolean
    message: string
    expires_at?: string
}

export interface UserInfo {
    id: string
    email: string
    name: string
}

/**
 * Verifies if a password reset token is valid
 */
export async function verifyResetToken(
    email: string,
    token: string,
): Promise<VerifyTokenResponse> {
    try {
        console.log('Verifying reset token for', email)

        if (!axios.defaults.baseURL) {
            console.error('API base URL is not configured properly')
            throw new AuthError('API configuration error: Missing base URL')
        }

        const response = await axios.post<
            ApiSuccessResponse<VerifyTokenResponse>
        >('/api/verify-reset-token', { email, token })

        console.log('Token verification response', response.data)
        return response.data.data
    } catch (error) {
        console.error('Error verifying token', error)

        if (axios.isAxiosError(error)) {
            const responseData = error.response?.data as ApiErrorResponse

            if (
                responseData &&
                responseData.errors &&
                responseData.errors.length > 0
            ) {
                const firstError = responseData.errors[0]
                return {
                    valid: false,
                    message: firstError.detail || 'Token inválido o expirado',
                }
            } else if (error.response?.data) {
                const oldFormatData = error.response.data
                if (oldFormatData.message) {
                    return {
                        valid: false,
                        message:
                            oldFormatData.message ||
                            'Token inválido o expirado',
                    }
                }
            }

            return {
                valid: false,
                message: 'Error al verificar el token',
            }
        }

        return {
            valid: false,
            message: 'Error al verificar el token',
        }
    }
}

export async function resetPassword(
    data: ResetPasswordRequest,
): Promise<ResetPasswordResponse> {
    try {
        console.log('Resetting password for', data.email)

        if (!axios.defaults.baseURL) {
            console.error('API base URL is not configured properly')
            throw new AuthError('API configuration error: Missing base URL')
        }

        const response = await axios.post<
            ApiSuccessResponse<ResetPasswordResponse>
        >('/api/reset-password', data)

        console.log('Password reset successfully')
        console.log('API response:', response.data)

        if (response.data && response.data.status === 200) {
            return {
                message:
                    response.data.message ||
                    'Contraseña restablecida correctamente',
            }
        } else {
            return response.data.data || (response.data as any)
        }
    } catch (error) {
        console.error('Error resetting password', error)

        if (axios.isAxiosError(error)) {
            const responseData = error.response?.data as ApiErrorResponse

            if (
                responseData &&
                responseData.errors &&
                responseData.errors.length > 0
            ) {
                const firstError = responseData.errors[0]
                console.log('Error detail from API:', firstError)
                throw new AuthError(firstError.detail, {
                    message: firstError.detail,
                })
            } else if (error.response?.data) {
                const oldFormatData = error.response.data

                if (oldFormatData.message) {
                    throw new AuthError(oldFormatData.message, oldFormatData)
                }

                if (error.response?.status === 400) {
                    throw new AuthError('Token inválido o expirado')
                }

                if (error.response?.status === 404) {
                    throw new AuthError('Usuario no encontrado')
                }

                if (error.response?.status === 422 && oldFormatData.errors) {
                    const errorMessages = Object.values(
                        oldFormatData.errors,
                    ).flat()
                    if (errorMessages.length > 0) {
                        throw new AuthError(errorMessages[0] as string)
                    }
                }
            }

            throw new AuthError('Error al restablecer la contraseña')
        }

        throw error
    }
}

export async function sendResetPasswordEmail(
    email: string,
): Promise<ForgotPasswordResponse> {
    try {
        console.log('Sending reset password email to', email)

        if (!axios.defaults.baseURL) {
            console.error('API base URL is not configured properly')
            throw new AuthError('API configuration error: Missing base URL')
        }

        const response = await axios.post<
            ApiSuccessResponse<ForgotPasswordResponse>
        >('/api/forgot-password', { email })

        console.log('Reset password email sent successfully')
        console.log('API response:', response.data)

        if (response.data && response.data.status === 200) {
            const responseData = response.data.data || {}

            const result: ForgotPasswordResponse = {
                message: response.data.message,
                token: responseData.token,
                reset_url: responseData.reset_url,
                temp_password: responseData.temp_password,
            }

            console.log('Processed response:', result)
            return result
        } else {
            return response.data.data || (response.data as any)
        }
    } catch (error) {
        console.error('Error sending reset password email', error)

        if (axios.isAxiosError(error)) {
            const responseData = error.response?.data as ApiErrorResponse

            if (
                responseData &&
                responseData.errors &&
                responseData.errors.length > 0
            ) {
                const firstError = responseData.errors[0]
                throw new AuthError(firstError.detail, {
                    message: firstError.detail,
                    status: firstError.status,
                })
            } else if (error.response?.data) {
                const oldFormatData = error.response.data
                if (oldFormatData.message) {
                    throw new AuthError(oldFormatData.message, oldFormatData)
                }

                if (error.response?.status === 404) {
                    throw new AuthError(
                        'No se encontró una cuenta con este correo electrónico',
                    )
                }
            }

            throw new AuthError(
                'Error al enviar el correo de restablecimiento de contraseña',
            )
        }

        throw error
    }
}

// Helper function to get token from client-side storage
const getClientToken = (): string | null => {
    if (typeof window === 'undefined') {
        console.log('Running on server, cannot access localStorage')
        return null
    }

    const token = localStorage.getItem('auth_token')
    console.log(
        'Retrieved token from localStorage:',
        token ? 'token exists' : 'no token found',
    )
    return token
}

export async function getUserInfo(token?: string): Promise<UserInfo | null> {
    try {
        const authToken = token || getClientToken()

        if (!authToken) {
            console.log('No authentication token found')
            return null
        }

        const response = await axios.get<UserInfo>('/api/me', {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        })

        if (response.data) {
            return {
                id: response.data.id,
                email: response.data.email,
                name: response.data.name,
            }
        }
        return null
    } catch (error) {
        console.error('Error getting user info:', error)
        return null
    }
}

// Define a custom error type for authentication errors
export class AuthError extends Error {
    public customData?: {
        message?: string
        reset_password_url?: string
        blocked?: boolean
        retry_after?: number | null
        [key: string]: any
    }

    constructor(message: string, customData?: any) {
        super(message)
        this.name = 'AuthError'
        this.customData = customData
    }
}

/**
 * Registers a new user
 */
export async function registerUser(
    data: RegisterRequest,
): Promise<RegisterResponse> {
    try {
        console.log('Registering user', data.email)

        if (!axios.defaults.baseURL) {
            console.error('API base URL is not configured properly')
            throw new AuthError('API configuration error: Missing base URL')
        }

        const response = await axios.post<ApiSuccessResponse<RegisterResponse>>(
            '/api/register',
            data,
        )

        console.log('User registered successfully')
        return response.data.data
    } catch (error) {
        console.error('Error registering user', error)

        if (axios.isAxiosError(error)) {
            const responseData = error.response?.data as ApiErrorResponse

            if (
                responseData &&
                responseData.errors &&
                responseData.errors.length > 0
            ) {
                const firstError = responseData.errors[0]
                throw new AuthError(firstError.detail, {
                    message: firstError.detail,
                    status: firstError.status,
                })
            } else if (error.response?.data) {
                const oldFormatData = error.response.data
                if (oldFormatData.message) {
                    throw new AuthError(oldFormatData.message, oldFormatData)
                }

                if (error.response?.status === 422 && oldFormatData.errors) {
                    const errorMessages = Object.values(
                        oldFormatData.errors,
                    ).flat()
                    if (errorMessages.length > 0) {
                        throw new AuthError(errorMessages[0] as string)
                    }
                }

                if (error.response?.status === 409) {
                    throw new AuthError(
                        'El correo electrónico ya está registrado',
                    )
                }
            }

            throw new AuthError('Error al registrar el usuario')
        }

        throw error
    }
}

export interface UserData {
    id: string
    email: string
    name?: string
    role: string
    permissions: string[]
    access_token: string
    refresh_token: string
    token_type: string
    expires_in: number
}

/**
 * Logs out the current user from the server
 */
export const logoutUser = async (): Promise<void> => {
    try {
        const session = await getSession()
        const refreshToken = session?.refreshToken
        const accessToken = session?.accessToken
        const tokenType = session?.tokenType

        console.log('Refresh token:', refreshToken)
        console.log('Access token:', accessToken)
        console.log('Token type:', tokenType)

        if (refreshToken) {
            await axios.post(
                '/api/logout',
                {
                    refresh_token: refreshToken,
                },
                {
                    headers: {
                        Authorization: `${tokenType} ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                },
            )
        }
    } catch (error) {
        console.error('Logout error:', error)
    } finally {
        // Always clear the bearer token on logout
        clearBearerToken()
    }
}
