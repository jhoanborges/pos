import axios, { AxiosInstance } from "axios";
import { getSession } from "next-auth/react";

// Create the axios instance
export const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost",
  headers: {
    "Content-Type": "application/json",
  },
});

// Initialize axios headers with token from localStorage if available
if (typeof window !== "undefined") {
  const token = localStorage.getItem("access_token");
  if (token) {
    console.log("Initializing axios with token from localStorage");
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * Register request interface
 */
export interface RegisterRequest {
  name: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
}

/**
 * Register response interface
 */
export interface RegisterResponse {
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

/**
 * Response from the forgot password API
 */
export interface ForgotPasswordResponse {
  message: string;
  temp_password?: string;
  token?: string;
  reset_url?: string;
}

/**
 * API success response format
 */
export interface ApiSuccessResponse<T> {
  status: number;
  message: string;
  data: T;
}

/**
 * API error response format
 */
export interface ApiErrorResponse {
  errors: {
    status: number;
    title: string;
    detail: string;
  }[];
}

/**
 * Sends a password reset email to the specified email address
 *
 * @param email The email address to send the reset link to
 * @returns A promise that resolves with the response from the server
 * @throws AuthError if the request fails
 */
/**
 * Reset password request interface
 */
export interface ResetPasswordRequest {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

/**
 * Reset password response interface
 */
export interface ResetPasswordResponse {
  message: string;
}

/**
 * Token verification response interface
 */
export interface VerifyTokenResponse {
  valid: boolean;
  message: string;
  expires_at?: string;
}

/**
 * Resets a user's password using the token sent to their email
 *
 * @param data The reset password data including email, token, password and password confirmation
 * @returns A promise that resolves with the response from the server
 * @throws AuthError if the request fails
 */
/**
 * Verifies if a password reset token is valid
 *
 * @param email The email address associated with the token
 * @param token The token to verify
 * @returns A promise that resolves with the response from the server
 * @throws AuthError if the request fails
 */
export async function verifyResetToken(
  email: string,
  token: string
): Promise<VerifyTokenResponse> {
  try {
    console.log("Verifying reset token for", email);

    // Check if API URL is properly configured
    if (!api.defaults.baseURL) {
      console.error("API base URL is not configured properly");
      throw new AuthError("API configuration error: Missing base URL");
    }

    // Make the API request to verify the token
    const response = await api.post<ApiSuccessResponse<VerifyTokenResponse>>(
      "/api/verify-reset-token",
      { email, token }
    );

    console.log("Token verification response", response.data);
    return response.data.data;
  } catch (error) {
    console.error("Error verifying token", error);

    if (axios.isAxiosError(error)) {
      // Handle custom error messages from the API
      const responseData = error.response?.data as ApiErrorResponse;

      if (
        responseData &&
        responseData.errors &&
        responseData.errors.length > 0
      ) {
        // Get the first error from the errors array
        const firstError = responseData.errors[0];
        return {
          valid: false,
          message: firstError.detail || "Token inválido o expirado",
        };
      } else if (error.response?.data) {
        // Fallback for older API format
        const oldFormatData = error.response.data;
        if (oldFormatData.message) {
          return {
            valid: false,
            message: oldFormatData.message || "Token inválido o expirado",
          };
        }
      }

      // Generic error handling
      return {
        valid: false,
        message: "Error al verificar el token",
      };
    }

    // Return invalid for other errors
    return {
      valid: false,
      message: "Error al verificar el token",
    };
  }
}

export async function resetPassword(
  data: ResetPasswordRequest
): Promise<ResetPasswordResponse> {
  try {
    console.log("Resetting password for", data.email);

    // Check if API URL is properly configured
    if (!api.defaults.baseURL) {
      console.error("API base URL is not configured properly");
      throw new AuthError("API configuration error: Missing base URL");
    }

    // Make the API request to reset the password
    const response = await api.post<ApiSuccessResponse<ResetPasswordResponse>>(
      "/api/reset-password",
      data
    );

    console.log("Password reset successfully");
    console.log("API response:", response.data);

    // Handle the response based on the new API format
    if (response.data && response.data.status === 200) {
      // If the response follows the new format
      return {
        message:
          response.data.message || "Contraseña restablecida correctamente",
      };
    } else {
      // Fallback for older API format
      return response.data.data || (response.data as any);
    }
  } catch (error) {
    console.error("Error resetting password", error);

    if (axios.isAxiosError(error)) {
      // Handle custom error messages from the API
      const responseData = error.response?.data as ApiErrorResponse;

      if (
        responseData &&
        responseData.errors &&
        responseData.errors.length > 0
      ) {
        // Get the first error from the errors array
        const firstError = responseData.errors[0];
        console.log("Error detail from API:", firstError);
        throw new AuthError(firstError.detail, { message: firstError.detail });
      } else if (error.response?.data) {
        // Fallback for older API format
        const oldFormatData = error.response.data;

        // Check if the response contains custom error data
        if (oldFormatData.message) {
          throw new AuthError(oldFormatData.message, oldFormatData);
        }

        // Handle specific status codes
        if (error.response?.status === 400) {
          throw new AuthError("Token inválido o expirado");
        }

        if (error.response?.status === 404) {
          throw new AuthError("Usuario no encontrado");
        }

        if (error.response?.status === 422 && oldFormatData.errors) {
          // Handle validation errors
          const errorMessages = Object.values(oldFormatData.errors).flat();
          if (errorMessages.length > 0) {
            throw new AuthError(errorMessages[0] as string);
          }
        }
      }

      // Generic error handling
      throw new AuthError("Error al restablecer la contraseña");
    }

    // Rethrow other errors
    throw error;
  }
}

export async function sendResetPasswordEmail(
  email: string
): Promise<ForgotPasswordResponse> {
  try {
    console.log("Sending reset password email to", email);

    // Check if API URL is properly configured
    if (!api.defaults.baseURL) {
      console.error("API base URL is not configured properly");
      throw new AuthError("API configuration error: Missing base URL");
    }

    // Make the API request to send the reset password email
    const response = await api.post<ApiSuccessResponse<ForgotPasswordResponse>>(
      "/api/forgot-password",
      { email }
    );

    console.log("Reset password email sent successfully");
    console.log("API response:", response.data);

    // Handle the response based on the new API format
    if (response.data && response.data.status === 200) {
      // If the response follows the new format
      const responseData = response.data.data || {};

      // Combine the message from the root response with the data
      const result: ForgotPasswordResponse = {
        message: response.data.message,
        token: responseData.token,
        reset_url: responseData.reset_url,
        temp_password: responseData.temp_password,
      };

      console.log("Processed response:", result);
      return result;
    } else {
      // Fallback for older API format
      return response.data.data || (response.data as any);
    }
  } catch (error) {
    console.error("Error sending reset password email", error);

    if (axios.isAxiosError(error)) {
      // Handle custom error messages from the API
      const responseData = error.response?.data as ApiErrorResponse;

      if (
        responseData &&
        responseData.errors &&
        responseData.errors.length > 0
      ) {
        // Get the first error from the errors array
        const firstError = responseData.errors[0];
        throw new AuthError(firstError.detail, {
          message: firstError.detail,
          status: firstError.status,
        });
      } else if (error.response?.data) {
        // Fallback for older API format
        const oldFormatData = error.response.data;
        if (oldFormatData.message) {
          throw new AuthError(oldFormatData.message, oldFormatData);
        }

        // Handle specific status codes
        if (error.response?.status === 404) {
          throw new AuthError(
            "No se encontró una cuenta con este correo electrónico"
          );
        }
      }

      // Default error message
      throw new AuthError(
        "Error al enviar el correo de restablecimiento de contraseña"
      );
    }

    // Rethrow other errors
    throw error;
  }
}

// Helper function to get token from client-side storage
const getClientToken = (): string | null => {
  if (typeof window === "undefined") {
    console.log("Running on server, cannot access localStorage");
    return null;
  }

  const token = localStorage.getItem("auth_token");
  console.log(
    "Retrieved token from localStorage:",
    token ? "token exists" : "no token found"
  );
  return token;
};

export async function getUserInfo(token?: string): Promise<UserInfo | null> {
  try {
    // Get token from parameter or client storage
    const authToken = token || getClientToken();

    // If no token is available, return null
    if (!authToken) {
      console.log("No authentication token found");
      return null;
    }

    const response = await api.get<UserInfo>("/api/me", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (response.data) {
      return {
        id: response.data.id,
        email: response.data.email,
        name: response.data.name,
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting user info:", error);
    return null;
  }
}

// Define a custom error type for authentication errors
export class AuthError extends Error {
  public customData?: {
    message?: string;
    reset_password_url?: string;
    blocked?: boolean;
    retry_after?: number | null;
    [key: string]: any;
  };

  constructor(message: string, customData?: any) {
    super(message);
    this.name = "AuthError";
    this.customData = customData;
  }
}

/**
 * Registers a new user
 *
 * @param data The registration data including name, lastname, email, password and password confirmation
 * @returns A promise that resolves with the response from the server
 * @throws AuthError if the request fails
 */
export async function registerUser(
  data: RegisterRequest
): Promise<RegisterResponse> {
  try {
    console.log("Registering user", data.email);

    // Check if API URL is properly configured
    if (!api.defaults.baseURL) {
      console.error("API base URL is not configured properly");
      throw new AuthError("API configuration error: Missing base URL");
    }

    // Make the API request to register the user
    const response = await api.post<ApiSuccessResponse<RegisterResponse>>(
      "/api/register",
      data
    );

    console.log("User registered successfully");
    return response.data.data;
  } catch (error) {
    console.error("Error registering user", error);

    if (axios.isAxiosError(error)) {
      // Handle custom error messages from the API
      const responseData = error.response?.data as ApiErrorResponse;

      if (
        responseData &&
        responseData.errors &&
        responseData.errors.length > 0
      ) {
        // Get the first error from the errors array
        const firstError = responseData.errors[0];
        throw new AuthError(firstError.detail, {
          message: firstError.detail,
          status: firstError.status,
        });
      } else if (error.response?.data) {
        // Fallback for older API format
        const oldFormatData = error.response.data;
        if (oldFormatData.message) {
          throw new AuthError(oldFormatData.message, oldFormatData);
        }

        // Handle validation errors
        if (error.response?.status === 422 && oldFormatData.errors) {
          // Extract the first validation error message
          const errorMessages = Object.values(oldFormatData.errors).flat();
          if (errorMessages.length > 0) {
            throw new AuthError(errorMessages[0] as string);
          }
        }

        // Handle specific status codes
        if (error.response?.status === 409) {
          throw new AuthError("El correo electrónico ya está registrado");
        }
      }

      // Default error message
      throw new AuthError("Error al registrar el usuario");
    }

    // Rethrow other errors
    throw error;
  }
}

export interface UserData {
  id: string;
  email: string;
  name?: string;
  username?: string;
  role: string;
  permissions: string[];
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * Logs out the current user from the server
 * @returns A promise that resolves when the logout is complete
 * @throws AuthError if the request fails
 */
export const logoutUser = async (): Promise<void> => {
  try {
    // Get tokens from storage and session
    const session = await getSession();
    const refreshToken = session?.refreshToken;
    const accessToken = session?.accessToken;
    const tokenType = session?.tokenType;
    console.log("Refresh token:", refreshToken);
    console.log("Access token:", accessToken);
    console.log("Token type:", tokenType);
    // Only make the request if we have a refresh token
    if (refreshToken) {
      await api.post(
        "/api/logout",
        {
          refresh_token: refreshToken,
        },
        {
          headers: {
            Authorization: `${tokenType} ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (error) {
    console.error("Logout error:", error);
    // Even if the server logout fails, we still want to clear the client-side state
  }
};

export async function getUserFromDb(
  email: string,
  password: string
): Promise<UserData | null> {
  try {
    console.log("Getting user from DB", email);

    // Check if API URL is properly configured
    if (!api.defaults.baseURL) {
      console.error("API base URL is not configured properly");
      throw new AuthError("API configuration error: Missing base URL");
    }

    // Make the API request to get the user
    const response = await api.post("/api/login", { email, password });

    if (response.data && response.data.access_token) {
      console.log("User authenticated successfully", response.data);

      // Return complete user data including tokens
      return {
        id: response.data.user?.id || email, // Fallback to email if no user ID
        email: email,
        name: response.data.user?.name || email.split("@")[0],
        username: response.data.user?.username || email.split("@")[0],
        role: response.data.role || "user",
        permissions: response.data.permissions || [],
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token || "",
        token_type: response.data.token_type || "Bearer",
        expires_in: response.data.expires_in || 3600, // Default 1 hour
      };
    }

    console.log("No user found or invalid credentials");
    return null;
  } catch (error) {
    console.error("Error getting user from DB", error);

    if (axios.isAxiosError(error)) {
      // Handle custom error messages from the API
      const responseData = error.response?.data as ApiErrorResponse;

      if (
        responseData &&
        responseData.errors &&
        responseData.errors.length > 0
      ) {
        // Get the first error from the errors array
        const firstError = responseData.errors[0];

        // Check if this is a blocked account error
        if (firstError.title === "Account Blocked") {
          throw new AuthError(firstError.detail, {
            blocked: true,
            message: firstError.detail,
            retry_after: firstError.status === 429 ? 30 : null, // Default to 30 minutes if status is 429
          });
        }

        // Handle other errors
        throw new AuthError(firstError.detail, {
          message: firstError.detail,
          attempts_left: firstError.status === 401 ? 2 : null, // Default to 2 attempts if status is 401
        });
      } else if (error.response?.data) {
        // Fallback for older API format
        const oldFormatData = error.response.data;

        // Check if the response contains information about blocked accounts
        if (oldFormatData.blocked) {
          throw new AuthError(
            oldFormatData.message || "Your account has been blocked.",
            {
              blocked: true,
              message: oldFormatData.message,
              reset_password_url: oldFormatData.reset_password_url,
              retry_after: oldFormatData.retry_after,
            }
          );
        }

        // Check if the response contains custom error data
        if (oldFormatData.message) {
          throw new AuthError(oldFormatData.message, {
            message: oldFormatData.message,
            error: oldFormatData.error,
            attempts_left: oldFormatData.attempts_left,
          });
        }

        // Handle specific status codes
        if (error.response?.status === 401) {
          throw new AuthError("Invalid credentials");
        }
      }

      // Default error message
      throw new AuthError("Error authenticating user");
    }

    // Rethrow other errors
    throw error;
  }
}
