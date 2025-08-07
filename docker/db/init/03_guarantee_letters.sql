DROP TABLE IF EXISTS `guarantee_letters`;
CREATE TABLE `guarantee_letters` (
  `id` varchar(36) NOT NULL,
  `bank_id` varchar(36) NOT NULL,
  `project_id` varchar(36) NOT NULL,
  `letter_type` varchar(50) NOT NULL,
  `contract_amount` decimal(15,2) NOT NULL,
  `letter_percentage` decimal(5,2) NOT NULL,
  `letter_amount` decimal(15,2) NOT NULL,
  `commission_rate` decimal(5,2) NOT NULL,
  `bsmv_and_other_costs` decimal(15,2) NOT NULL DEFAULT '0.00',
  `currency` varchar(3) NOT NULL,
  `purchase_date` date NOT NULL,
  `expiry_date` date,
  `status` varchar(20) NOT NULL DEFAULT 'aktif',
  `notes` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`bank_id`) REFERENCES `banks` (`id`),
  FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
