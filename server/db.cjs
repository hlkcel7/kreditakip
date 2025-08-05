const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "192.168.0.201",
  user: "root",
  password: "A1s1d1f1",
  database: "gorkem"
});

connection.connect((err) => {
  if (err) {
    console.error("MySQL bağlantı hatası:", err);
    process.exit(1);
  }
  console.log("MySQL bağlantısı başarılı!");

  // Örnek sorgu: Tablo oluşturma
  const createProjectsTable = `CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(36) PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at DATETIME NOT NULL
  )`;

  connection.query(createProjectsTable, (err) => {
    if (err) {
      console.error("projects tablosu oluşturulamadı:", err);
    } else {
      console.log("projects tablosu hazır.");
    }
    connection.end();
  });
});
