import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // Check if user has Google account connected
    const googleAccount = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        providerId: "google",
      },
    });

    const hasGoogleAccount = !!(googleAccount && googleAccount.accessToken);

    // Check if access token is valid by making a test API call
    let hasValidConnection = false;
    if (hasGoogleAccount && googleAccount.accessToken) {
      try {
        const testResponse = await fetch(
          "https://classroom.googleapis.com/v1/courses?pageSize=1",
          {
            headers: {
              Authorization: `Bearer ${googleAccount.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        hasValidConnection = testResponse.ok;
      } catch (error) {
        console.error("Error testing Google Classroom connection:", error);
        hasValidConnection = false;
      }
    }

    return NextResponse.json({
      hasGoogleAccount,
      hasValidConnection,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      },
    });
  } catch (error) {
    console.error("Error checking user status:", error);
    return NextResponse.json(
      { error: "Failed to check user status" },
      { status: 500 }
    );
  }
}
