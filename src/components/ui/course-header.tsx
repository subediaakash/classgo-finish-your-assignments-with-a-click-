import React from "react";
import { Button } from "./button";

interface CourseHeaderProps {
  courseId: string;
  courseName?: string;
  assignmentCount: number;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function CourseHeader({
  courseId,
  courseName,
  assignmentCount,
  onRefresh,
  isLoading = false,
}: CourseHeaderProps) {
  const getRandomGradient = () => {
    const gradients = [
      "from-blue-500 to-blue-600",
      "from-purple-500 to-purple-600",
      "from-green-500 to-green-600",
      "from-red-500 to-red-600",
      "from-yellow-500 to-yellow-600",
      "from-pink-500 to-pink-600",
      "from-indigo-500 to-indigo-600",
      "from-teal-500 to-teal-600",
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
      {/* Header with gradient background */}
      <div className={`h-32 bg-gradient-to-r ${getRandomGradient()} relative`}>
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="absolute bottom-4 left-6 right-6">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                {courseName || "Course"}
              </h1>
              <p className="text-white text-opacity-90 text-sm">
                Course ID: {courseId}
              </p>
            </div>
            <div className="hidden sm:flex items-center space-x-3">
              <Button
                onClick={onRefresh}
                disabled={isLoading}
                variant="outline"
                className="bg-white bg-opacity-20 border-white border-opacity-30 text-white hover:bg-white hover:bg-opacity-30 backdrop-blur-sm"
              >
                {isLoading ? (
                  <svg
                    className="w-4 h-4 animate-spin mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                ) : (
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
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                )}
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats section */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-blue-600"
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
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {assignmentCount}
                </p>
                <p className="text-sm text-gray-600">
                  Assignment{assignmentCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-green-600"
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
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">Active</p>
                <p className="text-sm text-gray-600">Course Status</p>
              </div>
            </div>
          </div>

          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-purple-600"
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
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">Recent</p>
                <p className="text-sm text-gray-600">Last Updated</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile refresh button */}
      <div className="p-4 sm:hidden">
        <Button
          onClick={onRefresh}
          disabled={isLoading}
          variant="outline"
          className="w-full"
        >
          {isLoading ? (
            <svg
              className="w-4 h-4 animate-spin mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          ) : (
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          )}
          Refresh Assignments
        </Button>
      </div>
    </div>
  );
}
