"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Header } from "@/components/ui/header";
import { AssignmentCard } from "@/components/ui/assignment-card";
import { AssignmentFilters } from "@/components/ui/assignment-filters";
import { Button } from "@/components/ui/button";
import { BookOpenIcon, RefreshCwIcon } from "lucide-react";
import { useAuthContext } from "@/components/auth/auth-provider";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";

interface Assignment {
  id: string;
  title: string;
  description?: string;
  dueDate?: {
    year: number;
    month: number;
    day: number;
  };
  courseName: string;
  status: string;
  alternateLink: string;
  creationTime: string;
  updateTime: string;
  workType: string;
}

export default function AssignmentsPage() {
  const { user, loading, signOut } = useAuthContext();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: "all",
    course: "all",
    dueDate: "all",
  });
  const [sortBy, setSortBy] = useState<"dueDate" | "title" | "created" | "updated">("dueDate");
  const [filterBy, setFilterBy] = useState<"all" | "published" | "draft" | "assignment" | "shortAnswerQuestion" | "multipleChoiceQuestion">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const fetchAssignments = useCallback(async () => {
    if (!user) return;

    setAssignmentsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/assignments");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch assignments");
      }

      const data = await response.json();
      setAssignments(data.assignments || []);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch assignments");
    } finally {
      setAssignmentsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      // Ensure immediate loading state when user becomes available
      setAssignmentsLoading(true);
      fetchAssignments();
    } else {
      setAssignmentsLoading(false);
    }
  }, [user, fetchAssignments]);

  const handleSignOut = () => {
    signOut();
    setAssignments([]);
    setError(null);
  };

  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      if (filters.status !== "all" && assignment.status !== filters.status) return false;
      if (filters.course !== "all" && assignment.courseName !== filters.course) return false;
      if (filters.dueDate !== "all") {
        const now = new Date();
        const dueDate = assignment.dueDate ? new Date(assignment.dueDate.year, assignment.dueDate.month - 1, assignment.dueDate.day) : null;
        
        if (filters.dueDate === "overdue" && dueDate && dueDate < now) return true;
        if (filters.dueDate === "due-today" && dueDate) {
          const today = new Date();
          return dueDate.toDateString() === today.toDateString();
        }
        if (filters.dueDate === "due-week" && dueDate) {
          const weekFromNow = new Date();
          weekFromNow.setDate(weekFromNow.getDate() + 7);
          return dueDate <= weekFromNow && dueDate >= now;
        }
        if (filters.dueDate === "no-due-date" && !dueDate) return true;
        return false;
      }
      return true;
    });
  }, [assignments, filters]);

  const uniqueCourses = useMemo(() => 
    Array.from(new Set(assignments.map((a) => a.courseName))), 
    [assignments]
  );

  const handleStatusChange = (status: string) => {
    setFilters(prev => ({ ...prev, status }));
  };

  const handleCourseChange = (course: string) => {
    setFilters(prev => ({ ...prev, course }));
  };

  const handleDueDateChange = (dueDate: string) => {
    setFilters(prev => ({ ...prev, dueDate }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header onSignOut={handleSignOut} />
        <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onSignOut={handleSignOut} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <Card className="border-border bg-card mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold text-foreground mb-4">
              {user ? `Welcome back, ${user.name}!` : "Welcome to ClassGo"}
            </CardTitle>
            <CardDescription className="text-xl text-muted-foreground">
              {user ? "Manage and track all your assignments in one place" : "Your classroom dashboard"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={fetchAssignments}
                disabled={assignmentsLoading}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {assignmentsLoading ? (
                  <RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCwIcon className="w-4 h-4 mr-2" />
                )}
                Refresh Assignments
              </Button>
              <Button asChild variant="outline" className="border-border text-foreground hover:bg-accent">
                <Link href="/courses">
                  <BookOpenIcon className="w-4 h-4 mr-2" />
                  View Courses
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-border bg-card">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {assignments.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Assignments</div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {assignments.filter(a => a.status === "TURNED_IN").length}
              </div>
              <div className="text-sm text-muted-foreground">Turned In</div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                {assignments.filter(a => a.dueDate && new Date(a.dueDate.year, a.dueDate.month - 1, a.dueDate.day) < new Date()).length}
              </div>
              <div className="text-sm text-muted-foreground">Overdue</div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {uniqueCourses.length}
              </div>
              <div className="text-sm text-muted-foreground">Active Courses</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-border bg-card mb-6">
          <CardContent className="p-6">
            <AssignmentFilters
              onSortChange={setSortBy}
              onFilterChange={setFilterBy}
              onViewChange={setViewMode}
              currentSort={sortBy}
              currentFilter={filterBy}
              currentView={viewMode}
              assignmentCount={filteredAssignments.length}
              // Global view filters
              showCourseFilter={true}
              courses={uniqueCourses}
              selectedCourse={filters.course}
              onCourseChange={handleCourseChange}
              showStatusFilter={true}
              selectedStatus={filters.status}
              onStatusChange={handleStatusChange}
              showDueDateFilter={true}
              selectedDueDate={filters.dueDate}
              onDueDateChange={handleDueDateChange}
            />
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredAssignments.length} of {assignments.length} assignments
          </p>
        </div>

        {/* Loading State */}
        {assignmentsLoading && (
          <div className="space-y-4">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="border-border bg-card">
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                      <div className="flex gap-2">
                        <div className="h-8 bg-muted rounded w-20"></div>
                        <div className="h-8 bg-muted rounded w-20"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-border bg-card">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-destructive/10 rounded-full">
                <svg
                  className="w-6 h-6 text-destructive"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Error Loading Assignments
              </h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button
                onClick={fetchAssignments}
                variant="outline"
                className="border-border text-foreground hover:bg-accent"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Assignments Grid/List */}
        {!assignmentsLoading && filteredAssignments.length > 0 && (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {filteredAssignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={{
                  ...assignment,
                  state: assignment.status,
                  workType: "ASSIGNMENT",
                  submissionModificationMode: "MODIFIABLE",
                  materials: [],
                }}
                view={viewMode}
                showCourseInfo={true}
                courseName={assignment.courseName}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!assignmentsLoading && filteredAssignments.length === 0 && !error && (
          <Card className="border-border bg-card">
            <CardContent className="p-8 text-center">
              <div className="flex flex-col items-center">
                <BookOpenIcon className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">
                  No assignments found
                </p>
                <p className="text-muted-foreground mb-6">
                  {assignments.length === 0
                    ? "You don't have any assignments yet. Try refreshing or check your courses."
                    : "No assignments match your current filters."}
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={fetchAssignments}
                    variant="outline"
                    className="border-border text-foreground hover:bg-accent"
                  >
                    <RefreshCwIcon className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button asChild variant="outline" className="border-border text-foreground hover:bg-accent">
                    <Link href="/courses">
                      <BookOpenIcon className="w-4 h-4 mr-2" />
                      View Courses
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
