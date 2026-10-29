CREATE TABLE `receipt_audit_logs` (
	`id` varchar(36) NOT NULL,
	`submission_id` varchar(36) NOT NULL,
	`changed_by` varchar(36),
	`source` enum('receipt_edit','upload_slip','submission_form','event_sync') NOT NULL,
	`old_receipt_name` varchar(255),
	`old_receipt_tax_id` varchar(20),
	`old_receipt_address` text,
	`new_receipt_name` varchar(255),
	`new_receipt_tax_id` varchar(20),
	`new_receipt_address` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `receipt_audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `receipt_audit_logs` ADD CONSTRAINT `receipt_audit_logs_submission_id_submissions_id_fk` FOREIGN KEY (`submission_id`) REFERENCES `submissions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `receipt_audit_logs` ADD CONSTRAINT `receipt_audit_logs_changed_by_users_id_fk` FOREIGN KEY (`changed_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;