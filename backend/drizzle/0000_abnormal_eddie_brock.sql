CREATE TABLE `registrations` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`type` enum('student','general') NOT NULL,
	`payment_status` enum('pending','confirmed') NOT NULL DEFAULT 'pending',
	`confirmed_by` varchar(36),
	`registered_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `registrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviewer_assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reviewer_id` varchar(36) NOT NULL,
	`track` int NOT NULL,
	`max_papers` int NOT NULL DEFAULT 5,
	CONSTRAINT `reviewer_assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` varchar(36) NOT NULL,
	`submission_id` varchar(36) NOT NULL,
	`reviewer_id` varchar(36) NOT NULL,
	`score` int,
	`recommendation` enum('accept','reject','revise'),
	`comments_to_author` text,
	`comments_to_editor` text,
	`status` enum('pending','completed') NOT NULL DEFAULT 'pending',
	`assigned_at` timestamp NOT NULL DEFAULT (now()),
	`completed_at` timestamp,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `revisions` (
	`id` varchar(36) NOT NULL,
	`submission_id` varchar(36) NOT NULL,
	`version` int NOT NULL,
	`file_url` varchar(500) NOT NULL,
	`changelog` text,
	`submitted_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `revisions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` varchar(36) NOT NULL,
	`author_id` varchar(36) NOT NULL,
	`title` varchar(500) NOT NULL,
	`title_en` varchar(500),
	`abstract` text,
	`keywords` varchar(500),
	`track` int NOT NULL,
	`status` enum('draft','pending_payment','submitted','under_review','accepted','rejected','revision_requested') NOT NULL DEFAULT 'draft',
	`abstract_file_url` varchar(500),
	`full_paper_file_url` varchar(500),
	`submitted_at` timestamp,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255),
	`name` varchar(255) NOT NULL,
	`affiliation` varchar(500),
	`phone` varchar(20),
	`role` enum('author','reviewer','admin') NOT NULL DEFAULT 'author',
	`oauth_provider` varchar(50),
	`oauth_id` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `registrations` ADD CONSTRAINT `registrations_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `registrations` ADD CONSTRAINT `registrations_confirmed_by_users_id_fk` FOREIGN KEY (`confirmed_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviewer_assignments` ADD CONSTRAINT `reviewer_assignments_reviewer_id_users_id_fk` FOREIGN KEY (`reviewer_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_submission_id_submissions_id_fk` FOREIGN KEY (`submission_id`) REFERENCES `submissions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_reviewer_id_users_id_fk` FOREIGN KEY (`reviewer_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `revisions` ADD CONSTRAINT `revisions_submission_id_submissions_id_fk` FOREIGN KEY (`submission_id`) REFERENCES `submissions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `submissions` ADD CONSTRAINT `submissions_author_id_users_id_fk` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;