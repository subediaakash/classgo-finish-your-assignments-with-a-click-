// https://classroom.googleapis.com/v1/courses/{courseId}/courseWork
'use client';

import { authClient } from "@/lib/auth-client";
import { useState, useEffect, use } from "react";
import { Session } from "../page";

interface CourseWorkType {
    id: string;
    title: string;
}

interface PageProps {
    params: Promise<{ id: string }>;
}
export default function CoursePage({ params }: PageProps) {
    const { id } = use(params);
    const [assignments, setAssignments] = useState<CourseWorkType[] | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [assignmentsLoading, setAssignmentsLoading] = useState(false);

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

    useEffect(() => {
        async function fetchAssignments() {
            if (!session) return;

            setAssignmentsLoading(true);
            try {
                const res = await fetch(`/api/classroom/${id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                const data = await res.json();

                if (!res.ok) {
                    console.error("Error fetching assignments:", data);
                    // Show more detailed error with line breaks
                    const errorMessage = typeof data.details === 'string'
                        ? data.details.replace(/\\n/g, '\n').replace(/\\/g, '')
                        : JSON.stringify(data, null, 2);
                    console.error("Detailed error:", errorMessage);
                    setAssignments(null);
                    return;
                }

                console.log("Assignments data:", data);
                setAssignments(data.assignments || []);
            } catch (error) {
                console.error("Error:", error);
                setAssignments(null);
            } finally {
                setAssignmentsLoading(false);
            }
        }

        fetchAssignments();
    }, [id, session]);




    if (loading) {
        return <div>Loading session...</div>;
    }

    if (!session) {
        return (
            <div>
                <p>Please sign in to view assignments</p>
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
            <h1 className="text-2xl font-bold mb-4">Course Work for Course: {id}</h1>

            {assignmentsLoading ? (
                <div>Loading assignments...</div>
            ) : assignments && assignments.length > 0 ? (
                <div>
                    <h2 className="text-xl font-semibold mb-4">Assignments ({assignments.length})</h2>
                    <ul className="space-y-3">
                        {assignments.map((work) => (
                            <li key={work.id} className="bg-gray-100 p-4 rounded-lg">
                                <h3 className="font-medium text-lg">{work.title}</h3>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p className="text-gray-600">No assignments found for this course.</p>
            )}
        </div>
    );
}
