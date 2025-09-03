import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { prisma } from "@/lib/prisma";
   
interface AssignmentMaterial {
  driveFile?: {
    title: string;
    id: string;
  };
  youTubeVideo?: {
    title: string;
    id: string;
  };
  link?: {
    title?: string;
    url: string;
  };
  form?: {
    title: string;
    formUrl: string;
  };
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: assignmentId } = await params;

  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

 
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

    // Fetch assignment details with attachments from Google Classroom
    const assignmentResponse = await fetch(
      `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork/${assignmentId}`,
      {
        headers: {
          Authorization: `Bearer ${googleAccount.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!assignmentResponse.ok) {
      const errorData = await assignmentResponse.text();
      console.error("Google Classroom API error (assignment):", errorData);
      return NextResponse.json(
        { error: "Failed to fetch assignment details" },
        { status: assignmentResponse.status }
      );
    }

    const assignmentData = await assignmentResponse.json();

    // Extract assignment information
    const assignmentTitle = assignmentData.title || "Untitled Assignment";
    const assignmentDescription = assignmentData.description || "No description provided";
    const assignmentMaterials = assignmentData.materials || [];
    const assignmentMaxPoints = assignmentData.maxPoints;
    const assignmentDueDate = assignmentData.dueDate;

    // Build context from materials/attachments
    let materialsContext = "";
    if (assignmentMaterials && assignmentMaterials.length > 0) {
      materialsContext = "\n\nAssignment Materials/Attachments:\n";
      assignmentMaterials.forEach((material: AssignmentMaterial, index: number) => {
        if (material.driveFile) {
          materialsContext += `${index + 1}. Drive File: ${material.driveFile.title}\n`;
        } else if (material.youTubeVideo) {
          materialsContext += `${index + 1}. YouTube Video: ${material.youTubeVideo.title}\n`;
        } else if (material.link) {
          materialsContext += `${index + 1}. Link: ${material.link.title || material.link.url}\n`;
        } else if (material.form) {
          materialsContext += `${index + 1}. Form: ${material.form.title}\n`;
        }
      });
    }

    // Create the enhanced prompt for the AI
    const prompt = `Please help me prepare a comprehensive assignment response based on the following details:

Assignment Title: ${assignmentTitle}
Assignment Description: ${assignmentDescription}
${assignmentMaxPoints ? `Maximum Points: ${assignmentMaxPoints}` : ""}
${assignmentDueDate ? `Due Date: ${assignmentDueDate.year}-${assignmentDueDate.month}-${assignmentDueDate.day}` : ""}${materialsContext}

Please provide a comprehensive, well-structured response that addresses the assignment requirements. The response should be:

1. Well-organized and easy to follow
2. Comprehensive in addressing the assignment requirements
3. Written in clear, academic language
4. Appropriate for the subject matter
5. Take into account any materials or attachments provided with the assignment

Please format your response in a way that would be suitable for submission as an assignment.`;

    // Generate content using Google AI with the correct syntax
    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      prompt,
    });

    if (!text) {
      return NextResponse.json(
        { error: "Failed to generate AI response" },
        { status: 500 }
      );
    }

    // Return the AI-generated content
    return NextResponse.json({
      success: true,
      aiResponse: text,
      assignmentTitle: assignmentTitle,
      assignmentDescription: assignmentDescription,
      materialsCount: assignmentMaterials.length,
    });
  } catch (error) {
    console.error("Error in prepare assignment API:", error);
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 }
    );
  }
}
