"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/ui/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon, ShieldIcon, CheckCircleIcon } from "lucide-react";

export default function ClassroomPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const requestGoogleClassRoomAccess = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            await authClient.linkSocial({
                provider: "google",
                scopes: [
                    "https://www.googleapis.com/auth/classroom.courses",
                    "https://www.googleapis.com/auth/classroom.rosters",
                    "https://www.googleapis.com/auth/classroom.coursework.students",
                    "https://www.googleapis.com/auth/classroom.coursework.me",
                    "https://www.googleapis.com/auth/classroom.announcements",
                    "https://www.googleapis.com/auth/classroom.topics",
                    "https://www.googleapis.com/auth/classroom.addons.student",
                    "https://www.googleapis.com/auth/classroom.guardianlinks.students"
                ],
            });
        } catch (err) {
            setError("Failed to connect to Google Classroom. Please try again.");
            console.error("Google Classroom connection error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            
            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-12">
                    <Badge variant="outline" className="mb-4">
                        Connect
                    </Badge>
                    <h1 className="text-4xl font-bold text-foreground mb-4">
                        Connect to Google Classroom
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Link your Google Classroom account to start automating your workflow and managing assignments efficiently with ClassGo.
                    </p>
                </div>

                {/* Connection Card */}
                <div className="max-w-md mx-auto mb-12">
                    <Card className="border-border bg-card">
                        <CardHeader className="text-center">
                            <div className="flex items-center justify-center mb-4">
                                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                                    <ShieldIcon className="w-8 h-8 text-primary-foreground" />
                                </div>
                            </div>
                            <CardTitle className="text-xl font-semibold text-foreground">
                                Secure Connection
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                                We&apos;ll securely connect to your Google Classroom account with the necessary permissions.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {error && (
                                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                                    <p className="text-destructive text-sm">{error}</p>
                                </div>
                            )}

                            <Button
                                onClick={requestGoogleClassRoomAccess}
                                disabled={isLoading}
                                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 border-0 h-12"
                            >
                                {isLoading ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                                        <span>Connecting...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                            />
                                        </svg>
                                        <span>Connect Google Classroom</span>
                                        <ArrowRightIcon className="w-4 h-4" />
                                    </div>
                                )}
                            </Button>

                            <div className="text-center">
                                <Link
                                    href="/courses"
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Already connected? View your courses →
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Permissions Info */}
                <div className="max-w-4xl mx-auto">
                    <h3 className="text-2xl font-bold text-foreground mb-8 text-center">
                        What we&apos;ll access:
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardContent className="flex items-start space-x-3 p-6">
                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <CheckCircleIcon className="w-4 h-4 text-primary-foreground" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground">Courses</h4>
                                    <p className="text-sm text-muted-foreground">View and manage your classroom courses</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="flex items-start space-x-3 p-6">
                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <CheckCircleIcon className="w-4 h-4 text-primary-foreground" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground">Assignments</h4>
                                    <p className="text-sm text-muted-foreground">Create and manage coursework</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="flex items-start space-x-3 p-6">
                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <CheckCircleIcon className="w-4 h-4 text-primary-foreground" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground">Rosters</h4>
                                    <p className="text-sm text-muted-foreground">Access student information</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="flex items-start space-x-3 p-6">
                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <CheckCircleIcon className="w-4 h-4 text-primary-foreground" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground">Announcements</h4>
                                    <p className="text-sm text-muted-foreground">Post and manage announcements</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
