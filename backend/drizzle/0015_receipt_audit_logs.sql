CREATE TABLE IF NOT EXISTS `receipt_audit_logs` (
	`id` varchar(36) NOT NULL,
	`submission_id` varchar(36) NOT NULL,
	`changed_by` varchar(36) DEFAULT NULL,
	`source` enum('receipt_edit','upload_slip','submission_form','event_sync') NOT NULL,
	`old_receipt_name` varchar(255) DEFAULT NULL,
	`old_receipt_tax_id` varchar(20) DEFAULT NULL,
	`old_receipt_address` text,
	`new_receipt_name` varchar(255) DEFAULT NULL,
	`new_receipt_tax_id` varchar(20) DEFAULT NULL,
	`new_receipt_address` text,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `receipt_audit_logs_id` PRIMARY KEY(`id`),
	KEY `idx_receipt_audit_logs_submission_id` (`submission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
