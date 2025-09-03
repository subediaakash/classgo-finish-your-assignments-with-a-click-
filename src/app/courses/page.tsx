"use client";

import { useState, useEffect } from "react";
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
import { BookOpenIcon, RefreshCwIcon, ClipboardListIcon } from "lucide-react";
import { useAuthContext } from "@/components/auth/auth-provider";
import Link from "next/link";
import { redirect } from "next/navigation";

interface Course {
  id: string;
  name: string;
  description?: string;
  courseState?: string;
  alternateLink?: string;
}

export default function CoursesPage() {
  const { user, loading, signOut } = useAuthContext();
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    if (!user) {
      console.log("No user found");
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

  // Auto-load courses when user is available
  useEffect(() => {
    if (user && !coursesLoading && courses.length === 0 && !error) {
      fetchCourses();
    }
  }, [user]);

  const handleSignOut = () => {
    signOut();
    setCourses([]);
    setError(null);
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show sign-in prompt if not authenticated
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onSignOut={handleSignOut} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <Card className="border-border bg-card">
            <CardHeader className="text-center">
              <Badge variant="outline" className="mb-4 w-fit mx-auto border-border text-foreground">
                Dashboard
              </Badge>
              <CardTitle className="text-3xl md:text-4xl font-bold text-foreground">
                Welcome back, {user?.name?.split(" ")[0] || "Student"}!
              </CardTitle>
              <CardDescription className="text-muted-foreground text-lg">
                Manage your courses and stay up-to-date with assignments
              </CardDescription>
              <div className="flex justify-center gap-3 mt-4">
                <Button asChild variant="outline" className="border-border text-foreground hover:bg-accent">
                  <Link href="/assignments" className="flex items-center gap-2" prefetch>
                    <ClipboardListIcon className="w-4 h-4" />
                    View Assignments
                  </Link>
                </Button>
              </div>
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
