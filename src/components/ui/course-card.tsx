import React from "react";
import Link from "next/link";

interface Course {
  id: string;
  name: string;
  description?: string;
  courseState?: string;
  alternateLink?: string;
}

interface CourseCardProps {
  course: Course;
  onClick?: () => void;
}

export function CourseCard({ course, onClick }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.id}`} onClick={onClick} className="block">
      <div className="group relative h-full">
        {/* Glassy background effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-purple-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-all duration-300"></div>
        
        <div className="relative bg-card/80 backdrop-blur-xl rounded-xl shadow-lg border border-border/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden h-full flex flex-col">
          {/* Header with black background */}
          <div className="h-24 bg-gradient-to-br from-black via-gray-900 to-black relative flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10"></div>
            <div className="absolute top-4 right-4">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 flex-1 flex flex-col">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 flex-1">
                {course.name}
              </h3>
              {course.courseState && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${
                    course.courseState === "ACTIVE"
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {course.courseState}
                </span>
              )}
            </div>

            {course.description && (
              <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-1">
                {course.description}
              </p>
            )}

            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
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
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
                <span>View assignments</span>
              </div>

              <div className="inline-flex items-center text-primary group-hover:text-primary/80 text-sm font-medium transition-colors group/link">
                Open
                <svg
                  className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
