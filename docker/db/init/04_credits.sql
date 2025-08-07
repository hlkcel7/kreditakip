DROP TABLE IF EXISTS `credits`;
CREATE TABLE `credits` (
  `id` varchar(36) NOT NULL,
  `bank_id` varchar(36) NOT NULL,
  `project_id` varchar(36) NOT NULL,
  `principal_amount` decimal(15,2) NOT NULL,
  `interest_amount` decimal(15,2) NOT NULL,
  `bsmv_and_other_costs` decimal(15,2) NOT NULL DEFAULT '0.00',
  `total_repaid_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `currency` text NOT NULL,
  `credit_date` date NOT NULL,
  `maturity_date` date NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'devam-ediyor',
  `notes` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`bank_id`) REFERENCES `banks` (`id`),
  FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
