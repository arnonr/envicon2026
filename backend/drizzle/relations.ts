import { relations } from "drizzle-orm/relations";
import { users, passwordSetupTokens, registrations, reviewRounds, submissions, submissionVersions, reviewerAssignments, reviewerExpertiseTracks, reviewerProfiles, reviews, revisions } from "./schema";

export const passwordSetupTokensRelations = relations(passwordSetupTokens, ({one}) => ({
	user: one(users, {
		fields: [passwordSetupTokens.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	passwordSetupTokens: many(passwordSetupTokens),
	registrations_confirmedBy: many(registrations, {
		relationName: "registrations_confirmedBy_users_id"
	}),
	registrations_userId: many(registrations, {
		relationName: "registrations_userId_users_id"
	}),
	reviewRounds: many(reviewRounds),
	reviewerAssignments: many(reviewerAssignments),
	reviewerExpertiseTracks: many(reviewerExpertiseTracks),
	reviewerProfiles: many(reviewerProfiles),
	reviews: many(reviews),
	submissions_authorId: many(submissions, {
		relationName: "submissions_authorId_users_id"
	}),
	submissions_paymentVerifiedBy: many(submissions, {
		relationName: "submissions_paymentVerifiedBy_users_id"
	}),
}));

export const registrationsRelations = relations(registrations, ({one}) => ({
	user_confirmedBy: one(users, {
		fields: [registrations.confirmedBy],
		references: [users.id],
		relationName: "registrations_confirmedBy_users_id"
	}),
	user_userId: one(users, {
		fields: [registrations.userId],
		references: [users.id],
		relationName: "registrations_userId_users_id"
	}),
}));

export const reviewRoundsRelations = relations(reviewRounds, ({one, many}) => ({
	user: one(users, {
		fields: [reviewRounds.decidedBy],
		references: [users.id]
	}),
	submission: one(submissions, {
		fields: [reviewRounds.submissionId],
		references: [submissions.id]
	}),
	submissionVersion: one(submissionVersions, {
		fields: [reviewRounds.submissionVersionId],
		references: [submissionVersions.id]
	}),
	reviews: many(reviews),
}));

export const submissionsRelations = relations(submissions, ({one, many}) => ({
	reviewRounds: many(reviewRounds),
	reviews: many(reviews),
	revisions: many(revisions),
	submissionVersions: many(submissionVersions),
	user_authorId: one(users, {
		fields: [submissions.authorId],
		references: [users.id],
		relationName: "submissions_authorId_users_id"
	}),
	user_paymentVerifiedBy: one(users, {
		fields: [submissions.paymentVerifiedBy],
		references: [users.id],
		relationName: "submissions_paymentVerifiedBy_users_id"
	}),
}));

export const submissionVersionsRelations = relations(submissionVersions, ({one, many}) => ({
	reviewRounds: many(reviewRounds),
	submission: one(submissions, {
		fields: [submissionVersions.submissionId],
		references: [submissions.id]
	}),
}));

export const reviewerAssignmentsRelations = relations(reviewerAssignments, ({one}) => ({
	user: one(users, {
		fields: [reviewerAssignments.reviewerId],
		references: [users.id]
	}),
}));

export const reviewerExpertiseTracksRelations = relations(reviewerExpertiseTracks, ({one}) => ({
	user: one(users, {
		fields: [reviewerExpertiseTracks.reviewerId],
		references: [users.id]
	}),
}));

export const reviewerProfilesRelations = relations(reviewerProfiles, ({one}) => ({
	user: one(users, {
		fields: [reviewerProfiles.userId],
		references: [users.id]
	}),
}));

export const reviewsRelations = relations(reviews, ({one}) => ({
	user: one(users, {
		fields: [reviews.reviewerId],
		references: [users.id]
	}),
	reviewRound: one(reviewRounds, {
		fields: [reviews.roundId],
		references: [reviewRounds.id]
	}),
	submission: one(submissions, {
		fields: [reviews.submissionId],
		references: [submissions.id]
	}),
}));

export const revisionsRelations = relations(revisions, ({one}) => ({
	submission: one(submissions, {
		fields: [revisions.submissionId],
		references: [submissions.id]
	}),
}));