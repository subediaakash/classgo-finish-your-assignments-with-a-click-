'use client'
import React, { useState } from "react";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const signUpSchema = z
    .object({
        name: z.string().min(1, "Name is required"),
        email: z.email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export default function SignUpPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            signUpSchema.parse(formData);
            const { data, error } = await authClient.signUp.email({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                callbackURL: "/",
            }, {
                onSuccess: () => {
                    router.push("/verification-reminder");
                }
            });

            if (error) {
                throw new Error(error.message);
            }

            console.log("Form submitted", data);
            setErrors({});
        } catch (err) {
            if (err instanceof z.ZodError) {
                const fieldErrors: Record<string, string> = {};
                err.issues.forEach((issue) => {
                    if (issue.path[0]) {
                        fieldErrors[issue.path[0] as string] = issue.message;
                    }
                });
                setErrors(fieldErrors);
            }
        }
    };

    const handleGoogleSignUp = async () => {
        const data = await authClient.signIn.social({
            provider: "google"
        })
        console.log("Google Sign Up initiated", data);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Sign Up</h1>

                {/* Sign-Up Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        {errors.confirmPassword && <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Sign Up
                    </button>
                </form>

                <div className="mt-6 flex items-center justify-center">
                    <span className="text-sm text-gray-500">or</span>
                </div>

                {/* Google Sign-Up Button */}
                <button
                    onClick={handleGoogleSignUp}
                    className="mt-4 w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center justify-center"
                >
                    <svg
                        className="w-5 h-5 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 48 48"
                        fill="none"
                    >
                        <path
                            fill="#EA4335"
                            d="M24 9.5c3.14 0 5.97 1.15 8.2 3.04l6.1-6.1C34.6 3.02 29.6 1 24 1 14.8 1 7.1 6.48 3.9 14.02l7.5 5.8C13.1 14.02 18.1 9.5 24 9.5z"
                        />
                        <path
                            fill="#34A853"
                            d="M46.5 24c0-1.6-.2-3.2-.5-4.7H24v9.4h12.7c-1.1 3.2-3.2 5.9-6 7.7l7.5 5.8c4.4-4.1 7.3-10.2 7.3-17.2z"
                        />
                        <path
                            fill="#4A90E2"
                            d="M10.4 28.2c-1.1-3.2-1.1-6.8 0-10l-7.5-5.8C.3 16.5 0 20.2 0 24c0 3.8.3 7.5 2.9 10.6l7.5-5.8z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M24 46c5.6 0 10.3-1.8 13.7-4.8l-7.5-5.8c-2.1 1.4-4.8 2.3-7.7 2.3-5.9 0-10.9-4.5-12.6-10.4l-7.5 5.8C7.1 41.5 14.8 46 24 46z"
                        />
                    </svg>
                    Sign up with Google
                </button>
            </div>
        </div>
    );
}