"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Header } from "@/components/ui/header";
import { CourseCard } from "@/components/ui/course-card";
import { CourseCardSkeleton } from "@/components/ui/skeleton";
import {
  NoCoursesEmptyState,
  ErrorEmptyState,
} from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpenIcon, RefreshCwIcon, ArrowRightIcon } from "lucide-react";

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

export interface Session {
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

export default function CoursesPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const fetchCourses = async () => {
    if (!session) {
      console.log("No session found");
      return;
    }

    setCoursesLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/classroom", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Error fetching courses:", data);
        const errorMessage =
          typeof data.details === "string"
            ? data.details.replace(/\\n/g, "\n").replace(/\\/g, "")
            : data.message || "Failed to fetch courses";
        setError(errorMessage);
        return;
      }

      console.log("Courses:", data);
      setCourses(data.courses || []);
    } catch (error) {
      console.error("Error:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setCoursesLoading(false);
    }
  };

  // Auto-load courses when session is available
  useEffect(() => {
    if (session && !coursesLoading && courses.length === 0 && !error) {
      fetchCourses();
    }
  }, [session]);

  const handleSignOut = () => {
    setSession(null);
    setCourses([]);
    setError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your session...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpenIcon className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Welcome to ClassGo
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
              Sign in with your Google account to access your courses and assignments.
            </p>
            <Button
              onClick={() => authClient.signIn.social({ provider: "google" })}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={session.user} onSignOut={handleSignOut} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <Card className="border-border bg-card">
            <CardHeader className="text-center">
              <Badge variant="outline" className="mb-4 w-fit mx-auto">
                Dashboard
              </Badge>
              <CardTitle className="text-3xl md:text-4xl font-bold text-foreground">
                Welcome back, {session.user.name?.split(" ")[0] || "Student"}!
              </CardTitle>
              <CardDescription className="text-muted-foreground text-lg">
                Manage your courses and stay up-to-date with assignments
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Loading State */}
        {coursesLoading && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Your Courses
              </h2>
              <p className="text-muted-foreground">
                Loading courses from Google Classroom...
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <CourseCardSkeleton key={index} />
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-border bg-card">
            <CardContent className="p-8">
              <ErrorEmptyState onRetry={fetchCourses} />
            </CardContent>
          </Card>
        )}

        {/* Courses Grid */}
        {!coursesLoading && !error && (
          <div>
            {courses.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      Your Courses
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      {courses.length} course{courses.length !== 1 ? "s" : ""}{" "}
                      found
                    </p>
                  </div>
                  <Button
                    onClick={fetchCourses}
                    variant="outline"
                    size="sm"
                    disabled={coursesLoading}
                    className="border-border text-foreground hover:bg-accent"
                  >
                    <RefreshCwIcon className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              </>
            ) : (
              <Card className="border-border bg-card">
                <CardContent className="p-8">
                  <NoCoursesEmptyState onGetCourses={fetchCourses} />
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
