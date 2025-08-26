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
      // Try to get course list to find the course name
      const res = await fetch("/api/classroom", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        const courses = data.courses || [];
        const currentCourse = courses.find(
          (course: Course) => course.id === id
        );

        if (currentCourse) {
          setCourse(currentCourse);
        } else {
          // Fallback if course not found in list
          setCourse({
            id: id,
            name: `Course ${id}`,
            courseState: "ACTIVE",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching course info:", error);
      // Set fallback course info
      setCourse({
        id: id,
        name: `Course ${id}`,
        courseState: "ACTIVE",
      });
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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-32 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-6">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <AssignmentCardSkeleton key={i} />
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Please Sign In
            </h2>
            <p className="text-gray-600 mb-6">
              You need to sign in to view course assignments.
            </p>
            <button
              onClick={() => authClient.signIn.social({ provider: "google" })}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Sign in with Google
            </button>
          </div>
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
    <div className="min-h-screen bg-gray-50">
      <Header user={session.user} onSignOut={handleSignOut} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <ErrorEmptyState onRetry={fetchAssignments} />
        ) : assignmentsLoading ? (
          <div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="animate-pulse flex space-x-4">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="flex-1"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            <div className="space-y-6">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <AssignmentCardSkeleton key={i} />
                ))}
            </div>
          </div>
        ) : assignments && assignments.length > 0 ? (
          <div>
            <AssignmentFilters
              onSortChange={setSortBy}
              onFilterChange={setFilterBy}
              onViewChange={setViewMode}
              currentSort={sortBy}
              currentFilter={filterBy}
              currentView={viewMode}
              assignmentCount={filteredAndSortedAssignments.length}
            />

            {filteredAndSortedAssignments.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3"
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
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No assignments match your filters
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filter criteria to see more assignments.
                </p>
                <button
                  onClick={() => setFilterBy("all")}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        ) : (
          <NoAssignmentsEmptyState />
        )}
      </div>
    </div>
  );
}
