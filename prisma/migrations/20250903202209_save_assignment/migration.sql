-- CreateTable
CREATE TABLE "public"."generated_assignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "assignmentTitle" TEXT NOT NULL,
    "assignmentDescription" TEXT,
    "aiResponse" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "usn" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "stream" TEXT NOT NULL,
    "materialsCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generated_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "generated_assignment_id_key" ON "public"."generated_assignment"("id");

-- CreateIndex
CREATE UNIQUE INDEX "generated_assignment_userId_courseId_assignmentId_key" ON "public"."generated_assignment"("userId", "courseId", "assignmentId");

-- AddForeignKey
ALTER TABLE "public"."generated_assignment" ADD CONSTRAINT "generated_assignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
