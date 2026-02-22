CREATE TABLE `events` (
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`creatorId` integer NOT NULL,
	`dateStart` text NOT NULL,
	`description` text DEFAULT '',
	`eventType` text NOT NULL,
	`eventULID` text NOT NULL,
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`location` text NOT NULL,
	`race` integer DEFAULT false NOT NULL,
	`subtitle` text NOT NULL,
	`timeStart` text,
	`title` text NOT NULL,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`nickname` text NOT NULL UNIQUE,
	`picture` text NOT NULL,
	`sub` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users_to_events` (
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`eventId` integer NOT NULL,
	`userId` integer NOT NULL,
	CONSTRAINT `users_to_events_pk` PRIMARY KEY(`userId`, `eventId`),
	CONSTRAINT `fk_users_to_events_eventId_events_id_fk` FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_users_to_events_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
CREATE INDEX `events_eventULID_idx` ON `events` (`eventULID`);--> statement-breakpoint
CREATE INDEX `users_sub_idx` ON `users` (`sub`);