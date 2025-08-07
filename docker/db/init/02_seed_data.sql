-- Currencies
INSERT INTO currencies (id, code, name, symbol) VALUES
('1', 'TRY', 'Türk Lirası', '₺'),
('2', 'USD', 'Amerikan Doları', '$'),
('3', 'EUR', 'Euro', '€');

-- Exchange Rates
INSERT INTO exchange_rates (id, currency_code, rate, date) VALUES
('1', 'USD', 27.50, '2025-08-07'),
('2', 'EUR', 30.20, '2025-08-07');
