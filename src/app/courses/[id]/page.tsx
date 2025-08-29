"use client";

import { authClient } from "@/lib/auth-client";
import { useState, useEffect, use, useMemo } from "react";
import { Session } from "../page";
import { Header } from "@/components/ui/header";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { CourseHeader } from "@/components/ui/course-header";
import {
  AssignmentFilters,
  SortOption,
  FilterOption,
} from "@/components/ui/assignment-filters";
import { AssignmentCard } from "@/components/ui/assignment-card";
import { AssignmentCardSkeleton } from "@/components/ui/skeleton";
import {
  NoAssignmentsEmptyState,
  ErrorEmptyState,
} from "@/components/ui/empty-state";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpenIcon } from "lucide-react";

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

interface Course {
  id: string;
  name: string;
  description?: string;
  courseState?: string;
  alternateLink?: string;
}

export default function CoursePage({ params }: PageProps) {
  const { id } = use(params);
  const [assignments, setAssignments] = useState<CourseWorkType[] | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter and sort states
  const [sortBy, setSortBy] = useState<SortOption>("dueDate");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

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
        setError("Failed to load session");
      } finally {
        setLoading(false);
      }
    };

    getSession();
  }, []);

  const fetchCourseInfo = async () => {
    if (!session) return;

    try {
      const res = await fetch("/api/classroom", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (res.ok && data.courses) {
        const currentCourse = data.courses.find(
          (course: Course) => course.id === id
        );
        setCourse(currentCourse || null);
      }
    } catch (error) {
      console.error("Error fetching course info:", error);
    }
  };

  const fetchAssignments = async () => {
    if (!session) return;

    setAssignmentsLoading(true);
    setError(null);
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
        setError("Failed to load assignments");
        setAssignments(null);
        return;
      }

      console.log("Assignments data:", data);
      setAssignments(data.assignments || []);
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to load assignments");
      setAssignments(null);
    } finally {
      setAssignmentsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchCourseInfo();
      fetchAssignments();
    }
  }, [id, session]);

  // Filter and sort assignments
  const filteredAndSortedAssignments = useMemo(() => {
    if (!assignments) return [];

    let filtered = assignments;

    // Apply filters
    if (filterBy !== "all") {
      filtered = assignments.filter((assignment) => {
        switch (filterBy) {
          case "published":
            return assignment.state === "PUBLISHED";
          case "draft":
            return assignment.state === "DRAFT";
          case "assignment":
            return assignment.workType === "ASSIGNMENT";
          case "shortAnswerQuestion":
            return assignment.workType === "SHORT_ANSWER_QUESTION";
          case "multipleChoiceQuestion":
            return assignment.workType === "MULTIPLE_CHOICE_QUESTION";
          default:
            return true;
        }
      });
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "created":
          return (
            new Date(b.creationTime).getTime() -
            new Date(a.creationTime).getTime()
          );
        case "updated":
          return (
            new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime()
          );
        case "dueDate":
        default:
          // Sort by due date, with assignments without due dates at the end
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;

          const dateA = new Date(
            a.dueDate.year,
            a.dueDate.month - 1,
            a.dueDate.day
          );
          const dateB = new Date(
            b.dueDate.year,
            b.dueDate.month - 1,
            b.dueDate.day
          );
          return dateA.getTime() - dateB.getTime();
      }
    });

    return sorted;
  }, [assignments, sortBy, filterBy]);

  const handleSignOut = () => {
    setSession(null);
    setAssignments(null);
    setCourse(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Loading skeleton for breadcrumb */}
          <div className="animate-pulse mb-8">
            <div className="h-6 bg-muted rounded w-64 mb-4"></div>
          </div>
          
          {/* Loading skeleton for course header */}
          <Card className="border-border bg-card overflow-hidden mb-8">
            <div className="h-32 bg-black relative">
              <div className="absolute bottom-4 left-6 right-6">
                <div className="flex items-end justify-between">
                  <div className="animate-pulse">
                    <div className="h-8 bg-white/20 rounded w-64 mb-2"></div>
                    <div className="h-4 bg-white/20 rounded w-32"></div>
                  </div>
                  <div className="animate-pulse">
                    <div className="h-9 bg-white/20 rounded w-24"></div>
                  </div>
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start space-x-3">
                      <div className="w-10 h-10 bg-muted rounded-lg"></div>
                      <div className="animate-pulse">
                        <div className="h-8 bg-muted rounded w-12 mb-1"></div>
                        <div className="h-4 bg-muted rounded w-20"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Loading skeleton for assignments */}
          <div className="space-y-6">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <AssignmentCardSkeleton key={i} />
              ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="border-border bg-card">
            <CardContent className="p-8">
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpenIcon className="w-10 h-10 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground mb-4">
                  Please Sign In
                </CardTitle>
                <p className="text-muted-foreground mb-6">
                  You need to sign in to view course assignments.
                </p>
                <Button
                  onClick={() => authClient.signIn.social({ provider: "google" })}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Sign in with Google
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Courses", href: "/courses" },
    { label: course?.name || `Course ${id}`, current: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header user={session.user} onSignOut={handleSignOut} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={breadcrumbItems} />

        <CourseHeader
          courseId={id}
          courseName={course?.name || "Course Assignments"}
          assignmentCount={assignments?.length || 0}
          onRefresh={() => {
            fetchCourseInfo();
            fetchAssignments();
          }}
          isLoading={assignmentsLoading}
        />

        {error ? (
          <Card className="border-border bg-card">
            <CardContent className="p-8">
              <ErrorEmptyState onRetry={fetchAssignments} />
            </CardContent>
          </Card>
        ) : assignmentsLoading ? (
          <div>
            {/* Loading skeleton for filters */}
            <Card className="border-border bg-card p-4 mb-6">
              <div className="animate-pulse flex flex-wrap gap-4">
                <div className="h-9 bg-muted rounded w-24"></div>
                <div className="h-9 bg-muted rounded w-32"></div>
                <div className="h-9 bg-muted rounded w-28"></div>
                <div className="flex-1"></div>
                <div className="h-9 bg-muted rounded w-20"></div>
              </div>
            </Card>
            
            {/* Loading skeleton for assignments */}
            <div className="space-y-6">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <AssignmentCardSkeleton key={i} />
                ))}
            </div>
          </div>
        ) : (
          <>
            {filteredAndSortedAssignments.length > 0 ? (
              <>
                <AssignmentFilters
                  onSortChange={setSortBy}
                  onFilterChange={setFilterBy}
                  onViewChange={setViewMode}
                  currentSort={sortBy}
                  currentFilter={filterBy}
                  currentView={viewMode}
                  assignmentCount={filteredAndSortedAssignments.length}
                />

                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                      : "space-y-6"
                  }
                >
                  {filteredAndSortedAssignments.map((assignment) => (
                    <AssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      courseId={id}
                      view={viewMode}
                    />
                  ))}
                </div>
              </>
            ) : (
              <Card className="border-border bg-card">
                <CardContent className="p-8">
                  <NoAssignmentsEmptyState />
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
