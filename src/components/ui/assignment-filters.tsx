"use client";

import React, { useState } from "react";
import { Button } from "./button";
import { Badge } from "./badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

export type SortOption = "dueDate" | "title" | "created" | "updated";
export type FilterOption =
  | "all"
  | "published"
  | "draft"
  | "assignment"
  | "shortAnswerQuestion"
  | "multipleChoiceQuestion";

interface AssignmentFiltersProps {
  onSortChange: (sort: SortOption) => void;
  onFilterChange: (filter: FilterOption) => void;
  onViewChange: (view: "grid" | "list") => void;
  currentSort: SortOption;
  currentFilter: FilterOption;
  currentView: "grid" | "list";
  assignmentCount: number;
  // Additional props for global assignment view
  showCourseFilter?: boolean;
  courses?: string[];
  selectedCourse?: string;
  onCourseChange?: (course: string) => void;
  showStatusFilter?: boolean;
  selectedStatus?: string;
  onStatusChange?: (status: string) => void;
  showDueDateFilter?: boolean;
  selectedDueDate?: string;
  onDueDateChange?: (dueDate: string) => void;
}

export function AssignmentFilters({
  onSortChange,
  onFilterChange,
  onViewChange,
  currentSort,
  currentFilter,
  currentView,
  assignmentCount,
  // Global view props
  showCourseFilter = false,
  courses = [],
  selectedCourse = "all",
  onCourseChange,
  showStatusFilter = false,
  selectedStatus = "all",
  onStatusChange,
  showDueDateFilter = false,
  selectedDueDate = "all",
  onDueDateChange,
}: AssignmentFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "dueDate", label: "Due Date" },
    { value: "title", label: "Title" },
    { value: "created", label: "Created" },
    { value: "updated", label: "Updated" },
  ];

  const filterOptions: { value: FilterOption; label: string }[] = [
    { value: "all", label: "All Assignments" },
    { value: "published", label: "Published" },
    { value: "draft", label: "Draft" },
    { value: "assignment", label: "Assignments" },
    { value: "shortAnswerQuestion", label: "Short Answer" },
    { value: "multipleChoiceQuestion", label: "Multiple Choice" },
  ];

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "TURNED_IN", label: "Turned In" },
    { value: "RETURNED", label: "Returned" },
    { value: "CREATED", label: "Created" },
  ];

  const dueDateOptions = [
    { value: "all", label: "All Due Dates" },
    { value: "overdue", label: "Overdue" },
    { value: "due-today", label: "Due Today" },
    { value: "due-week", label: "Due This Week" },
    { value: "no-due-date", label: "No Due Date" },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
      {/* Left side - Filters and Sort */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Course Filter (for global view) */}
        {showCourseFilter && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-foreground">Course:</label>
            <Select value={selectedCourse} onValueChange={onCourseChange}>
              <SelectTrigger className="w-40 bg-background border-border hover:border-border/80 focus:ring-2 focus:ring-primary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course} value={course}>
                    {course}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Status Filter (for global view) */}
        {showStatusFilter && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-foreground">Status:</label>
            <Select value={selectedStatus} onValueChange={onStatusChange}>
              <SelectTrigger className="w-32 bg-background border-border hover:border-border/80 focus:ring-2 focus:ring-primary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Due Date Filter (for global view) */}
        {showDueDateFilter && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-foreground">Due Date:</label>
            <Select value={selectedDueDate} onValueChange={onDueDateChange}>
              <SelectTrigger className="w-32 bg-background border-border hover:border-border/80 focus:ring-2 focus:ring-primary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                {dueDateOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Filter Dropdown (for course-specific view) */}
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 border-border text-foreground hover:bg-accent"
          >
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
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
              />
            </svg>
            Filter
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
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </Button>

          {isFilterOpen && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-popover rounded-lg shadow-lg border border-border py-1 z-10">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onFilterChange(option.value);
                    setIsFilterOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors ${
                    currentFilter === option.value
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="flex items-center gap-2 border-border text-foreground hover:bg-accent"
          >
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
                d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
              />
            </svg>
            Sort
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
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </Button>

          {isSortOpen && (
            <div className="absolute top-full left-0 mt-1 w-40 bg-popover rounded-lg shadow-lg border border-border py-1 z-10">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSortChange(option.value);
                    setIsSortOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors ${
                    currentSort === option.value
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Assignment Count */}
        <Badge variant="outline" className="border-border text-foreground bg-muted/50">
          {assignmentCount} assignment{assignmentCount !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Right side - View Toggle */}
      <div className="flex items-center gap-1 bg-muted rounded-lg p-1 border border-border">
        <button
          onClick={() => onViewChange("list")}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            currentView === "list"
              ? "bg-background text-foreground shadow-sm border border-border"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
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
              d="M4 6h16M4 10h16M4 14h16M4 18h16"
            />
          </svg>
          List
        </button>
        <button
          onClick={() => onViewChange("grid")}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            currentView === "grid"
              ? "bg-background text-foreground shadow-sm border border-border"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
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
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
          Grid
        </button>
      </div>

      {/* Click outside to close dropdowns */}
      {(isFilterOpen || isSortOpen) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setIsFilterOpen(false);
            setIsSortOpen(false);
          }}
        />
      )}
    </div>
  );
}
