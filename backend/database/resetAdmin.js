require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function resetAdmin() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'smartphone_store'
    });

    const email = 'admin@smartphonestore.com';
    const plainPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const [users] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);

    if (users.length > 0) {
      await connection.query(
        `UPDATE users
         SET name = ?, password = ?, role = 'admin', is_active = 1
         WHERE email = ?`,
        ['Admin Store', hashedPassword, email]
      );
      console.log('Admin account updated successfully.');
    } else {
      await connection.query(
        `INSERT INTO users (name, email, password, role, phone, is_active)
         VALUES (?, ?, ?, 'admin', ?, 1)`,
        ['Admin Store', email, hashedPassword, '081234567890']
      );
      console.log('Admin account created successfully.');
    }

    console.log('Email   : admin@smartphonestore.com');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Failed to reset admin:', error.message);
    process.exitCode = 1;
  } finally {
    if (connection) await connection.end();
  }
}

resetAdmin();
