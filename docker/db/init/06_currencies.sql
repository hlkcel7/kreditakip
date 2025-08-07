DROP TABLE IF EXISTS `currencies`;
CREATE TABLE `currencies` (
  `id` varchar(36) NOT NULL,
  `code` text NOT NULL,
  `name` text NOT NULL,
  `symbol` text,
  `is_active` boolean DEFAULT true,
  PRIMARY KEY (`id`),
  UNIQUE KEY `currencies_code_unique` (`code`(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
