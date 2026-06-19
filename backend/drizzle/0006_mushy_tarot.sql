ALTER TABLE `submissions` ADD `payment_status` enum('unpaid','pending_verification','verified','rejected') NOT NULL DEFAULT 'unpaid';
--> statement-breakpoint
ALTER TABLE `submissions` ADD `payment_verified_by` varchar(36);
--> statement-breakpoint
ALTER TABLE `submissions` ADD `payment_verified_at` timestamp;
--> statement-breakpoint
ALTER TABLE `submissions` ADD `payment_note` text;
--> statement-breakpoint
ALTER TABLE `submissions` ADD CONSTRAINT `submissions_payment_verified_by_users_id_fk` FOREIGN KEY (`payment_verified_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
UPDATE `submissions` SET `status` = 'submitted', `payment_status` = 'pending_verification' WHERE `status` IN ('pending_payment', 'payment_verifying');
--> statement-breakpoint
UPDATE `submissions` SET `payment_status` = 'verified' WHERE `status` = 'submitted' AND `payment_slip_url` IS NOT NULL AND `payment_slip_url` != '';
--> statement-breakpoint
ALTER TABLE `submissions` MODIFY COLUMN `status` enum('draft','submitted','under_review','accepted','rejected','revision_requested') NOT NULL DEFAULT 'draft';
