import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { google } from "googleapis";

interface SubmissionParams {
  id: string;
  assignmentId: string;
  submissionId: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<SubmissionParams> }
) {
  const { id: courseId, assignmentId, submissionId } = await params;

  // Check authentication
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // Get the Google account with access token
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

    // Parse the multipart form data
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Set up Google API clients
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: googleAccount.accessToken,
    });

    const drive = google.drive({ version: "v3", auth: oauth2Client });
    const classroom = google.classroom({ version: "v1", auth: oauth2Client });

    // Step 1: Upload file to Google Drive
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const fileMetadata = {
      name: file.name,
    };

    const media = {
      mimeType: file.type,
      body: fileBuffer,
    };

    console.log("Uploading file to Google Drive...");
    const driveResponse = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id",
    });

    const driveFileId = driveResponse.data.id;
    console.log("File uploaded to Drive. File ID:", driveFileId);

    if (!driveFileId) {
      return NextResponse.json(
        { error: "Failed to upload file to Google Drive" },
        { status: 500 }
      );
    }

    // Step 2: Attach the Drive file to the Classroom submission
    const attachmentBody = {
      addAttachments: [
        {
          driveFile: {
            id: driveFileId,
          },
        },
      ],
    };

    console.log("Attaching file to Classroom submission...");
    await classroom.courses.courseWork.studentSubmissions.modifyAttachments({
      courseId: courseId,
      courseWorkId: assignmentId,
      id: submissionId,
      requestBody: attachmentBody,
    });
    console.log("File attached to Classroom submission.");

    // Step 3: Turn in the assignment
    console.log("Turning in assignment...");
    const turnInResponse =
      await classroom.courses.courseWork.studentSubmissions.turnIn({
        courseId: courseId,
        courseWorkId: assignmentId,
        id: submissionId,
      });
    console.log("Assignment successfully turned in.");

    return NextResponse.json({
      success: true,
      message: "Assignment submitted successfully",
      submission: turnInResponse.data,
      driveFileId: driveFileId,
    });
  } catch (error) {
    console.error("Error submitting assignment:", error);

    // Handle specific Google API errors
    if (error instanceof Error) {
      if (error.message.includes("insufficient permissions")) {
        return NextResponse.json(
          { error: "Insufficient permissions to submit assignment" },
          { status: 403 }
        );
      }
      if (error.message.includes("not found")) {
        return NextResponse.json(
          { error: "Assignment or submission not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Failed to submit assignment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch submission details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<SubmissionParams> }
) {
  const { id: courseId, assignmentId, submissionId } = await params;

  // Check authentication
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // Get the Google account with access token
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

    // Fetch specific submission details
    const submissionResponse = await fetch(
      `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork/${assignmentId}/studentSubmissions/${submissionId}`,
      {
        headers: {
          Authorization: `Bearer ${googleAccount.accessToken}`,
          Accept: "application/json",
        },
      }
    );

    if (!submissionResponse.ok) {
      const errorData = await submissionResponse.text();
      console.error("Google Classroom API error:", errorData);
      return NextResponse.json(
        { error: "Failed to fetch submission details" },
        { status: submissionResponse.status }
      );
    }

    const submissionData = await submissionResponse.json();

    return NextResponse.json({
      success: true,
      submission: submissionData,
    });
  } catch (error) {
    console.error("Error fetching submission:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch submission details",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
