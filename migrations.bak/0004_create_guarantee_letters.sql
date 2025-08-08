CREATE TABLE guarantee_letters (
  id VARCHAR(36) PRIMARY KEY NOT NULL,
  bank_id VARCHAR(36) NOT NULL,
  project_id VARCHAR(36) NOT NULL,
  letter_type VARCHAR(50) NOT NULL,
  
  contract_amount DECIMAL(15,2) NOT NULL,
  letter_percentage DECIMAL(5,2) NOT NULL,
  letter_amount DECIMAL(15,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  bsmv_and_other_costs DECIMAL(15,2) NOT NULL DEFAULT '0',
  
  currency VARCHAR(3) NOT NULL,
  
  purchase_date DATE NOT NULL,
  expiry_date DATE,
  
  status VARCHAR(20) NOT NULL DEFAULT 'aktif',
  notes TEXT,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (bank_id) REFERENCES banks(id),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
