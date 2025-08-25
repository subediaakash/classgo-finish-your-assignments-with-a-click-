import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: courseId } = await params;

  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // Get the Google account directly from the database to access the access token
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

    // Fetch Google Classroom course work (assignments)
    const classroomResponse = await fetch(
      `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`,
      {
        headers: {
          Authorization: `Bearer ${googleAccount.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!classroomResponse.ok) {
      const errorData = await classroomResponse.text();
      console.error("Google Classroom API error:", errorData);

      return NextResponse.json(
        {
          error: "Failed to fetch assignments",
          details: errorData,
          status: classroomResponse.status,
        },
        { status: classroomResponse.status }
      );
    }

    const assignmentsData = await classroomResponse.json();

    return NextResponse.json({
      success: true,
      courseId,
      assignments: assignmentsData.courseWork || [],
      totalAssignments: assignmentsData.courseWork?.length || 0,
    });
  } catch (error) {
    console.error("Error in assignments API:", error);
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 }
    );
  }
}
