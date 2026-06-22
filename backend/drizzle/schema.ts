import { mysqlTable, mysqlSchema, AnyMySqlColumn, primaryKey, varchar, mysqlEnum, text, timestamp, unique, foreignKey, int } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const emailNotifications = mysqlTable("email_notifications", {
	id: varchar({ length: 36 }).notNull(),
	type: mysqlEnum(['reviewer_invitation','review_assignment','author_result','password_reset']).notNull(),
	recipientEmail: varchar("recipient_email", { length: 255 }).notNull(),
	relatedId: varchar("related_id", { length: 36 }),
	subject: varchar({ length: 500 }).notNull(),
	htmlBody: text("html_body").notNull(),
	status: mysqlEnum(['pending','sent','failed']).default('pending').notNull(),
	errorMessage: text("error_message"),
	sentAt: timestamp("sent_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).onUpdateNow().notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "email_notifications_id"}),
]);

export const eventRegistrations = mysqlTable("event_registrations", {
	id: varchar({ length: 36 }).notNull(),
	fullName: varchar("full_name", { length: 255 }).notNull(),
	affiliation: varchar({ length: 500 }),
	phone: varchar({ length: 20 }),
	email: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "event_registrations_id"}),
	unique("event_registrations_email_unique").on(table.email),
]);

export const passwordSetupTokens = mysqlTable("password_setup_tokens", {
	id: varchar({ length: 36 }).notNull(),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
	tokenHash: varchar("token_hash", { length: 64 }).notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	usedAt: timestamp("used_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "password_setup_tokens_id"}),
	unique("password_setup_tokens_token_hash_unique").on(table.tokenHash),
]);

export const registrations = mysqlTable("registrations", {
	id: varchar({ length: 36 }).notNull(),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
	type: mysqlEnum(['student','general']).notNull(),
	paymentStatus: mysqlEnum("payment_status", ['pending','confirmed']).default('pending').notNull(),
	confirmedBy: varchar("confirmed_by", { length: 36 }).references(() => users.id),
	registeredAt: timestamp("registered_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "registrations_id"}),
]);

export const reviewRounds = mysqlTable("review_rounds", {
	id: varchar({ length: 36 }).notNull(),
	submissionId: varchar("submission_id", { length: 36 }).notNull().references(() => submissions.id),
	roundNumber: int("round_number").notNull(),
	status: mysqlEnum(['assigning','in_review','ready_for_decision','released']).default('assigning').notNull(),
	decision: mysqlEnum(['accept','reject','revise']),
	adminNote: text("admin_note"),
	decidedBy: varchar("decided_by", { length: 36 }).references(() => users.id),
	decidedAt: timestamp("decided_at", { mode: 'string' }),
	releasedAt: timestamp("released_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).onUpdateNow().notNull(),
	submissionVersionId: varchar("submission_version_id", { length: 36 }).references(() => submissionVersions.id),
},
(table) => [
	primaryKey({ columns: [table.id], name: "review_rounds_id"}),
	unique("review_rounds_submission_round_unique").on(table.submissionId, table.roundNumber),
]);

export const reviewerAssignments = mysqlTable("reviewer_assignments", {
	id: int().autoincrement().notNull(),
	reviewerId: varchar("reviewer_id", { length: 36 }).notNull().references(() => users.id),
	track: int().notNull(),
	maxPapers: int("max_papers").default(5).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "reviewer_assignments_id"}),
]);

export const reviewerExpertiseTracks = mysqlTable("reviewer_expertise_tracks", {
	id: int().autoincrement().notNull(),
	reviewerId: varchar("reviewer_id", { length: 36 }).notNull().references(() => users.id),
	track: int().notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "reviewer_expertise_tracks_id"}),
	unique("reviewer_expertise_track_unique").on(table.reviewerId, table.track),
]);

export const reviewerProfiles = mysqlTable("reviewer_profiles", {
	userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
	maxConcurrentReviews: int("max_concurrent_reviews").default(5).notNull(),
	active: int().default(1).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).onUpdateNow().notNull(),
},
(table) => [
	primaryKey({ columns: [table.userId], name: "reviewer_profiles_user_id"}),
]);

export const reviews = mysqlTable("reviews", {
	id: varchar({ length: 36 }).notNull(),
	submissionId: varchar("submission_id", { length: 36 }).notNull().references(() => submissions.id),
	reviewerId: varchar("reviewer_id", { length: 36 }).notNull().references(() => users.id),
	recommendation: mysqlEnum(['accept','reject','revise']),
	commentsToAuthor: text("comments_to_author"),
	commentsToEditor: text("comments_to_editor"),
	status: mysqlEnum(['assigned','sent','in_progress','completed']).default('assigned').notNull(),
	assignedAt: timestamp("assigned_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	roundId: varchar("round_id", { length: 36 }).notNull().references(() => reviewRounds.id),
	dueAt: timestamp("due_at", { mode: 'string' }),
	sentAt: timestamp("sent_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).onUpdateNow().notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "reviews_id"}),
	unique("reviews_round_reviewer_unique").on(table.roundId, table.reviewerId),
]);

export const revisions = mysqlTable("revisions", {
	id: varchar({ length: 36 }).notNull(),
	submissionId: varchar("submission_id", { length: 36 }).notNull().references(() => submissions.id),
	version: int().notNull(),
	fileUrl: varchar("file_url", { length: 500 }).notNull(),
	changelog: text(),
	submittedAt: timestamp("submitted_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "revisions_id"}),
]);

export const submissionVersions = mysqlTable("submission_versions", {
	id: varchar({ length: 36 }).notNull(),
	submissionId: varchar("submission_id", { length: 36 }).notNull().references(() => submissions.id),
	version: int().notNull(),
	kind: mysqlEnum(['initial','revision']).notNull(),
	title: varchar({ length: 500 }).notNull(),
	titleEn: varchar("title_en", { length: 500 }),
	abstract: text(),
	keywords: varchar({ length: 500 }),
	creators: text(),
	track: int().notNull(),
	submitterType: mysqlEnum("submitter_type", ['student','general']).default('student').notNull(),
	fileUrl: varchar("file_url", { length: 500 }),
	changelog: text(),
	submittedAt: timestamp("submitted_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	educationLevel: mysqlEnum("education_level", ['bachelor','master','doctorate']).notNull(),
	presentationFormat: mysqlEnum("presentation_format", ['oral','poster']).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "submission_versions_id"}),
	unique("submission_versions_submission_version_unique").on(table.submissionId, table.version),
]);

export const submissions = mysqlTable("submissions", {
	id: varchar({ length: 36 }).notNull(),
	authorId: varchar("author_id", { length: 36 }).notNull().references(() => users.id),
	title: varchar({ length: 500 }).notNull(),
	abstract: text(),
	keywords: varchar({ length: 500 }),
	track: int().notNull(),
	status: mysqlEnum(['draft','submitted','under_review','accepted','rejected','revision_requested']).default('draft').notNull(),
	abstractFileUrl: varchar("abstract_file_url", { length: 500 }),
	fullPaperFileUrl: varchar("full_paper_file_url", { length: 500 }),
	submittedAt: timestamp("submitted_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).onUpdateNow().notNull(),
	titleEn: varchar("title_en", { length: 500 }),
	creators: text(),
	submitterType: mysqlEnum("submitter_type", ['student','general']).default('student').notNull(),
	paymentSlipUrl: varchar("payment_slip_url", { length: 500 }),
	educationLevel: mysqlEnum("education_level", ['bachelor','master','doctorate']).notNull(),
	presentationFormat: mysqlEnum("presentation_format", ['oral','poster']).notNull(),
	paymentStatus: mysqlEnum("payment_status", ['unpaid','pending_verification','verified','rejected']).default('unpaid').notNull(),
	paymentVerifiedBy: varchar("payment_verified_by", { length: 36 }).references(() => users.id),
	paymentVerifiedAt: timestamp("payment_verified_at", { mode: 'string' }),
	paymentNote: text("payment_note"),
	round1FileUrl: varchar("round1_file_url", { length: 500 }),
	round1FileType: mysqlEnum("round1_file_type", ['abstract','full_paper']),
},
(table) => [
	primaryKey({ columns: [table.id], name: "submissions_id"}),
]);

export const users = mysqlTable("users", {
	id: varchar({ length: 36 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	passwordHash: varchar("password_hash", { length: 255 }),
	name: varchar({ length: 255 }).notNull(),
	affiliation: varchar({ length: 500 }),
	role: mysqlEnum(['author','reviewer','admin']).default('author').notNull(),
	oauthProvider: varchar("oauth_provider", { length: 50 }),
	oauthId: varchar("oauth_id", { length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).onUpdateNow().notNull(),
	phone: varchar({ length: 20 }),
},
(table) => [
	primaryKey({ columns: [table.id], name: "users_id"}),
	unique("users_email_unique").on(table.email),
]);
