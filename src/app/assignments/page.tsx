"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Assignment {
  id: string;
  courseId: string;
  title: string;
  dueDate?: {
    year: number;
    month: number;
    day: number;
  };
  courseName: string;
  status: string;
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await fetch("/api/assignments");
        if (!response.ok) {
          throw new Error("Failed to fetch assignments");
        }
        const data = await response.json();
        const list = Array.isArray(data?.assignments) ? data.assignments : [];
        setAssignments(list);
      } catch (err) {
        setError("Error loading assignments");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const formatDueDate = (dueDate?: {
    year: number;
    month: number;
    day: number;
  }) => {
    if (!dueDate) return "No due date";
    return `${dueDate.day}/${dueDate.month}/${dueDate.year}`;
  };

  if (loading)
    return (
      <div className="flex justify-center p-8">Loading assignments...</div>
    );
  if (error) return <div className="text-red-500 p-8">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 border-2 border-gray-300 rounded-lg">
      <h1 className="text-2xl font-semibold text-center mb-6">
        Courses Assignment
      </h1>

      {assignments.length === 0 ? (
        <div className="text-center p-4">No assignments found</div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment, index) => (
            <div
              key={`${assignment.courseId}-${assignment.id}`}
              className="border-2 border-gray-300 rounded-lg p-4 relative"
            >
              <div className="pr-36">
                <p>
                  <span className="font-bold">{index + 1}:</span> Assignment no{" "}
                  {index + 1}
                  <span className="font-bold"> Course:</span>{" "}
                  {assignment.courseName}
                </p>
                <p className="text-sm">
                  <span className="font-bold">Due date:</span>{" "}
                  {formatDueDate(assignment.dueDate)}
                  <span className="font-bold ml-2">status:</span>{" "}
                  {assignment.status}.
                </p>
              </div>

              <Link
                href={`/courses/${assignment.courseId}/assignments/${assignment.id}`}
                className="absolute right-4 bottom-4 text-blue-600 hover:underline"
              >
                Open assignment
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
