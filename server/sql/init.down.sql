-- Rollback for the initial schema.

DROP TABLE IF EXISTS "notifications";
DROP TABLE IF EXISTS "activity_history";
DROP TABLE IF EXISTS "documents";
DROP TABLE IF EXISTS "conflicts";
DROP TABLE IF EXISTS "activity_participants";
DROP TABLE IF EXISTS "activities";
DROP TABLE IF EXISTS "users";

DROP TYPE IF EXISTS "HistoryEventType";
DROP TYPE IF EXISTS "NotificationType";
DROP TYPE IF EXISTS "ConflictResolution";
DROP TYPE IF EXISTS "ConflictStatus";
DROP TYPE IF EXISTS "AvailabilityStatus";
DROP TYPE IF EXISTS "ParticipantType";
DROP TYPE IF EXISTS "ActivityType";
DROP TYPE IF EXISTS "ActivityStatus";
DROP TYPE IF EXISTS "UserRole";
