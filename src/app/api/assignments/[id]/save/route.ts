import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: assignmentId } = await params;
    const body = await request.json();
    const {
      courseId,
      assignmentTitle,
      assignmentDescription,
      aiResponse,
      studentName,
      usn,
      subject,
      course,
      stream,
      materialsCount,
    } = body;

    // Check if assignment already exists for this user and course
    const existingAssignment = await prisma.generatedAssignment.findUnique({
      where: {
        userId_courseId_assignmentId: {
          userId: session.user.id,
          courseId,
          assignmentId,
        },
      },
    });

    if (existingAssignment) {
      // Update existing assignment
      const updatedAssignment = await prisma.generatedAssignment.update({
        where: {
          id: existingAssignment.id,
        },
        data: {
          assignmentTitle,
          assignmentDescription,
          aiResponse,
          studentName,
          usn,
          subject,
          course,
          stream,
          materialsCount,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        assignment: updatedAssignment,
        message: "Assignment updated successfully",
      });
    } else {
      // Create new assignment
      const newAssignment = await prisma.generatedAssignment.create({
        data: {
          userId: session.user.id,
          courseId,
          assignmentId,
          assignmentTitle,
          assignmentDescription,
          aiResponse,
          studentName,
          usn,
          subject,
          course,
          stream,
          materialsCount,
        },
      });

      return NextResponse.json({
        success: true,
        assignment: newAssignment,
        message: "Assignment saved successfully",
      });
    }
  } catch (error) {
    console.error("Error saving assignment:", error);
    return NextResponse.json(
      { error: "Failed to save assignment" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: assignmentId } = await params;
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Get existing assignment for this user and course
    const existingAssignment = await prisma.generatedAssignment.findUnique({
      where: {
        userId_courseId_assignmentId: {
          userId: session.user.id,
          courseId,
          assignmentId,
        },
      },
    });

    if (!existingAssignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      assignment: existingAssignment,
    });
  } catch (error) {
    console.error("Error fetching assignment:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignment" },
      { status: 500 }
    );
  }
}
