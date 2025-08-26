import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

interface StudentSubmission {
  courseId: string;
  courseWorkId: string;
  id: string;
  userId: string;
  creationTime: string;
  updateTime: string;
  state: "CREATED" | "TURNED_IN" | "RETURNED" | "RECLAIMED_BY_STUDENT";
  late: boolean;
  draftGrade?: number;
  assignedGrade?: number;
  alternateLink: string;
  courseWorkType: string;
  userProfile?: UserProfile;
}

interface UserProfile {
  id: string;
  name: {
    givenName: string;
    familyName: string;
    fullName: string;
  };
  emailAddress: string;
  photoUrl?: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; assignmentId: string }> }
) {
  const { id: courseId, assignmentId } = await params;

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

    // First, get the assignment details
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
        {
          error: "Failed to fetch assignment details",
          details: errorData,
          status: assignmentResponse.status,
        },
        { status: assignmentResponse.status }
      );
    }

    const assignmentData = await assignmentResponse.json();

    // Then, get all student submissions for this assignment with attachment details
    const submissionsResponse = await fetch(
      `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork/${assignmentId}/studentSubmissions?fields=studentSubmissions(id,userId,creationTime,updateTime,state,late,draftGrade,assignedGrade,alternateLink,courseWorkType,assignmentSubmission(attachments(driveFile(id,title,alternateLink,thumbnailUrl),youTubeVideo(id,title,alternateLink,thumbnailUrl),link(url,title,thumbnailUrl),form(formUrl,responseUrl,title,thumbnailUrl))))`,
      {
        headers: {
          Authorization: `Bearer ${googleAccount.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!submissionsResponse.ok) {
      const errorData = await submissionsResponse.text();
      console.error("Google Classroom API error (submissions):", errorData);

      return NextResponse.json(
        {
          error: "Failed to fetch student submissions",
          details: errorData,
          status: submissionsResponse.status,
        },
        { status: submissionsResponse.status }
      );
    }

    const submissionsData = await submissionsResponse.json();

    // Get user details for each submission to display student names
    const userIds =
      submissionsData.studentSubmissions?.map(
        (submission: StudentSubmission) => submission.userId
      ) || [];
    const uniqueUserIds = [...new Set(userIds)];

    // Fetch user profiles for all students who submitted
    const userProfileData = await Promise.all(
      uniqueUserIds.map(async (userId) => {
        const userIdStr = String(userId);
        const userResponse = await fetch(
          `https://classroom.googleapis.com/v1/userProfiles/${userIdStr}`,
          {
            headers: {
              Authorization: `Bearer ${googleAccount.accessToken}`,
              Accept: "application/json",
            },
          }
        );

        if (userResponse.ok) {
          const userData = (await userResponse.json()) as UserProfile;
          return { userId: userIdStr, userData };
        }
        return null;
      })
    );

    // Create user profiles map
    const userProfiles: Record<string, UserProfile> = {};
    userProfileData.forEach((item) => {
      if (item) {
        userProfiles[item.userId] = item.userData;
      }
    }); // Enhance submissions with user profile data
    const enhancedSubmissions =
      submissionsData.studentSubmissions?.map(
        (submission: StudentSubmission) => ({
          ...submission,
          userProfile: userProfiles[submission.userId] || null,
        })
      ) || [];

    // Calculate submission statistics
    const stats = {
      totalSubmissions: enhancedSubmissions.length,
      submittedCount: enhancedSubmissions.filter(
        (s: StudentSubmission) =>
          s.state === "TURNED_IN" || s.state === "RETURNED"
      ).length,
      draftCount: enhancedSubmissions.filter(
        (s: StudentSubmission) => s.state === "CREATED"
      ).length,
      lateSubmissions: enhancedSubmissions.filter(
        (s: StudentSubmission) => s.late
      ).length,
      gradedCount: enhancedSubmissions.filter(
        (s: StudentSubmission) =>
          s.assignedGrade !== undefined && s.assignedGrade !== null
      ).length,
    };

    return NextResponse.json({
      success: true,
      courseId,
      assignmentId,
      assignment: assignmentData,
      submissions: enhancedSubmissions,
      statistics: stats,
      totalSubmissions: enhancedSubmissions.length,
    });
  } catch (error) {
    console.error("Error in assignment details API:", error);
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 }
    );
  }
}
