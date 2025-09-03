"use client";

import { authClient } from "@/lib/auth-client";
import { useState, useEffect, use } from "react";
import Image from "next/image";
import { Header } from "@/components/ui/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftIcon,
  CalendarIcon,
  FileTextIcon,
  ExternalLinkIcon,
} from "lucide-react";
import Link from "next/link";
import type { jsPDF } from "jspdf";
import type { AssignmentPDFData } from "@/lib/pdf-utils";
import dynamic from "next/dynamic";

const AssignmentPreparer = dynamic(() => import("@/components/ui/assignment-preparer").then(mod => ({ default: mod.AssignmentPreparer })), {
  ssr: false,
  loading: () => (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="h-12 w-32 bg-muted animate-pulse rounded-lg"></div>
      </div>
    </div>
  ),
});

const GeneratedAssignmentDisplay = dynamic(() => import("@/components/ui/generated-assignment-display").then(mod => ({ default: mod.GeneratedAssignmentDisplay })), {
  ssr: false,
  loading: () => (
    <Card className="border-border bg-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </CardContent>
    </Card>
  ),
});

interface Session {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

interface Assignment {
  id: string;
  title: string;
  description?: string;
  state: string;
  maxPoints?: number;
  dueDate?: {
    year: number;
    month: number;
    day: number;
  };
  dueTime?: {
    hours: number;
    minutes: number;
  };
  materials?: Material[];
}

interface Material {
  driveFile?: {
    driveFile?: {
      id: string;
      title: string;
      alternateLink: string;
      thumbnailUrl?: string;
    };
    shareMode?: string;
  };
  youTubeVideo?: {
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
}

interface UserProfile {
  id: string;
  name: {
    givenName: string;
    familyName: string;
    fullName: string;
  };
  emailAddress: string;
  photoUrl?: string;
}

interface StudentSubmission {
  courseId: string;
  courseWorkId: string;
  id: string;
  userId: string;
  creationTime: string;
  updateTime: string;
  state: "CREATED" | "TURNED_IN" | "RETURNED" | "RECLAIMED_BY_STUDENT";
  late: boolean;
  draftGrade?: number;
  assignedGrade?: number;
  alternateLink: string;
  courseWorkType: string;
  userProfile?: UserProfile;
  assignmentSubmission?: {
    attachments?: Array<{
      driveFile?: {
        id: string;
        title: string;
        alternateLink: string;
        thumbnailUrl?: string;
      };
      youTubeVideo?: {
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
  };
}

interface AssignmentData {
  success: boolean;
  courseId: string;
  assignmentId: string;
  assignment: Assignment;
  submissions: StudentSubmission[];
  statistics: {
    totalSubmissions: number;
    submittedCount: number;
    draftCount: number;
    lateSubmissions: number;
    gradedCount: number;
  };
}

interface PageProps {
  params: Promise<{ id: string; assignmentId: string }>;
}

export default function AssignmentDetailsPage({ params }: PageProps) {
  const { id: courseId, assignmentId } = use(params);
  const [assignmentData, setAssignmentData] = useState<AssignmentData | null>(
    null
  );
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedAssignment, setGeneratedAssignment] = useState<{
    success: boolean;
    aiResponse: string;
    assignmentTitle: string;
    assignmentDescription?: string;
    materialsCount: number;
    courseId: string;
    assignmentId: string;
    pdfDoc: jsPDF;
    pdfData: AssignmentPDFData;
  } | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  console.log(
    "Component rendered with courseId:",
    courseId,
    "assignmentId:",
    assignmentId
  );

  useEffect(() => {
    const getSession = async () => {
      try {
        console.log("Fetching session...");
        const sessionData = await authClient.getSession();
        console.log("Session data received:", sessionData);
        if (sessionData?.data) {
          setSession(sessionData.data);
          console.log("Session set successfully");
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
    async function fetchAssignmentData() {
      if (!session) return;

      setDataLoading(true);
      try {
        const res = await fetch(
          `/api/classroom/${courseId}/assignments/${assignmentId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          console.error("Error fetching assignment data:", data);
          setError(
            `Failed to fetch assignment data: ${data.error || "Unknown error"}`
          );
          return;
        }

        console.log("Assignment data received:", data);
        console.log("Setting assignment data...");
        setAssignmentData(data);
        setError(null);
      } catch (error) {
        console.error("Error:", error);
        setError("Failed to fetch assignment data. Please try again.");
      } finally {
        setDataLoading(false);
      }
    }

    fetchAssignmentData();
  }, [courseId, assignmentId, session]);

  const getStateColor = (state: string) => {
    switch (state) {
      case "TURNED_IN":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "RETURNED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "CREATED":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "RECLAIMED_BY_STUDENT":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const renderSubmissionAttachments = (submission: StudentSubmission) => {
    const attachments = submission.assignmentSubmission?.attachments;

    if (!attachments || attachments.length === 0) {
      return (
        <div className="text-sm text-muted-foreground italic bg-muted/50 p-3 rounded-lg border border-border">
          <div className="flex items-center">
            <FileTextIcon className="w-4 h-4 mr-2" />
            No files attached - may contain text response or be incomplete
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {attachments.map((attachment, index) => (
          <div
            key={index}
            className="flex items-center space-x-2 p-2 bg-muted/50 rounded-lg border border-border"
          >
            {attachment.driveFile && (
              <>
                <svg
                  className="w-4 h-4 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <a
                    href={attachment.driveFile.alternateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {attachment.driveFile.title}
                  </a>
                  <div className="text-xs text-muted-foreground">
                    Google Drive File
                  </div>
                </div>
                {attachment.driveFile.thumbnailUrl && (
                  <Image
                    src={attachment.driveFile.thumbnailUrl}
                    alt="File thumbnail"
                    width={24}
                    height={24}
                    className="rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
              </>
            )}

            {attachment.youTubeVideo && (
              <>
                <svg
                  className="w-4 h-4 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm3.5 8.5l-5 3V7.5l5 3z" />
                </svg>
                <div className="flex-1">
                  <a
                    href={attachment.youTubeVideo.alternateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    {attachment.youTubeVideo.title}
                  </a>
                  <div className="text-xs text-muted-foreground">
                    YouTube Video
                  </div>
                </div>
                {attachment.youTubeVideo.thumbnailUrl && (
                  <Image
                    src={attachment.youTubeVideo.thumbnailUrl}
                    alt="Video thumbnail"
                    width={24}
                    height={24}
                    className="rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
              </>
            )}

            {attachment.link && (
              <>
                <svg
                  className="w-4 h-4 text-green-500"
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
                <div className="flex-1">
                  <a
                    href={attachment.link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                  >
                    {attachment.link.title || "Link"}
                  </a>
                  <div className="text-xs text-muted-foreground">Web Link</div>
                </div>
              </>
            )}

            {attachment.form && (
              <>
                <svg
                  className="w-4 h-4 text-purple-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <div className="flex-1">
                  <a
                    href={attachment.form.responseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                  >
                    {attachment.form.title}
                  </a>
                  <div className="text-xs text-muted-foreground">
                    Form Response
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderAssignmentMaterials = (materials?: Material[]) => {
    if (!materials || materials.length === 0) return null;

    return (
      <div className="space-y-2">
        {materials.map((material, index) => (
          <div
            key={index}
            className="flex items-center space-x-2 p-2 bg-muted/50 rounded-lg border border-border"
          >
            {material.driveFile?.driveFile && (
              <>
                <svg
                  className="w-4 h-4 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <a
                    href={material.driveFile.driveFile.alternateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {material.driveFile.driveFile.title}
                  </a>
                  <div className="text-xs text-muted-foreground">
                    Google Drive File
                  </div>
                </div>
                {material.driveFile.driveFile.thumbnailUrl && (
                  <Image
                    src={material.driveFile.driveFile.thumbnailUrl}
                    alt="File thumbnail"
                    width={24}
                    height={24}
                    className="rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
              </>
            )}

            {material.youTubeVideo && (
              <>
                <svg
                  className="w-4 h-4 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm3.5 8.5l-5 3V7.5l5 3z" />
                </svg>
                <div className="flex-1">
                  <a
                    href={material.youTubeVideo.alternateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    {material.youTubeVideo.title}
                  </a>
                  <div className="text-xs text-muted-foreground">
                    YouTube Video
                  </div>
                </div>
                {material.youTubeVideo.thumbnailUrl && (
                  <Image
                    src={material.youTubeVideo.thumbnailUrl}
                    alt="Video thumbnail"
                    width={24}
                    height={24}
                    className="rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
              </>
            )}

            {material.link && (
              <>
                <svg
                  className="w-4 h-4 text-green-500"
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
                <div className="flex-1">
                  <a
                    href={material.link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                  >
                    {material.link.title || material.link.url}
                  </a>
                  <div className="text-xs text-muted-foreground">Web Link</div>
                </div>
              </>
            )}

            {material.form && (
              <>
                <svg
                  className="w-4 h-4 text-purple-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <div className="flex-1">
                  <a
                    href={material.form.formUrl || material.form.responseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                  >
                    {material.form.title}
                  </a>
                  <div className="text-xs text-muted-foreground">Form</div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading session...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
          <Card className="border-border bg-card max-w-md">
            <CardContent className="p-8 text-center">
              <p className="mb-4 text-foreground">
                Please sign in to view assignment details
              </p>
              <Button
                onClick={() => authClient.signIn.social({ provider: "google" })}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Sign in with Google
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Check if current user has already submitted
  const currentUserSubmission = assignmentData?.submissions.find(
    (submission) => submission.userId === session?.user.id
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-border text-foreground hover:bg-accent"
          >
            <Link
              href={`/courses/${courseId}`}
              className="flex items-center gap-2"
              prefetch
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Course
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-border text-foreground hover:bg-accent"
          >
            <Link
              href="/assignments"
              className="flex items-center gap-2"
              prefetch
            >
              View All Assignments
            </Link>
          </Button>
        </div>

        {/* Client-side check */}
        {!isClient ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <span className="text-muted-foreground">
                Loading...
              </span>
            </div>
          </div>
        ) : dataLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <span className="text-muted-foreground">
                Loading assignment details...
              </span>
            </div>
          </div>
        ) : error ? (
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
                Error Loading Assignment
              </h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-border text-foreground hover:bg-accent"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : assignmentData ? (
          <div>
            {/* Assignment Header */}
            <Card className="border-border bg-card mb-6">
              <CardHeader>
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    <CardTitle className="text-3xl font-bold text-foreground mb-2">
                      {assignmentData.assignment.title}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge
                        variant="outline"
                        className="border-border text-foreground"
                      >
                        {assignmentData.assignment.state}
                      </Badge>
                      {assignmentData.assignment.maxPoints && (
                        <Badge
                          variant="outline"
                          className="border-border text-foreground"
                        >
                          {assignmentData.assignment.maxPoints} points
                        </Badge>
                      )}
                    </div>

                    {assignmentData.assignment.description && (
                      <div className="bg-muted/50 p-4 rounded-lg mb-4 border border-border">
                        <p className="text-foreground whitespace-pre-wrap">
                          {assignmentData.assignment.description}
                        </p>
                      </div>
                    )}

                    {assignmentData.assignment.dueDate && (
                      <div className="flex items-center text-muted-foreground">
                        <CalendarIcon className="w-5 h-5 mr-2 text-destructive" />
                        <span>
                          Due:{" "}
                          {new Date(
                            assignmentData.assignment.dueDate.year,
                            assignmentData.assignment.dueDate.month - 1,
                            assignmentData.assignment.dueDate.day
                          ).toLocaleDateString()}
                          {assignmentData.assignment.dueTime &&
                            assignmentData.assignment.dueTime.hours !==
                              undefined &&
                            assignmentData.assignment.dueTime.minutes !==
                              undefined && (
                              <span className="ml-2">
                                at{" "}
                                {assignmentData.assignment.dueTime.hours
                                  .toString()
                                  .padStart(2, "0")}
                                :
                                {assignmentData.assignment.dueTime.minutes
                                  .toString()
                                  .padStart(2, "0")}
                              </span>
                            )}
                        </span>
                      </div>
                    )}

                    {assignmentData.assignment.materials &&
                      assignmentData.assignment.materials.length > 0 && (
                        <div className="mt-4">
                          <div className="text-sm font-medium text-muted-foreground mb-2">
                            Materials
                          </div>
                          {renderAssignmentMaterials(
                            assignmentData.assignment.materials
                          )}
                        </div>
                      )}
                  </div>
                  
                  {/* Prepare Assignment Section */}
                  <div className="lg:w-80 flex-shrink-0">
                    <AssignmentPreparer
                      assignmentId={assignmentId}
                      courseId={courseId}
                      description={assignmentData.assignment.description}
                      onAssignmentGenerated={setGeneratedAssignment}
                    />
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Current User's Submission Status */}
            {currentUserSubmission && (
              <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-600 dark:text-green-400 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <h3 className="text-sm font-medium text-green-800 dark:text-green-400">
                        You have already submitted this assignment
                      </h3>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        Status: {currentUserSubmission.state.replace("_", " ")}{" "}
                        • Submitted:{" "}
                        {new Date(
                          currentUserSubmission.updateTime
                        ).toLocaleDateString()}
                        {currentUserSubmission.assignedGrade !== undefined && (
                          <>
                            {" "}
                            • Grade: {currentUserSubmission.assignedGrade}
                            {assignmentData.assignment.maxPoints
                              ? `/${assignmentData.assignment.maxPoints}`
                              : ""}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <Card className="border-border bg-card">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {assignmentData.statistics.totalSubmissions}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Submissions
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border bg-card">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {assignmentData.statistics.submittedCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Submitted</div>
                </CardContent>
              </Card>
              <Card className="border-border bg-card">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {assignmentData.statistics.draftCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Drafts</div>
                </CardContent>
              </Card>
              <Card className="border-border bg-card">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {assignmentData.statistics.lateSubmissions}
                  </div>
                  <div className="text-sm text-muted-foreground">Late</div>
                </CardContent>
              </Card>
              <Card className="border-border bg-card">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {assignmentData.statistics.gradedCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Graded</div>
                </CardContent>
              </Card>
            </div>

            {/* Submissions List */}
            <Card className="border-border bg-card">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-xl font-semibold text-foreground">
                  Student Submissions
                </CardTitle>
              </CardHeader>

              {assignmentData.submissions.length > 0 ? (
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {assignmentData.submissions.map((submission) => (
                      <Card
                        key={submission.id}
                        className="border-border bg-card hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-6">
                          {/* Student Info Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                              {submission.userProfile?.photoUrl && (
                                <Image
                                  className="h-10 w-10 rounded-full mr-3"
                                  src={submission.userProfile.photoUrl}
                                  alt=""
                                  width={40}
                                  height={40}
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              )}
                              <div>
                                <div className="text-lg font-semibold text-foreground">
                                  {submission.userProfile?.name?.fullName ||
                                    "Unknown Student"}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {submission.userProfile?.emailAddress}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Badge
                                className={getStateColor(submission.state)}
                              >
                                {submission.state.replace("_", " ")}
                              </Badge>
                              {submission.late && (
                                <Badge variant="destructive">LATE</Badge>
                              )}
                            </div>
                          </div>

                          {/* Submission Details */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">
                                Grade
                              </div>
                              <div className="text-lg font-semibold text-foreground">
                                {submission.assignedGrade !== undefined
                                  ? `${submission.assignedGrade}${assignmentData.assignment.maxPoints ? `/${assignmentData.assignment.maxPoints}` : ""}`
                                  : submission.draftGrade !== undefined
                                    ? `${submission.draftGrade} (draft)`
                                    : "Not graded"}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">
                                Submitted
                              </div>
                              <div className="text-lg font-semibold text-foreground">
                                {new Date(
                                  submission.updateTime
                                ).toLocaleDateString()}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(
                                  submission.updateTime
                                ).toLocaleTimeString()}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">
                                Actions
                              </div>
                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="border-border text-foreground hover:bg-accent"
                              >
                                <a
                                  href={submission.alternateLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center"
                                >
                                  <ExternalLinkIcon className="w-4 h-4 mr-1" />
                                  View in Classroom
                                </a>
                              </Button>
                            </div>
                          </div>

                          {/* Submission Content/Attachments */}
                          <div>
                            <div className="text-sm font-medium text-muted-foreground mb-2">
                              Submission Files & Content
                            </div>
                            {renderSubmissionAttachments(submission)}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              ) : (
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center">
                    <FileTextIcon className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium text-foreground mb-2">
                      No submissions yet
                    </p>
                    <p className="text-muted-foreground">
                      View this assignment in Google Classroom to submit your
                      work.
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Generated Assignment Display */}
            {generatedAssignment && (
              <GeneratedAssignmentDisplay
                assignmentData={generatedAssignment}
                assignmentTitle={assignmentData.assignment.title}
              />
            )}
          </div>
        ) : (
          <Card className="border-border bg-card">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                Failed to load assignment details.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
