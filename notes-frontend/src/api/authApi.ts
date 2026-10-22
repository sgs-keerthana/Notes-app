const API_URL = import.meta.env.VITE_API_URL;

export interface AuthUser {
    id: string;
    email: string;
}

export interface AuthResponse {
    message: string;
    token: string;
    tokenType: string;
    expiresIn: number;
    user: AuthUser;
}

export interface RegisterResponse {
    message: string;
    user: AuthUser;
}

export interface AuthCredentials {
    email: string;
    password: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(
            data?.message || `Request failed with status ${response.status}`
        );
    }
    return data as T;
}

export async function registerUser(  credentials: AuthCredentials): Promise<RegisterResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
    });
    return handleResponse<RegisterResponse>(response);
}

export async function loginUser( credentials: AuthCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
    });

    return handleResponse<AuthResponse>(response);
}