// https://classroom.googleapis.com/v1/courses/{courseId}/courseWork
'use client';

import { authClient } from "@/lib/auth-client";
import { useState, useEffect, use } from "react";
import { Session } from "../page";

interface CourseWorkType {
    id: string;
    title: string;
    description?: string;
    state: string;
    alternateLink: string;
    creationTime: string;
    updateTime: string;
    dueDate?: {
        year: number;
        month: number;
        day: number;
    };
    dueTime?: {
        hours: number;
        minutes: number;
    };
    maxPoints?: number;
    workType: string;
    submissionModificationMode: string;
    materials?: Array<{
        driveFile?: {
            id: string;
            title: string;
            alternateLink: string;
            thumbnailUrl?: string;
        };
        youtubeVideo?: {
            id: string;
            title: string;
            alternateLink: string;
            thumbnailUrl?: string;
        };
        link?: {
            url: string;
            title?: string;
            thumbnailUrl?: string;
        };
        form?: {
            formUrl: string;
            responseUrl: string;
            title: string;
            thumbnailUrl?: string;
        };
    }>;
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
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Assignments</h1>
                    <p className="text-gray-600">Course ID: {id}</p>
                </div>

                {assignmentsLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        <span className="ml-3 text-gray-600">Loading assignments...</span>
                    </div>
                ) : assignments && assignments.length > 0 ? (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Found {assignments.length} assignment{assignments.length > 1 ? 's' : ''}
                            </h2>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-1">
                            {assignments.map((assignment) => (
                                <div key={assignment.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                                    {/* Assignment Header */}
                                    <div className="p-6 border-b border-gray-100">
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                    {assignment.title}
                                                </h3>
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${assignment.state === 'PUBLISHED'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {assignment.state}
                                                    </span>
                                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {assignment.workType}
                                                    </span>
                                                    {assignment.maxPoints && (
                                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                            {assignment.maxPoints} points
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-4 sm:mt-0 sm:ml-6">
                                                <a
                                                    href={assignment.alternateLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                    Open in Classroom
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Assignment Content */}
                                    <div className="p-6">
                                        {/* Description */}
                                        {assignment.description && (
                                            <div className="mb-6">
                                                <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                                                <div className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                                                    {assignment.description}
                                                </div>
                                            </div>
                                        )}

                                        {/* Due Date */}
                                        {assignment.dueDate && (
                                            <div className="mb-6">
                                                <h4 className="text-sm font-medium text-gray-900 mb-2">Due Date</h4>
                                                <div className="flex items-center text-gray-700">
                                                    <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="font-medium">
                                                        {new Date(assignment.dueDate.year, assignment.dueDate.month - 1, assignment.dueDate.day).toLocaleDateString('en-US', {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                        {assignment.dueTime && assignment.dueTime.hours !== undefined && assignment.dueTime.minutes !== undefined && (
                                                            <span className="ml-2">
                                                                at {assignment.dueTime.hours.toString().padStart(2, '0')}:{assignment.dueTime.minutes.toString().padStart(2, '0')}
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Materials */}
                                        {assignment.materials && assignment.materials.length > 0 && (
                                            <div className="mb-6">
                                                <h4 className="text-sm font-medium text-gray-900 mb-3">Materials</h4>
                                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                    {assignment.materials.map((material, index) => (
                                                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                                            {material.driveFile && (
                                                                <a
                                                                    href={material.driveFile.alternateLink}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-start space-x-3 group"
                                                                >
                                                                    <div className="flex-shrink-0">
                                                                        <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                                                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                                                                        </svg>
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 truncate">
                                                                            {material.driveFile.title}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500">Google Drive File</p>
                                                                    </div>
                                                                </a>
                                                            )}

                                                            {material.youtubeVideo && (
                                                                <a
                                                                    href={material.youtubeVideo.alternateLink}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-start space-x-3 group"
                                                                >
                                                                    <div className="flex-shrink-0">
                                                                        <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                                                                            <path d="M23.498,6.186a3.016,3.016,0,0,0-2.122-2.136C19.505,3.545,12,3.545,12,3.545s-7.505,0-9.377.505A3.017,3.017,0,0,0,.502,6.186C0,8.07,0,12,0,12s0,3.93.502,5.814a3.016,3.016,0,0,0,2.122,2.136C4.495,20.455,12,20.455,12,20.455s7.505,0,9.377-.505a3.017,3.017,0,0,0,2.122-2.136C24,15.93,24,12,24,12S24,8.07,23.498,6.186ZM9.545,15.568V8.432L15.818,12Z" />
                                                                        </svg>
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-medium text-gray-900 group-hover:text-red-600 truncate">
                                                                            {material.youtubeVideo.title}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500">YouTube Video</p>
                                                                    </div>
                                                                </a>
                                                            )}

                                                            {material.link && (
                                                                <a
                                                                    href={material.link.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-start space-x-3 group"
                                                                >
                                                                    <div className="flex-shrink-0">
                                                                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                                        </svg>
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-medium text-gray-900 group-hover:text-green-600 truncate">
                                                                            {material.link.title || 'External Link'}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500 truncate">{material.link.url}</p>
                                                                    </div>
                                                                </a>
                                                            )}

                                                            {material.form && (
                                                                <a
                                                                    href={material.form.formUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-start space-x-3 group"
                                                                >
                                                                    <div className="flex-shrink-0">
                                                                        <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                                                                            <path d="M13,9H18.5L13,3.5V9M6,2H14L20,8V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V4C4,2.89 4.89,2 6,2M15,18V16H6V18H15M18,14V12H6V14H18Z" />
                                                                        </svg>
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-medium text-gray-900 group-hover:text-purple-600 truncate">
                                                                            {material.form.title}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500">Google Form</p>
                                                                    </div>
                                                                </a>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Metadata */}
                                        <div className="border-t border-gray-100 pt-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-500">
                                                <div>
                                                    <span className="font-medium">Created:</span> {new Date(assignment.creationTime).toLocaleDateString()}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Updated:</span> {new Date(assignment.updateTime).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments found</h3>
                        <p className="mt-1 text-sm text-gray-500">This course doesn&apos;t have any assignments yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
