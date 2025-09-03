import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { Button } from "./button";
import { CalendarIcon, ClockIcon, EyeIcon, ExternalLinkIcon, BookOpenIcon } from "lucide-react";

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
  courseId?: string; // Optional for global assignment view
  courseName?: string; // Optional for global assignment view
  view?: "list" | "grid";
  showCourseInfo?: boolean; // Whether to show course information (for global view)
}

export function AssignmentCard({
  assignment,
  courseId,
  courseName,
  view = "list",
  showCourseInfo = false,
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

    let urgencyClass = "text-muted-foreground";
    let urgencyText = "";

    if (diffDays < 0) {
      urgencyClass = "text-destructive";
      urgencyText = "Overdue";
    } else if (diffDays === 0) {
      urgencyClass = "text-orange-500";
      urgencyText = "Due today";
    } else if (diffDays === 1) {
      urgencyClass = "text-yellow-500";
      urgencyText = "Due tomorrow";
    } else if (diffDays <= 7) {
      urgencyClass = "text-blue-500";
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
  const getStatusBadgeVariant = (state: string) => {
    switch (state) {
      case "PUBLISHED":
      case "TURNED_IN":
        return "default";
      case "RETURNED":
        return "secondary";
      case "CREATED":
      case "DRAFT":
        return "outline";
      default:
        return "outline";
    }
  };

  if (view === "grid") {
    return (
      <Card className="border-border bg-card hover:shadow-lg transition-all duration-200 group">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between mb-2">
            <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {assignment.title}
            </CardTitle>
            <div className="flex gap-1 ml-2">
              <Badge 
                variant={getStatusBadgeVariant(assignment.state)}
                className="text-xs"
              >
                {assignment.state}
              </Badge>
            </div>
          </div>

          {/* Show course info if in global view */}
          {showCourseInfo && courseName && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <BookOpenIcon className="w-4 h-4" />
              <span className="font-medium">{courseName}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="outline" className="border-border text-foreground bg-muted/50">
              {assignment.workType}
            </Badge>
            {assignment.maxPoints && (
              <Badge variant="outline" className="border-border text-foreground bg-muted/50">
                {assignment.maxPoints} pts
              </Badge>
            )}

          </div>

          {assignment.description && (
            <p className="text-muted-foreground text-sm line-clamp-3 mb-3">
              {assignment.description}
            </p>
          )}

          {dueInfo && (
            <div className="flex items-center space-x-2 mb-3">
              <CalendarIcon className="w-4 h-4 text-muted-foreground" />
              <span className={`text-sm font-medium ${dueInfo.urgencyClass}`}>
                {dueInfo.urgencyText || dueInfo.formatted}
              </span>
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex gap-2">
            {courseId ? (
              <Button asChild variant="outline" size="sm" className="flex-1 border-border text-foreground hover:bg-accent">
                <Link href={`/courses/${courseId}/assignments/${assignment.id}`}>
                  <EyeIcon className="w-4 h-4 mr-2" />
                  View Details
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="flex-1 border-border text-foreground hover:bg-accent">
                <EyeIcon className="w-4 h-4 mr-2" />
                View Details
              </Button>
            )}
            <Button asChild size="sm" className="flex-1">
              <a
                href={assignment.alternateLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLinkIcon className="w-4 h-4 mr-2" />
                Open
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // List view (default)
  return (
    <Card className="border-border bg-card hover:shadow-lg transition-all duration-200 group">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1 mb-4 lg:mb-0 lg:mr-6">
            <div className="flex items-start justify-between mb-3">
              <CardTitle className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                {assignment.title}
              </CardTitle>
              <div className="flex flex-wrap gap-2 ml-4">
                <Badge 
                  variant={getStatusBadgeVariant(assignment.state)}
                >
                  {assignment.state}
                </Badge>
                <Badge variant="outline" className="border-border text-foreground bg-muted/50">
                  {assignment.workType}
                </Badge>
                {assignment.maxPoints && (
                  <Badge variant="outline" className="border-border text-foreground bg-muted/50">
                    {assignment.maxPoints} points
                  </Badge>
                )}
              </div>
            </div>

            {/* Show course info if in global view */}
            {showCourseInfo && courseName && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <BookOpenIcon className="w-4 h-4" />
                <span className="font-medium">{courseName}</span>
              </div>
            )}

            {assignment.description && (
              <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                {assignment.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {dueInfo && (
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span className={`font-medium ${dueInfo.urgencyClass}`}>
                    {dueInfo.urgencyText || dueInfo.formatted}
                  </span>
                </div>
              )}



              <div className="flex items-center space-x-2">
                <ClockIcon className="w-4 h-4" />
                <span>
                  Updated {new Date(assignment.updateTime).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 lg:flex-col lg:gap-2">
            {courseId ? (
              <Button asChild variant="outline" className="flex-1 lg:flex-none border-border text-foreground hover:bg-accent">
                <Link href={`/courses/${courseId}/assignments/${assignment.id}`}>
                  <EyeIcon className="w-4 h-4 mr-2" />
                  View Details
                </Link>
              </Button>
            ) : (
              <Button variant="outline" className="flex-1 lg:flex-none border-border text-foreground hover:bg-accent">
                <EyeIcon className="w-4 h-4 mr-2" />
                View Details
              </Button>
            )}
            <Button asChild className="flex-1 lg:flex-none">
              <a
                href={assignment.alternateLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLinkIcon className="w-4 h-4 mr-2" />
                Open in Classroom
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
