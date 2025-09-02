import { auth } from "@/lib/auth";
import { PrismaClient } from "@/generated/prisma";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

//TODO : CACHE THE ASSINGMENTS

interface ClassroomCourse {
  id: string;
  name: string;
}

interface ClassroomDueDate {
  year: number;
  month: number;
  day: number;
}

interface ClassroomCourseWork {
  id: string;
  title: string;
  dueDate?: ClassroomDueDate;
}

interface AssignmentSummary {
  id: string;
  courseId: string;
  title: string;
  dueDate?: ClassroomDueDate;
  courseName: string;
  status: string;
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // Get the Google account to access the access token
    const googleAccount = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        providerId: "google",
      },
    });

    if (!googleAccount || !googleAccount.accessToken) {
      return NextResponse.json(
        { error: "No Google account linked or access token missing" },
        { status: 400 }
      );
    }

    // Check if access token is expired
    if (
      googleAccount.accessTokenExpiresAt &&
      googleAccount.accessTokenExpiresAt < new Date()
    ) {
      return NextResponse.json(
        { error: "Access token expired. Please re-authenticate." },
        { status: 401 }
      );
    }

    // Step 1: Get courses where the user is enrolled as a student
    const coursesResponse = await fetch(
      "https://classroom.googleapis.com/v1/courses?studentId=me",
      {
        headers: {
          Authorization: `Bearer ${googleAccount.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!coursesResponse.ok) {
      const errorData = await coursesResponse.text();
      console.error("Google Classroom API error (courses):", errorData);
      return NextResponse.json(
        { error: "Failed to fetch courses", details: errorData },
        { status: coursesResponse.status }
      );
    }

    const coursesData = await coursesResponse.json();
    const courses: ClassroomCourse[] = coursesData.courses || [];

    const assignments: AssignmentSummary[] = [];

    // Step 2: Loop through courses and get assignments
    for (const course of courses) {
      const courseId = course.id;
      const courseName = course.name;

      const courseworkResponse = await fetch(
        `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`,
        {
          headers: {
            Authorization: `Bearer ${googleAccount.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!courseworkResponse.ok) {
        console.error(`Error fetching coursework for course ${courseId}`);
        continue; // Skip to next course if there's an error
      }

      const courseworkData = await courseworkResponse.json();
      const courseWork: ClassroomCourseWork[] = courseworkData.courseWork || [];

      // Step 3: For each assignment, get the current user's submission status
      for (const work of courseWork) {
        const submissionsResponse = await fetch(
          `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork/${work.id}/studentSubmissions?userId=me`,
          {
            headers: {
              Authorization: `Bearer ${googleAccount.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (submissionsResponse.ok) {
          const submissionsData = await submissionsResponse.json();
          const submission = submissionsData.studentSubmissions?.[0];

          assignments.push({
            id: work.id,
            courseId,
            title: work.title,
            dueDate: work.dueDate,
            courseName,
            status: submission?.state ?? "CREATED",
          });
        } else {
          // If we can't get submission status, still add the assignment
          assignments.push({
            id: work.id,
            courseId,
            title: work.title,
            dueDate: work.dueDate,
            courseName,
            status: "UNKNOWN",
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      assignments,
      totalAssignments: assignments.length,
    });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}
