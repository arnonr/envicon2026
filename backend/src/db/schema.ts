import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  mysqlEnum,
  int,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }),
  name: varchar("name", { length: 255 }).notNull(),
  affiliation: varchar("affiliation", { length: 500 }),
  phone: varchar("phone", { length: 20 }),
  role: mysqlEnum("role", ["author", "reviewer", "admin"]).notNull().default("author"),
  oauthProvider: varchar("oauth_provider", { length: 50 }),
  oauthId: varchar("oauth_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const submissions = mysqlTable("submissions", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  authorId: varchar("author_id", { length: 36 }).notNull().references(() => users.id),
  title: varchar("title", { length: 500 }).notNull(),
  titleEn: varchar("title_en", { length: 500 }),
  abstract: text("abstract"),
  keywords: varchar("keywords", { length: 500 }),
  creators: text("creators"),
  track: int("track").notNull(),
  submitterType: mysqlEnum("submitter_type", ["student", "general"]).notNull().default("student"),
  status: mysqlEnum("status", [
    "draft",
    "pending_payment",
    "payment_verifying",
    "submitted",
    "under_review",
    "accepted",
    "rejected",
    "revision_requested",
  ]).notNull().default("draft"),
  abstractFileUrl: varchar("abstract_file_url", { length: 500 }),
  fullPaperFileUrl: varchar("full_paper_file_url", { length: 500 }),
  paymentSlipUrl: varchar("payment_slip_url", { length: 500 }),
  submittedAt: timestamp("submitted_at"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const reviewRounds = mysqlTable("review_rounds", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  submissionId: varchar("submission_id", { length: 36 }).notNull().references(() => submissions.id),
  roundNumber: int("round_number").notNull(),
  status: mysqlEnum("status", ["assigning", "in_review", "ready_for_decision", "released"]).notNull().default("assigning"),
  decision: mysqlEnum("decision", ["accept", "reject", "revise"]),
  adminNote: text("admin_note"),
  decidedBy: varchar("decided_by", { length: 36 }).references(() => users.id),
  decidedAt: timestamp("decided_at"),
  releasedAt: timestamp("released_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  uniqueIndex("review_rounds_submission_round_unique").on(table.submissionId, table.roundNumber),
]);

export const reviews = mysqlTable("reviews", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  submissionId: varchar("submission_id", { length: 36 }).notNull().references(() => submissions.id),
  roundId: varchar("round_id", { length: 36 }).notNull().references(() => reviewRounds.id),
  reviewerId: varchar("reviewer_id", { length: 36 }).notNull().references(() => users.id),
  score: int("score"),
  recommendation: mysqlEnum("recommendation", ["accept", "reject", "revise"]),
  commentsToAuthor: text("comments_to_author"),
  commentsToEditor: text("comments_to_editor"),
  status: mysqlEnum("status", ["assigned", "sent", "in_progress", "completed"]).notNull().default("assigned"),
  dueAt: timestamp("due_at"),
  sentAt: timestamp("sent_at"),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  uniqueIndex("reviews_round_reviewer_unique").on(table.roundId, table.reviewerId),
]);

export const reviewerAssignments = mysqlTable("reviewer_assignments", {
  id: int("id").primaryKey().autoincrement(),
  reviewerId: varchar("reviewer_id", { length: 36 }).notNull().references(() => users.id),
  track: int("track").notNull(),
  maxPapers: int("max_papers").notNull().default(5),
});

export const reviewerProfiles = mysqlTable("reviewer_profiles", {
  userId: varchar("user_id", { length: 36 }).primaryKey().references(() => users.id),
  maxConcurrentReviews: int("max_concurrent_reviews").notNull().default(5),
  active: int("active").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const reviewerExpertiseTracks = mysqlTable("reviewer_expertise_tracks", {
  id: int("id").primaryKey().autoincrement(),
  reviewerId: varchar("reviewer_id", { length: 36 }).notNull().references(() => users.id),
  track: int("track").notNull(),
}, (table) => [
  uniqueIndex("reviewer_expertise_track_unique").on(table.reviewerId, table.track),
]);

export const passwordSetupTokens = mysqlTable("password_setup_tokens", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const emailNotifications = mysqlTable("email_notifications", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  type: mysqlEnum("type", ["reviewer_invitation", "review_assignment", "author_result"]).notNull(),
  recipientEmail: varchar("recipient_email", { length: 255 }).notNull(),
  relatedId: varchar("related_id", { length: 36 }),
  subject: varchar("subject", { length: 500 }).notNull(),
  htmlBody: text("html_body").notNull(),
  status: mysqlEnum("status", ["pending", "sent", "failed"]).notNull().default("pending"),
  errorMessage: text("error_message"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const registrations = mysqlTable("registrations", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  type: mysqlEnum("type", ["student", "general"]).notNull(),
  paymentStatus: mysqlEnum("payment_status", ["pending", "confirmed"]).notNull().default("pending"),
  confirmedBy: varchar("confirmed_by", { length: 36 }).references(() => users.id),
  registeredAt: timestamp("registered_at").defaultNow().notNull(),
});

export const revisions = mysqlTable("revisions", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  submissionId: varchar("submission_id", { length: 36 }).notNull().references(() => submissions.id),
  version: int("version").notNull(),
  fileUrl: varchar("file_url", { length: 500 }).notNull(),
  changelog: text("changelog"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

export const eventRegistrations = mysqlTable("event_registrations", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  affiliation: varchar("affiliation", { length: 500 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
