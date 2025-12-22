CREATE TABLE `events` (
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
	`createdBy` integer NOT NULL,
	CONSTRAINT `fk_events_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`auth0Sub` text NOT NULL,
	`nickname` text NOT NULL UNIQUE,
	`picture` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users_to_events` (
	`userId` integer NOT NULL,
	`eventId` integer NOT NULL,
	CONSTRAINT `users_to_events_pk` PRIMARY KEY(`userId`, `eventId`),
	CONSTRAINT `fk_users_to_events_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`),
	CONSTRAINT `fk_users_to_events_eventId_events_id_fk` FOREIGN KEY (`eventId`) REFERENCES `events`(`id`)
);
--> statement-breakpoint
CREATE INDEX `events_eventULID_idx` ON `events` (`eventULID`);--> statement-breakpoint
CREATE INDEX `users_auth0Sub_idx` ON `users` (`auth0Sub`);