const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'kreditakip',
});

connection.connect((err) => {
  if (err) {
    console.error('Bağlantı hatası:', err);
    process.exit(1);
  }
  console.log('MariaDB bağlantısı başarılı!');

  // Tablo oluşturma örneği
  const createProjectsTable = `CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(36) PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at DATETIME NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

  connection.query(createProjectsTable, (err) => {
    if (err) {
      console.error('projects tablosu oluşturulamadı:', err);
    } else {
      console.log('projects tablosu başarıyla oluşturuldu veya zaten mevcut.');
    }
    connection.end();
  });
});
