/**
 * User interface
 */
export interface IUser {
    id: string;
    email: string;
    name: string;
    role?: string;
    avatar?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Login request payload
 */
export interface ILoginRequest {
    email: string;
    password: string;
}

/**
 * Login response with tokens and user info
 */
export interface IAuthResponse {
    accessToken: string;
    refreshToken?: string;
    user: IUser;
}

/**
 * API response wrapper
 */
export interface IApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: Record<string, string>;
}

/**
 * Login form errors
 */
export interface ILoginFormErrors {
    email?: string;
    password?: string;
    submit?: string;
}

/**
 * Login form values
 */
export interface ILoginFormValues {
    email: string;
    password: string;
}
