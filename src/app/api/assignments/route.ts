import { auth } from "@/lib/auth";
import { PrismaClient } from "@/generated/prisma";
import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";

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
    // Create a unique cache key per user
    const cacheKey = `assignments:user:${session.user.id}`;

    // 1. Check cache first (best-effort)
    try {
      const cachedAssignments = await redis.get(cacheKey);
      if (cachedAssignments) {
        console.log("✅ Serving assignments from Redis cache");
        return NextResponse.json(JSON.parse(cachedAssignments));
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      console.warn("[Redis] skipping cache get due to connection error");
    }

    // 2. If not cached → fetch from Google API
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

    if (
      googleAccount.accessTokenExpiresAt &&
      googleAccount.accessTokenExpiresAt < new Date()
    ) {
      return NextResponse.json(
        { error: "Access token expired. Please re-authenticate." },
        { status: 401 }
      );
    }

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
        continue;
      }

      const courseworkData = await courseworkResponse.json();
      const courseWork: ClassroomCourseWork[] = courseworkData.courseWork || [];

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

    const responsePayload = {
      success: true,
      assignments,
      totalAssignments: assignments.length,
    };

    // 3. Save to Redis with expiration (best-effort)
    try {
      await redis.set(cacheKey, JSON.stringify(responsePayload), "EX", 21600);
      console.log("🌀 Fetched fresh assignments and cached them");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      console.warn("[Redis] skipping cache set due to connection error");
    }

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}
