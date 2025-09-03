# The Classroom

A Next.js app that integrates with Google Classroom to display assignments and allow students to submit work (file or text) and turn-in directly via Classroom APIs.

## Quick Start

```bash
pnpm install
pnpm dev
# open http://localhost:3000
```

## Environment

Create a `.env.local` with the following variables:

```bash
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
DATABASE_URL=postgresql://user:pass@host:5432/db
NEXTAUTH_URL=http://localhost:3000
```

## Google OAuth setup

- App type: Web application
- Authorized redirect URI:
  - `http://localhost:3000/api/auth/callback/google`
- Scopes (required):
  - `openid`, `email`, `profile`
  - `https://www.googleapis.com/auth/classroom.courses`
  - `https://www.googleapis.com/auth/classroom.rosters`
  - `https://www.googleapis.com/auth/classroom.coursework.students`
  - `https://www.googleapis.com/auth/classroom.coursework.me`
  - `https://www.googleapis.com/auth/classroom.announcements`
  - `https://www.googleapis.com/auth/classroom.topics`
  - `https://www.googleapis.com/auth/classroom.guardianlinks.students`
  - `https://www.googleapis.com/auth/drive.file` (Drive upload/attach)

After adding a new scope (e.g., Drive), sign out and sign back in to grant consent.

## Key Endpoints

- `GET /api/assignments`
  - Returns assignments across all courses where the user is enrolled (`studentId=me`), including the user’s submission status and `courseId`.
  - Response shape:

    ```json
    {
      "success": true,
      "assignments": [
        {
          "id": "courseWorkId",
          "courseId": "courseId",
          "title": "Assignment title",
          "dueDate": { "year": 2025, "month": 1, "day": 31 },
          "courseName": "Course Name",
          "status": "CREATED|TURNED_IN|RETURNED|..."
        }
      ],
      "totalAssignments": 1
    }
    ```

- `GET /api/classroom/:courseId/assignments/:assignmentId`
  - Returns assignment details plus a submissions list with user profile enrichment and stats.

- `POST /api/classroom/:courseId/assignments/:assignmentId/:submissionId`
  - Accepts multipart form-data with either `file` or `submissionText`.
  - Uploads to Drive (if needed), attaches to the submission, and turns in the assignment.
  - If `submissionId` is missing/`undefined`, the route resolves the current user’s submission via the Classroom API.

## UI

- `GET /assignments` lists assignments aggregated across enrolled courses.
- `GET /courses/:courseId/assignments/:assignmentId` shows details, submissions, and allows submitting/turn-in when applicable.

## Dev Notes

- Auth is powered by `better-auth`, Prisma (generated client), and Next.js Route Handlers.
- When changing Google scopes, sign out and re-authenticate to refresh the token and permissions.
- Some Classroom endpoints (e.g., `modifyAttachments`) may require Classroom API project approval in Google Cloud; see error `@ProjectPermissionDenied`. Use a GCP project with Classroom API enabled and approved for your use case.

## Roadmap / Plan

- Assignments aggregation
  - ✅ Fetch courses for current user (`studentId=me`)
  - ✅ Fetch coursework per course
  - ✅ Fetch submission status per coursework (`userId=me`)
  - ☐ Cache assignments per user session to reduce API calls (see `//TODO : CACHE THE ASSINGMENTS`)

- Submission/Turn-in
  - ✅ Upload file/text to Drive via `drive.file`
  - ✅ Attach uploaded file(s) with `studentSubmissions.modifyAttachments`
  - ✅ Turn in submission with `studentSubmissions.turnIn`
  - ☐ Improve error UX for scope/consent and project approval issues

- Quality & DX
  - ✅ Stronger typing for API responses
  - ✅ Consistent response shapes for UI
  - ☐ Add tests and error-state UI
  - ☐ Add retry/backoff for transient Google errors

## Troubleshooting

- `Request had insufficient authentication scopes`:
  - Ensure Drive scope is present; sign out/in to re-consent.
- `@ProjectPermissionDenied`:
  - Enable Classroom API in your GCP project and request access/verification if required.
- Empty assignments list:
  - Ensure the signed-in Google user is enrolled in at least one Classroom course.
