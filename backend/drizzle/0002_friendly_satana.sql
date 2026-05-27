CREATE TABLE `submission_versions` (
	`id` varchar(36) NOT NULL,
	`submission_id` varchar(36) NOT NULL,
	`version` int NOT NULL,
	`kind` enum('initial','revision') NOT NULL,
	`title` varchar(500) NOT NULL,
	`title_en` varchar(500),
	`abstract` text,
	`keywords` varchar(500),
	`creators` text,
	`track` int NOT NULL,
	`submitter_type` enum('student','general') NOT NULL DEFAULT 'student',
	`file_url` varchar(500),
	`changelog` text,
	`submitted_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `submission_versions_id` PRIMARY KEY(`id`),
	CONSTRAINT `submission_versions_submission_version_unique` UNIQUE(`submission_id`,`version`)
);
--> statement-breakpoint
ALTER TABLE `review_rounds` ADD `submission_version_id` varchar(36);--> statement-breakpoint
ALTER TABLE `submission_versions` ADD CONSTRAINT `submission_versions_submission_id_submissions_id_fk` FOREIGN KEY (`submission_id`) REFERENCES `submissions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `review_rounds` ADD CONSTRAINT `review_rounds_submission_version_id_submission_versions_id_fk` FOREIGN KEY (`submission_version_id`) REFERENCES `submission_versions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
INSERT INTO `submission_versions` (
	`id`, `submission_id`, `version`, `kind`, `title`, `title_en`, `abstract`, `keywords`, `creators`, `track`,
	`submitter_type`, `file_url`, `changelog`, `submitted_at`
)
SELECT
	UUID(),
	s.`id`,
	COALESCE(latest_revision.`version` + 1, 1),
	CASE WHEN latest_revision.`id` IS NULL THEN 'initial' ELSE 'revision' END,
	s.`title`,
	s.`title_en`,
	s.`abstract`,
	s.`keywords`,
	s.`creators`,
	s.`track`,
	s.`submitter_type`,
	COALESCE(latest_revision.`file_url`, s.`full_paper_file_url`, s.`abstract_file_url`),
	latest_revision.`changelog`,
	COALESCE(latest_revision.`submitted_at`, s.`submitted_at`, NOW())
FROM `review_rounds` open_round
INNER JOIN `submissions` s ON s.`id` = open_round.`submission_id`
LEFT JOIN `revisions` latest_revision
	ON latest_revision.`submission_id` = s.`id`
	AND latest_revision.`version` = (
		SELECT MAX(revision_max.`version`)
		FROM `revisions` revision_max
		WHERE revision_max.`submission_id` = s.`id`
	)
WHERE open_round.`status` = 'assigning'
	AND open_round.`submission_version_id` IS NULL
	AND NOT EXISTS (
		SELECT 1
		FROM `reviews` dispatched_review
		WHERE dispatched_review.`round_id` = open_round.`id`
			AND dispatched_review.`status` <> 'assigned'
	)
	AND NOT EXISTS (
		SELECT 1
		FROM `submission_versions` existing_version
		WHERE existing_version.`submission_id` = s.`id`
	);--> statement-breakpoint
UPDATE `review_rounds` open_round
INNER JOIN `submission_versions` version_snapshot
	ON version_snapshot.`submission_id` = open_round.`submission_id`
	AND version_snapshot.`version` = (
		SELECT MAX(version_max.`version`)
		FROM `submission_versions` version_max
		WHERE version_max.`submission_id` = open_round.`submission_id`
	)
SET open_round.`submission_version_id` = version_snapshot.`id`
WHERE open_round.`status` = 'assigning'
	AND open_round.`submission_version_id` IS NULL
	AND NOT EXISTS (
		SELECT 1
		FROM `reviews` dispatched_review
		WHERE dispatched_review.`round_id` = open_round.`id`
			AND dispatched_review.`status` <> 'assigned'
	);
