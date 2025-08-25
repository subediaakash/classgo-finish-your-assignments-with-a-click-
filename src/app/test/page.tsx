"use client";

import { authClient } from "@/lib/auth-client";

export default function ClassroomPage() {

    const requestGoogleClassRoomAcess = async () => {
        await authClient.linkSocial({
            provider: "google",
            scopes: ["https://www.googleapis.com/auth/classroom.courses.readonly",
                "https://www.googleapis.com/auth/classroom.coursework.me.readonly"],
        });
    };

    return (
        <div>
            <h1>Your Google Classroom Courses</h1>
            <button onClick={requestGoogleClassRoomAcess}> GET CLASS ACESS</button>
        </div>
    );
}
