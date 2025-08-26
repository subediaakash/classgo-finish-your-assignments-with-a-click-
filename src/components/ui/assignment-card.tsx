import React from "react";
import Link from "next/link";

interface AssignmentType {
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

interface AssignmentCardProps {
  assignment: AssignmentType;
  courseId: string;
  view?: "list" | "grid";
}

export function AssignmentCard({
  assignment,
  courseId,
  view = "list",
}: AssignmentCardProps) {
  const formatDueDate = (
    dueDate: typeof assignment.dueDate,
    dueTime?: typeof assignment.dueTime
  ) => {
    if (!dueDate) return null;

    const date = new Date(dueDate.year, dueDate.month - 1, dueDate.day);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let urgencyClass = "text-gray-600";
    let urgencyText = "";

    if (diffDays < 0) {
      urgencyClass = "text-red-600";
      urgencyText = "Overdue";
    } else if (diffDays === 0) {
      urgencyClass = "text-orange-600";
      urgencyText = "Due today";
    } else if (diffDays === 1) {
      urgencyClass = "text-yellow-600";
      urgencyText = "Due tomorrow";
    } else if (diffDays <= 7) {
      urgencyClass = "text-blue-600";
      urgencyText = `Due in ${diffDays} days`;
    }

    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    const timeString =
      dueTime && dueTime.hours !== undefined && dueTime.minutes !== undefined
        ? ` at ${dueTime.hours.toString().padStart(2, "0")}:${dueTime.minutes.toString().padStart(2, "0")}`
        : "";

    return {
      formatted: formattedDate + timeString,
      urgencyClass,
      urgencyText,
    };
  };

  const dueInfo = formatDueDate(assignment.dueDate, assignment.dueTime);
  const materialCount = assignment.materials?.length || 0;

  if (view === "grid") {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden group">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
              {assignment.title}
            </h3>
            <div className="flex gap-1 ml-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  assignment.state === "PUBLISHED"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {assignment.state}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {assignment.workType}
            </span>
            {assignment.maxPoints && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {assignment.maxPoints} pts
              </span>
            )}
            {materialCount > 0 && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {materialCount} material{materialCount > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {assignment.description && (
            <p className="text-gray-600 text-sm line-clamp-3 mb-3">
              {assignment.description}
            </p>
          )}

          {dueInfo && (
            <div className="flex items-center space-x-2 mb-3">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className={`text-sm font-medium ${dueInfo.urgencyClass}`}>
                {dueInfo.urgencyText || dueInfo.formatted}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4">
          <div className="flex gap-2">
            <Link
              href={`/courses/${courseId}/assignments/${assignment.id}`}
              className="flex-1 text-center px-3 py-2 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 transition-colors"
            >
              View Details
            </Link>
            <a
              href={assignment.alternateLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Open
            </a>
          </div>
        </div>
      </div>
    );
  }

  // List view (default)
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden group">
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1 mb-4 lg:mb-0 lg:mr-6">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {assignment.title}
              </h3>
              <div className="flex flex-wrap gap-2 ml-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    assignment.state === "PUBLISHED"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
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

            {assignment.description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {assignment.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              {dueInfo && (
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className={`font-medium ${dueInfo.urgencyClass}`}>
                    {dueInfo.urgencyText || dueInfo.formatted}
                  </span>
                </div>
              )}

              {materialCount > 0 && (
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                  <span>
                    {materialCount} material{materialCount > 1 ? "s" : ""}
                  </span>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  Updated {new Date(assignment.updateTime).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 lg:flex-col lg:gap-2">
            <Link
              href={`/courses/${courseId}/assignments/${assignment.id}`}
              className="flex-1 lg:flex-none inline-flex items-center justify-center px-4 py-2 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 transition-colors"
            >
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
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
              View Details
            </Link>
            <a
              href={assignment.alternateLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 lg:flex-none inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
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
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              Open in Classroom
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
