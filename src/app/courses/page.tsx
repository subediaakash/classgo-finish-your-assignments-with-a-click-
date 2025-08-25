"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

interface User {
    id: string;
    name?: string;
    email: string;
}

interface SessionData {
    id: string;
    userId: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
}

interface Session {
    user: User;
    session: SessionData;
}

interface Course {
    id: string;
    name: string;
    description?: string;
    courseState?: string;
    alternateLink?: string;
}

export default function Dashboard() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState<Course[]>([]);

    useEffect(() => {
        // Get session on component mount
        const getSession = async () => {
            try {
                const sessionData = await authClient.getSession();
                if (sessionData?.data) {
                    setSession(sessionData.data);
                }
            } catch (error) {
                console.error("Error getting session:", error);
            } finally {
                setLoading(false);
            }
        };

        getSession();
    }, []);

    async function fetchCourses() {
        if (!session) {
            console.log("No session found");
            return;
        }

        try {
            // Use your backend API route instead of direct Google API calls
            const res = await fetch("/api/classroom", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await res.json();

            if (!res.ok) {
                console.error("Error fetching courses:", data);
                // Show more detailed error with line breaks
                const errorMessage = typeof data.details === 'string'
                    ? data.details.replace(/\\n/g, '\n').replace(/\\/g, '')
                    : JSON.stringify(data, null, 2);
                console.error("Detailed error:", errorMessage);
                return;
            }

            console.log("Courses:", data);
            setCourses(data.courses || []);
        } catch (error) {
            console.error("Error:", error);
        }
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!session) {
        return (
            <div>
                <p>Please sign in to view your courses</p>
                <button
                    onClick={() => authClient.signIn.social({ provider: "google" })}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Sign in with Google
                </button>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Welcome, {session.user.name || session.user.email}</h1>
            <button
                onClick={fetchCourses}
                className="bg-green-500 text-white px-4 py-2 rounded mb-4"
            >
                Get My Classes
            </button>

            {courses.length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold mb-2">Your Courses:</h2>
                    <ul className="space-y-2">
                        {courses.map((course: Course) => (
                            <li key={course.id} className="bg-gray-100 p-3 rounded">
                                <h3 className="font-medium">{course.name}</h3>
                                <p className="text-gray-600">{course.description}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
