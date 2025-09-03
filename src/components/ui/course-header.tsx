import React from "react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
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
    <Card className="border-border bg-card shadow-lg mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-3xl font-bold text-foreground mb-2">
              {courseName || "Course"}
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Course ID: {courseId}
            </p>
          </div>
          <Button
            onClick={onRefresh}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="border-border text-foreground hover:bg-accent"
          >
            {isLoading ? (
              <RefreshCwIcon className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <RefreshCwIcon className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
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
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
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
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
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
    </Card>
  );
}
