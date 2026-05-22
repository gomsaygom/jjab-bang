require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool   = require('./src/config/db');

async function main() {
  const hash = await bcrypt.hash('admin1234', 10);
  await pool.query(
    "UPDATE users SET password = ?, is_verified = 1 WHERE email = 'admin@jjab-bang.com'",
    [hash]
  );
  console.log('✅ 관리자 비밀번호 초기화 완료!');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });