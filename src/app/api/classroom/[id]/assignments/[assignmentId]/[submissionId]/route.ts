import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { google } from "googleapis";
import { Readable } from "stream";

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

  console.log(
    "[SubmitAssignment] Incoming request",
    JSON.stringify({ courseId, assignmentId, submissionId })
  );

  // Check authentication
  console.log("[SubmitAssignment] Fetching user session...");
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    console.warn("[SubmitAssignment] No session found. Returning 401.");
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  console.log(
    "[SubmitAssignment] Session loaded for user",
    session.user?.id || "unknown"
  );

  try {
    // Get the Google account with access token
    console.log(
      "[SubmitAssignment] Looking up Google account with access token..."
    );
    const googleAccount = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        providerId: "google",
      },
    });

    if (!googleAccount || !googleAccount.accessToken) {
      console.error(
        "[SubmitAssignment] Google account missing or access token not found"
      );
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
      console.warn("[SubmitAssignment] Access token expired. Returning 401.");
      return NextResponse.json(
        { error: "Access token expired. Please re-authenticate." },
        { status: 401 }
      );
    }

    // Parse the multipart form data
    console.log("[SubmitAssignment] Parsing form data...");
    const formData = await req.formData();
    const file = (formData.get("file") as File) || null;
    const submissionText = String(formData.get("submissionText") || "").trim();

    console.log(
      "[SubmitAssignment] Form data parsed",
      JSON.stringify({
        hasFile: Boolean(file),
        hasText: submissionText.length > 0,
        courseId,
        assignmentId,
        submissionId,
      })
    );

    if (!file && !submissionText) {
      console.warn(
        "[SubmitAssignment] Neither file nor text present in request. Returning 400."
      );
      return NextResponse.json(
        { error: "No file or text provided" },
        { status: 400 }
      );
    }

    // Set up Google API clients
    console.log("[SubmitAssignment] Initializing Google API clients...");
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: googleAccount.accessToken,
    });

    const drive = google.drive({ version: "v3", auth: oauth2Client });
    const classroom = google.classroom({ version: "v1", auth: oauth2Client });

    // If submissionId is missing/undefined, resolve the current user's submission ID
    let targetSubmissionId: string | null =
      submissionId && submissionId !== "undefined" ? submissionId : null;

    if (!targetSubmissionId) {
      console.log(
        "[SubmitAssignment] No submissionId provided. Resolving user's submission via Classroom API..."
      );
      const list = await classroom.courses.courseWork.studentSubmissions.list({
        courseId: courseId,
        courseWorkId: assignmentId,
        userId: "me",
      });

      const found = list.data.studentSubmissions?.[0]?.id || null;
      console.log(
        "[SubmitAssignment] Resolved submissionId:",
        found || "none-found"
      );

      if (!found) {
        return NextResponse.json(
          { error: "No submission found for the current user." },
          { status: 404 }
        );
      }

      targetSubmissionId = found;
    }

    // Prepare attachments to add
    const addAttachments: Array<{ driveFile: { id: string } }> = [];

    // Step 1: If there is a file, upload it to Google Drive
    if (file) {
      console.log(
        "[SubmitAssignment] Uploading provided file to Google Drive...",
        JSON.stringify({ name: file.name, type: file.type, size: file.size })
      );
      const fileBuffer = Buffer.from(await file.arrayBuffer());

      const fileMetadata = {
        name: file.name,
      } as const;

      const media: { mimeType: string; body: NodeJS.ReadableStream } = {
        mimeType: file.type || "application/octet-stream",
        body: Readable.from(fileBuffer),
      };

      const driveResponse = await drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: "id",
      });

      const driveFileId = driveResponse.data.id;
      console.log(
        "[SubmitAssignment] File uploaded. Drive File ID:",
        driveFileId
      );

      if (!driveFileId) {
        console.error(
          "[SubmitAssignment] Drive upload failed: missing file ID"
        );
        return NextResponse.json(
          { error: "Failed to upload file to Google Drive" },
          { status: 500 }
        );
      }

      addAttachments.push({ driveFile: { id: driveFileId } });
    }

    // Step 2: If there is only text (and no file), create a simple text file and upload
    if (!file && submissionText) {
      console.log(
        "[SubmitAssignment] Creating text file from submissionText and uploading to Drive...",
        JSON.stringify({ textLength: submissionText.length })
      );
      const textBuffer = Buffer.from(submissionText, "utf-8");

      const textFileMetadata = {
        name: `submission-${targetSubmissionId}.txt`,
      } as const;

      const textMedia: { mimeType: string; body: NodeJS.ReadableStream } = {
        mimeType: "text/plain",
        body: Readable.from(textBuffer),
      };

      const textFileResponse = await drive.files.create({
        requestBody: textFileMetadata,
        media: textMedia,
        fields: "id",
      });

      const textDriveFileId = textFileResponse.data.id;
      console.log(
        "[SubmitAssignment] Text file uploaded. Drive File ID:",
        textDriveFileId
      );

      if (!textDriveFileId) {
        console.error(
          "[SubmitAssignment] Drive upload failed for text file: missing file ID"
        );
        return NextResponse.json(
          { error: "Failed to upload text to Google Drive" },
          { status: 500 }
        );
      }

      addAttachments.push({ driveFile: { id: textDriveFileId } });
    }

    // Step 3: Attach the Drive file(s) to the Classroom submission
    console.log(
      "[SubmitAssignment] Attaching file(s) to Classroom submission...",
      JSON.stringify({ attachmentsCount: addAttachments.length })
    );

    await classroom.courses.courseWork.studentSubmissions.modifyAttachments({
      courseId: courseId,
      courseWorkId: assignmentId,
      id: targetSubmissionId!,
      requestBody: { addAttachments },
    });

    console.log("[SubmitAssignment] Attachment(s) added to submission.");

    // Step 4: Turn in the assignment
    console.log(
      "[SubmitAssignment] Turning in assignment...",
      targetSubmissionId
    );
    const turnInResponse =
      await classroom.courses.courseWork.studentSubmissions.turnIn({
        courseId: courseId,
        courseWorkId: assignmentId,
        id: targetSubmissionId!,
      });
    console.log("[SubmitAssignment] Assignment successfully turned in.");

    return NextResponse.json({
      success: true,
      message: "Assignment submitted successfully",
      submission: turnInResponse.data,
    });
  } catch (error) {
    console.error("[SubmitAssignment] Error submitting assignment:", error);

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
