import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  mysqlEnum,
  int,
  uuid,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }),
  name: varchar("name", { length: 255 }).notNull(),
  affiliation: varchar("affiliation", { length: 500 }),
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
  abstract: text("abstract"),
  keywords: varchar("keywords", { length: 500 }),
  track: int("track").notNull(),
  status: mysqlEnum("status", [
    "draft",
    "submitted",
    "under_review",
    "accepted",
    "rejected",
    "revision_requested",
  ]).notNull().default("draft"),
  abstractFileUrl: varchar("abstract_file_url", { length: 500 }),
  fullPaperFileUrl: varchar("full_paper_file_url", { length: 500 }),
  submittedAt: timestamp("submitted_at"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const reviews = mysqlTable("reviews", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  submissionId: varchar("submission_id", { length: 36 }).notNull().references(() => submissions.id),
  reviewerId: varchar("reviewer_id", { length: 36 }).notNull().references(() => users.id),
  score: int("score"),
  recommendation: mysqlEnum("recommendation", ["accept", "reject", "revise"]),
  commentsToAuthor: text("comments_to_author"),
  commentsToEditor: text("comments_to_editor"),
  status: mysqlEnum("status", ["pending", "completed"]).notNull().default("pending"),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const reviewerAssignments = mysqlTable("reviewer_assignments", {
  id: int("id").primaryKey().autoincrement(),
  reviewerId: varchar("reviewer_id", { length: 36 }).notNull().references(() => users.id),
  track: int("track").notNull(),
  maxPapers: int("max_papers").notNull().default(5),
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
