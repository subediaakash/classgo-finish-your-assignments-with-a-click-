"use client";

import { authClient } from "@/lib/auth-client";

export default function ClassroomPage() {

    const requestGoogleClassRoomAcess = async () => {
        await authClient.linkSocial({
            provider: "google",
            scopes: ["https://www.googleapis.com/auth/classroom.courses",
                "https://www.googleapis.com/auth/classroom.rosters",

                // Coursework
                "https://www.googleapis.com/auth/classroom.coursework.students",
                "https://www.googleapis.com/auth/classroom.coursework.me",

                // Announcements & Topics
                "https://www.googleapis.com/auth/classroom.announcements",
                "https://www.googleapis.com/auth/classroom.topics",

                // Guardian links (if needed)
                "https://www.googleapis.com/auth/classroom.guardianlinks.students"],

        });
    };

    return (
        <div>
            <h1>Your Google Classroom Courses</h1>
            <button onClick={requestGoogleClassRoomAcess}> GET CLASS ACESS</button>
        </div>
    );
}
