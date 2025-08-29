import React from "react";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { RefreshCwIcon, BookOpenIcon, CheckCircleIcon, CalendarIcon } from "lucide-react";

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
  return (
    <div className="relative group">
      {/* Glassy background effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-purple-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-all duration-300"></div>
      
      <Card className="relative border-0 bg-card/80 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5 rounded-2xl"></div>
        <div className="relative">
          {/* Header with black background */}
          <div className="h-32 bg-gradient-to-br from-black via-gray-900 to-black relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10"></div>
            <div className="absolute bottom-4 left-6 right-6">
              <div className="flex items-end justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">
                    {courseName || "Course"}
                  </h1>
                  <p className="text-white/80 text-sm">
                    Course ID: {courseId}
                  </p>
                </div>
                <div className="hidden sm:flex items-center space-x-3">
                  <Button
                    onClick={onRefresh}
                    disabled={isLoading}
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    {isLoading ? (
                      <RefreshCwIcon className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCwIcon className="w-4 h-4 mr-2" />
                    )}
                    Refresh
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats section */}
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shadow-lg">
                    <BookOpenIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {assignmentCount}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Assignment{assignmentCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center shadow-lg">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">Active</p>
                    <p className="text-sm text-muted-foreground">Course Status</p>
                  </div>
                </div>
              </div>

              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start space-x-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center shadow-lg">
                    <CalendarIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">Recent</p>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>

          {/* Mobile refresh button */}
          <div className="p-4 sm:hidden border-t border-border">
            <Button
              onClick={onRefresh}
              disabled={isLoading}
              variant="outline"
              className="w-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              {isLoading ? (
                <RefreshCwIcon className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCwIcon className="w-4 h-4 mr-2" />
              )}
              Refresh Assignments
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
