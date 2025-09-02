"use client";

import { authClient } from "@/lib/auth-client";
import { useState, useEffect, use } from "react";
import Image from "next/image";

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
        return "bg-green-100 text-green-800";
      case "RETURNED":
        return "bg-blue-100 text-blue-800";
      case "CREATED":
        return "bg-yellow-100 text-yellow-800";
      case "RECLAIMED_BY_STUDENT":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderSubmissionAttachments = (submission: StudentSubmission) => {
    const attachments = submission.assignmentSubmission?.attachments;

    if (!attachments || attachments.length === 0) {
      return (
        <div className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center">
            <svg
              className="w-4 h-4 mr-2"
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
            className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg"
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
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    {attachment.driveFile.title}
                  </a>
                  <div className="text-xs text-gray-500">Google Drive File</div>
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
                    className="text-sm font-medium text-red-600 hover:text-red-800"
                  >
                    {attachment.youTubeVideo.title}
                  </a>
                  <div className="text-xs text-gray-500">YouTube Video</div>
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
                    className="text-sm font-medium text-green-600 hover:text-green-800"
                  >
                    {attachment.link.title || "Link"}
                  </a>
                  <div className="text-xs text-gray-500">Web Link</div>
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
                    className="text-sm font-medium text-purple-600 hover:text-purple-800"
                  >
                    {attachment.form.title}
                  </a>
                  <div className="text-xs text-gray-500">Form Response</div>
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
      <div className="flex justify-center items-center min-h-screen">
        Loading session...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="mb-4">Please sign in to view assignment details</p>
        <button
          onClick={() => authClient.signIn.social({ provider: "google" })}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  // Check if current user has already submitted
  const currentUserSubmission = assignmentData?.submissions.find(
    (submission) => submission.userId === session?.user.id
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {dataLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">
              Loading assignment details...
            </span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <svg
                  className="w-6 h-6 text-red-600"
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
              <h3 className="text-lg font-medium text-red-800 mb-2">
                Error Loading Assignment
              </h3>
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : assignmentData ? (
          <div>
            {/* Assignment Header */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {assignmentData.assignment.title}
                  </h1>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {assignmentData.assignment.state}
                    </span>
                    {assignmentData.assignment.maxPoints && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                        {assignmentData.assignment.maxPoints} points
                      </span>
                    )}
                  </div>

                  {assignmentData.assignment.description && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {assignmentData.assignment.description}
                      </p>
                    </div>
                  )}

                  {assignmentData.assignment.dueDate && (
                    <div className="flex items-center text-gray-600">
                      <svg
                        className="w-5 h-5 mr-2 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 01-2 2z"
                        />
                      </svg>
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
                </div>
              </div>
            </div>

            {/* Current User's Submission Status */}
            {currentUserSubmission && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-600 mr-2"
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
                    <h3 className="text-sm font-medium text-green-800">
                      You have already submitted this assignment
                    </h3>
                    <p className="text-sm text-green-700 mt-1">
                      Status: {currentUserSubmission.state.replace("_", " ")} •
                      Submitted:{" "}
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
              </div>
            )}

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-2xl font-bold text-blue-600">
                  {assignmentData.statistics.totalSubmissions}
                </div>
                <div className="text-sm text-gray-600">Total Submissions</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-2xl font-bold text-green-600">
                  {assignmentData.statistics.submittedCount}
                </div>
                <div className="text-sm text-gray-600">Submitted</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-2xl font-bold text-yellow-600">
                  {assignmentData.statistics.draftCount}
                </div>
                <div className="text-sm text-gray-600">Drafts</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-2xl font-bold text-red-600">
                  {assignmentData.statistics.lateSubmissions}
                </div>
                <div className="text-sm text-gray-600">Late</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-2xl font-bold text-purple-600">
                  {assignmentData.statistics.gradedCount}
                </div>
                <div className="text-sm text-gray-600">Graded</div>
              </div>
            </div>

            {/* Submissions List */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Student Submissions
                </h2>
              </div>

              {assignmentData.submissions.length > 0 ? (
                <div className="space-y-4 p-6">
                  {assignmentData.submissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
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
                            <div className="text-lg font-semibold text-gray-900">
                              {submission.userProfile?.name?.fullName ||
                                "Unknown Student"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {submission.userProfile?.emailAddress}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStateColor(submission.state)}`}
                          >
                            {submission.state.replace("_", " ")}
                          </span>
                          {submission.late && (
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                              LATE
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Submission Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-sm font-medium text-gray-500">
                            Grade
                          </div>
                          <div className="text-lg font-semibold text-gray-900">
                            {submission.assignedGrade !== undefined
                              ? `${submission.assignedGrade}${assignmentData.assignment.maxPoints ? `/${assignmentData.assignment.maxPoints}` : ""}`
                              : submission.draftGrade !== undefined
                                ? `${submission.draftGrade} (draft)`
                                : "Not graded"}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-500">
                            Submitted
                          </div>
                          <div className="text-lg font-semibold text-gray-900">
                            {new Date(
                              submission.updateTime
                            ).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(
                              submission.updateTime
                            ).toLocaleTimeString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-500">
                            Actions
                          </div>
                          <a
                            href={submission.alternateLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                            View in Classroom
                          </a>
                        </div>
                      </div>

                      {/* Submission Content/Attachments */}
                      <div>
                        <div className="text-sm font-medium text-gray-500 mb-2">
                          Submission Files & Content
                        </div>
                        {renderSubmissionAttachments(submission)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <svg
                      className="w-12 h-12 text-gray-400 mb-4"
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
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      No submissions yet
                    </p>
                    <p className="text-gray-500">
                      View this assignment in Google Classroom to submit your work.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Failed to load assignment details.</p>
          </div>
        )}
      </div>
    </div>
  );
}
