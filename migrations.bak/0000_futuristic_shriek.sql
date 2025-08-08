CREATE TABLE `banks` (
	`id` varchar(36) NOT NULL,
	`name` text NOT NULL,
	`code` text,
	`branch_name` text,
	`contact_person` text,
	`phone` text,
	`email` text,
	`address` text,
	`status` text NOT NULL DEFAULT ('active'),
	`created_at` datetime NOT NULL,
	CONSTRAINT `banks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `credits` (
	`id` varchar(36) NOT NULL,
	`bank_id` varchar(36) NOT NULL,
	`project_id` varchar(36) NOT NULL,
	`principal_amount` decimal(15,2) NOT NULL,
	`interest_amount` decimal(15,2) NOT NULL,
	`total_repaid_amount` decimal(15,2) NOT NULL DEFAULT '0',
	`currency` text NOT NULL,
	`credit_date` date NOT NULL,
	`maturity_date` date NOT NULL,
	`status` text NOT NULL DEFAULT ('devam-ediyor'),
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `credits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `currencies` (
	`id` varchar(36) NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`symbol` text,
	`is_active` boolean DEFAULT true,
	CONSTRAINT `currencies_id` PRIMARY KEY(`id`),
	CONSTRAINT `currencies_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `exchange_rates` (
	`id` varchar(36) NOT NULL,
	`from_currency` text NOT NULL,
	`to_currency` text NOT NULL,
	`rate` decimal(12,6) NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `exchange_rates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `guarantee_letters` (
	`id` varchar(36) NOT NULL,
	`bank_id` varchar(36) NOT NULL,
	`project_id` varchar(36) NOT NULL,
	`letter_type` varchar(50) NOT NULL,
	`contract_amount` decimal(15,2) NOT NULL,
	`letter_percentage` decimal(5,2) NOT NULL,
	`letter_amount` decimal(15,2) NOT NULL,
	`commission_rate` decimal(5,2) NOT NULL,
	`bsmv_and_other_costs` decimal(15,2) NOT NULL DEFAULT '0',
	`currency` text NOT NULL,
	`purchase_date` date NOT NULL,
	`expiry_date` date,
	`status` text NOT NULL DEFAULT ('aktif'),
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `guarantee_letters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` varchar(36) NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`status` text NOT NULL DEFAULT ('active'),
	`created_at` datetime NOT NULL,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `credits` ADD CONSTRAINT `credits_bank_id_banks_id_fk` FOREIGN KEY (`bank_id`) REFERENCES `banks`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `credits` ADD CONSTRAINT `credits_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `guarantee_letters` ADD CONSTRAINT `guarantee_letters_bank_id_banks_id_fk` FOREIGN KEY (`bank_id`) REFERENCES `banks`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `guarantee_letters` ADD CONSTRAINT `guarantee_letters_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;