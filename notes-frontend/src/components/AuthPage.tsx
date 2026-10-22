import { useState, type FormEvent } from "react";
import {loginUser,registerUser, type AuthResponse,} from "../api/authApi";
interface AuthPageProps { onLogin: (response: AuthResponse) => void;}

export default function AuthPage({ onLogin }: AuthPageProps) {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMessage("");
        setError("");
        if (!email.trim() || !password) {
            setError("Please enter your email and password.");
            return;
        }

        if (isRegistering && password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        if (isRegistering && password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);

        try {
            const credentials = { email: email.trim(), password, };
            if (isRegistering) {
                const response = await registerUser(credentials);
                setMessage( response.message || "Registration successful. Please log in.");
                setIsRegistering(false);
                setPassword("");
                setConfirmPassword("");
            } else {
                const response = await loginUser(credentials);
                onLogin(response);
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
                <h1 className="mb-2 text-center text-2xl font-bold text-gray-800">
                    Notes App
                </h1>
                <p className="mb-6 text-center text-gray-600">
                    {isRegistering
                        ? "Create your account"
                        : "Log in to your account"}
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-1 block text-sm font-medium text-gray-700"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="Enter your email"
                            autoComplete="email"
                            required
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="password"
                            className="mb-1 block text-sm font-medium text-gray-700"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Enter your password"
                            autoComplete={
                                isRegistering ? "new-password" : "current-password"
                            }
                            required
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                        />
                    </div>
                    {isRegistering && (
                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Confirm Password
                            </label>

                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(event) =>
                                    setConfirmPassword(event.target.value)
                                }
                                placeholder="Confirm your password"
                                autoComplete="new-password"
                                required
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                            />
                        </div>
                    )}

                    {message && (
                        <p
                            role="status"
                            className="rounded-lg bg-green-50 p-3 text-sm text-green-700"
                        >
                            {message}
                        </p>
                    )}

                    {error && (
                        <p
                            role="alert"
                            className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
                        >
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isLoading
                            ? "Please wait..."
                            : isRegistering
                              ? "Register"
                              : "Login"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    {isRegistering
                        ? "Already have an account?"
                        : "Don't have an account?"}

                    <button
                        type="button"
                        onClick={() => {
                            setIsRegistering(!isRegistering);
                            setPassword("");
                            setConfirmPassword("");
                            setMessage("");
                            setError("");
                        }}
                        className="ml-1 font-medium text-blue-600 hover:underline"
                    >
                        {isRegistering ? "Login" : "Register"}
                    </button>
                </p>
            </div>
        </div>
    );
}