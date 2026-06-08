-- Initial schema for GestiActivités
-- Applied by migrations/1000000000000_init.js via node-pg-migrate.

-- Enums
CREATE TYPE "UserRole" AS ENUM ('chef_departement', 'admin');
CREATE TYPE "ActivityStatus" AS ENUM ('brouillon', 'soumis', 'actif', 'termine', 'archive');
CREATE TYPE "ActivityType" AS ENUM ('atelier', 'formation', 'mission', 'reunion', 'autre');
CREATE TYPE "ParticipantType" AS ENUM ('participant', 'facilitateur');
CREATE TYPE "AvailabilityStatus" AS ENUM ('disponible', 'conflit', 'nouveau');
CREATE TYPE "ConflictStatus" AS ENUM ('en_attente', 'resolu', 'ignore');
CREATE TYPE "ConflictResolution" AS ENUM ('retire', 'remplace', 'ignore');
CREATE TYPE "NotificationType" AS ENUM ('conflit_detecte', 'conflit_resolu', 'activite_soumise');
CREATE TYPE "HistoryEventType" AS ENUM ('cree', 'soumis', 'conflit_detecte', 'conflit_resolu', 'modifie', 'statut_change');

-- users
CREATE TABLE "users" (
  "id" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'chef_departement',
  "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  "emailVerifiedAt" TIMESTAMP(3),
  "verificationToken" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- activities
CREATE TABLE "activities" (
  "id" TEXT NOT NULL,
  "submittedById" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "referenceNumber" TEXT,
  "type" "ActivityType" NOT NULL,
  "department" TEXT NOT NULL,
  "startDate" DATE NOT NULL,
  "endDate" DATE NOT NULL,
  "venue" TEXT NOT NULL,
  "status" "ActivityStatus" NOT NULL DEFAULT 'brouillon',
  "isUrgent" BOOLEAN NOT NULL DEFAULT false,
  "submittedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- activity_participants
CREATE TABLE "activity_participants" (
  "id" TEXT NOT NULL,
  "activityId" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "titleRole" TEXT NOT NULL,
  "participantType" "ParticipantType" NOT NULL DEFAULT 'participant',
  "availabilityStatus" "AvailabilityStatus" NOT NULL DEFAULT 'disponible',
  "isManuallyAdded" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "activity_participants_pkey" PRIMARY KEY ("id")
);

-- conflicts
CREATE TABLE "conflicts" (
  "id" TEXT NOT NULL,
  "activityId" TEXT NOT NULL,
  "conflictingActivityId" TEXT NOT NULL,
  "participantName" TEXT NOT NULL,
  "status" "ConflictStatus" NOT NULL DEFAULT 'en_attente',
  "resolution" "ConflictResolution",
  "resolvedBy" TEXT,
  "replacementName" TEXT,
  "replacementRole" TEXT,
  "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" TIMESTAMP(3),
  CONSTRAINT "conflicts_pkey" PRIMARY KEY ("id")
);

-- documents
CREATE TABLE "documents" (
  "id" TEXT NOT NULL,
  "activityId" TEXT NOT NULL,
  "uploadedById" TEXT NOT NULL,
  "filename" TEXT NOT NULL,
  "storagePath" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "fileSizeBytes" INTEGER NOT NULL,
  "aiExtracted" BOOLEAN NOT NULL DEFAULT false,
  "extractedFields" JSONB,
  "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- activity_history
CREATE TABLE "activity_history" (
  "id" TEXT NOT NULL,
  "activityId" TEXT NOT NULL,
  "eventType" "HistoryEventType" NOT NULL,
  "actorName" TEXT NOT NULL,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "activity_history_pkey" PRIMARY KEY ("id")
);

-- notifications
CREATE TABLE "notifications" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "activityId" TEXT NOT NULL,
  "type" "NotificationType" NOT NULL,
  "message" TEXT NOT NULL,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "readAt" TIMESTAMP(3),
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_verificationToken_key" ON "users"("verificationToken");
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_verificationToken_idx" ON "users"("verificationToken");
CREATE INDEX "activities_status_idx" ON "activities"("status");
CREATE INDEX "activities_startDate_endDate_idx" ON "activities"("startDate", "endDate");
CREATE INDEX "activities_department_idx" ON "activities"("department");
CREATE INDEX "activity_participants_activityId_idx" ON "activity_participants"("activityId");
CREATE INDEX "activity_participants_fullName_idx" ON "activity_participants"("fullName");
CREATE INDEX "conflicts_activityId_idx" ON "conflicts"("activityId");
CREATE INDEX "conflicts_status_idx" ON "conflicts"("status");
CREATE INDEX "documents_activityId_idx" ON "documents"("activityId");
CREATE INDEX "activity_history_activityId_idx" ON "activity_history"("activityId");
CREATE INDEX "activity_history_occurredAt_idx" ON "activity_history"("occurredAt");
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- Foreign keys
ALTER TABLE "activities" ADD CONSTRAINT "activities_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "activity_participants" ADD CONSTRAINT "activity_participants_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "conflicts" ADD CONSTRAINT "conflicts_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "conflicts" ADD CONSTRAINT "conflicts_conflictingActivityId_fkey" FOREIGN KEY ("conflictingActivityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "documents" ADD CONSTRAINT "documents_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "activity_history" ADD CONSTRAINT "activity_history_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
