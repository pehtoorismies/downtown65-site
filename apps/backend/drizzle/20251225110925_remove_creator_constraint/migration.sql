PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`eventULID` text NOT NULL,
	`title` text NOT NULL,
	`subtitle` text NOT NULL,
	`description` text DEFAULT '',
	`eventType` text NOT NULL,
	`dateStart` text NOT NULL,
	`timeStart` text,
	`location` text NOT NULL,
	`race` integer DEFAULT 0 NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`creatorId` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_events`(`id`, `eventULID`, `title`, `subtitle`, `description`, `eventType`, `dateStart`, `timeStart`, `location`, `race`, `createdAt`, `updatedAt`, `creatorId`) SELECT `id`, `eventULID`, `title`, `subtitle`, `description`, `eventType`, `dateStart`, `timeStart`, `location`, `race`, `createdAt`, `updatedAt`, `creatorId` FROM `events`;--> statement-breakpoint
DROP TABLE `events`;--> statement-breakpoint
ALTER TABLE `__new_events` RENAME TO `events`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `events_eventULID_idx` ON `events` (`eventULID`);