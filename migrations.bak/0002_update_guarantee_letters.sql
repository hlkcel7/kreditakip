DROP TABLE IF EXISTS guarantee_letters;

CREATE TABLE `guarantee_letters` (
  `id` varchar(36) NOT NULL,
  `bank_id` varchar(36) NOT NULL,
  `project_id` varchar(36) NOT NULL,
  `letter_type` text NOT NULL,
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
  CONSTRAINT `guarantee_letters_id` PRIMARY KEY(`id`),
  CONSTRAINT `guarantee_letters_bank_id_banks_id_fk` FOREIGN KEY (`bank_id`) REFERENCES `banks`(`id`),
  CONSTRAINT `guarantee_letters_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`)
);
