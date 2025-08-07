ALTER TABLE `guarantee_letters` MODIFY COLUMN `letter_type` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `guarantee_letters` MODIFY COLUMN `currency` varchar(3) NOT NULL;--> statement-breakpoint
ALTER TABLE `guarantee_letters` MODIFY COLUMN `status` varchar(20) NOT NULL DEFAULT 'aktif';--> statement-breakpoint
ALTER TABLE `credits` ADD `bsmv_and_other_costs` decimal(15,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `guarantee_letters` DROP COLUMN `letter_date`;