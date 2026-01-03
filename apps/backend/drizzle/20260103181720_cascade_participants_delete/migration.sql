PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users_to_events` (
	`userId` integer NOT NULL,
	`eventId` integer NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT `users_to_events_pk` PRIMARY KEY(`userId`, `eventId`),
	CONSTRAINT `fk_users_to_events_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`),
	CONSTRAINT `fk_users_to_events_eventId_events_id_fk` FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_users_to_events`(`userId`, `eventId`, `createdAt`) SELECT `userId`, `eventId`, `createdAt` FROM `users_to_events`;--> statement-breakpoint
DROP TABLE `users_to_events`;--> statement-breakpoint
ALTER TABLE `__new_users_to_events` RENAME TO `users_to_events`;--> statement-breakpoint
PRAGMA foreign_keys=ON;