CREATE TABLE `email_notifications` (
	`id` varchar(36) NOT NULL,
	`type` enum('reviewer_invitation','review_assignment','author_result') NOT NULL,
	`recipient_email` varchar(255) NOT NULL,
	`related_id` varchar(36),
	`subject` varchar(500) NOT NULL,
	`html_body` text NOT NULL,
	`status` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
	`error_message` text,
	`sent_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `event_registrations` (
	`id` varchar(36) NOT NULL,
	`full_name` varchar(255) NOT NULL,
	`affiliation` varchar(500),
	`phone` varchar(20),
	`email` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `event_registrations_id` PRIMARY KEY(`id`),
	CONSTRAINT `event_registrations_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `password_setup_tokens` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`token_hash` varchar(64) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`used_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `password_setup_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `password_setup_tokens_token_hash_unique` UNIQUE(`token_hash`)
);
--> statement-breakpoint
CREATE TABLE `review_rounds` (
	`id` varchar(36) NOT NULL,
	`submission_id` varchar(36) NOT NULL,
	`round_number` int NOT NULL,
	`status` enum('assigning','in_review','ready_for_decision','released') NOT NULL DEFAULT 'assigning',
	`decision` enum('accept','reject','revise'),
	`admin_note` text,
	`decided_by` varchar(36),
	`decided_at` timestamp,
	`released_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `review_rounds_id` PRIMARY KEY(`id`),
	CONSTRAINT `review_rounds_submission_round_unique` UNIQUE(`submission_id`,`round_number`)
);
--> statement-breakpoint
CREATE TABLE `reviewer_expertise_tracks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reviewer_id` varchar(36) NOT NULL,
	`track` int NOT NULL,
	CONSTRAINT `reviewer_expertise_tracks_id` PRIMARY KEY(`id`),
	CONSTRAINT `reviewer_expertise_track_unique` UNIQUE(`reviewer_id`,`track`)
);
--> statement-breakpoint
CREATE TABLE `reviewer_profiles` (
	`user_id` varchar(36) NOT NULL,
	`max_concurrent_reviews` int NOT NULL DEFAULT 5,
	`active` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviewer_profiles_user_id` PRIMARY KEY(`user_id`)
);
--> statement-breakpoint
ALTER TABLE `submissions` MODIFY COLUMN `status` enum('draft','pending_payment','payment_verifying','submitted','under_review','accepted','rejected','revision_requested') NOT NULL DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE `reviews` ADD `round_id` varchar(36);--> statement-breakpoint
ALTER TABLE `reviews` ADD `due_at` timestamp;--> statement-breakpoint
ALTER TABLE `reviews` ADD `sent_at` timestamp;--> statement-breakpoint
ALTER TABLE `reviews` ADD `updated_at` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `submissions` ADD `creators` text;--> statement-breakpoint
ALTER TABLE `submissions` ADD `submitter_type` enum('student','general') DEFAULT 'student' NOT NULL;--> statement-breakpoint
ALTER TABLE `submissions` ADD `payment_slip_url` varchar(500);--> statement-breakpoint
INSERT INTO `review_rounds` (`id`, `submission_id`, `round_number`, `status`, `created_at`, `updated_at`)
SELECT UUID(), `submission_id`, 1,
	CASE WHEN SUM(`status` = 'pending') > 0 THEN 'in_review' ELSE 'ready_for_decision' END,
	NOW(), NOW()
FROM `reviews`
GROUP BY `submission_id`;--> statement-breakpoint
UPDATE `reviews` r
INNER JOIN `review_rounds` rr ON rr.`submission_id` = r.`submission_id` AND rr.`round_number` = 1
SET r.`round_id` = rr.`id`;--> statement-breakpoint
ALTER TABLE `reviews` MODIFY COLUMN `status` enum('pending','assigned','sent','in_progress','completed') NOT NULL DEFAULT 'assigned';--> statement-breakpoint
UPDATE `reviews` SET `status` = 'sent', `sent_at` = `assigned_at` WHERE `status` = 'pending';--> statement-breakpoint
ALTER TABLE `reviews` MODIFY COLUMN `status` enum('assigned','sent','in_progress','completed') NOT NULL DEFAULT 'assigned';--> statement-breakpoint
ALTER TABLE `reviews` MODIFY COLUMN `round_id` varchar(36) NOT NULL;--> statement-breakpoint
INSERT INTO `reviewer_profiles` (`user_id`, `max_concurrent_reviews`, `active`, `created_at`, `updated_at`)
SELECT u.`id`, COALESCE(MAX(ra.`max_papers`), 5), 1, NOW(), NOW()
FROM `users` u
LEFT JOIN `reviewer_assignments` ra ON ra.`reviewer_id` = u.`id`
WHERE u.`role` = 'reviewer'
GROUP BY u.`id`;--> statement-breakpoint
INSERT INTO `reviewer_expertise_tracks` (`reviewer_id`, `track`)
SELECT DISTINCT `reviewer_id`, `track` FROM `reviewer_assignments`;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_round_reviewer_unique` UNIQUE(`round_id`,`reviewer_id`);--> statement-breakpoint
ALTER TABLE `password_setup_tokens` ADD CONSTRAINT `password_setup_tokens_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `review_rounds` ADD CONSTRAINT `review_rounds_submission_id_submissions_id_fk` FOREIGN KEY (`submission_id`) REFERENCES `submissions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `review_rounds` ADD CONSTRAINT `review_rounds_decided_by_users_id_fk` FOREIGN KEY (`decided_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviewer_expertise_tracks` ADD CONSTRAINT `reviewer_expertise_tracks_reviewer_id_users_id_fk` FOREIGN KEY (`reviewer_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviewer_profiles` ADD CONSTRAINT `reviewer_profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_round_id_review_rounds_id_fk` FOREIGN KEY (`round_id`) REFERENCES `review_rounds`(`id`) ON DELETE no action ON UPDATE no action;
