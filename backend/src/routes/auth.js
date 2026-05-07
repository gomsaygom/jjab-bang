const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/sendEmail');

// 회원가입
router.post('/register', async (req, res) => {
  const { email, password, nickname } = req.body;
  if (!email || !password || !nickname)
    return res.status(400).json({ message: '모든 필드를 입력해주세요.' });

  try {
    const [exist] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (exist.length > 0) return res.status(409).json({ message: '이미 사용 중인 이메일입니다.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const codeExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      'INSERT INTO users (email, password, nickname, verify_code, verify_code_expiry) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, nickname, verifyCode, codeExpiry]
    );

    await sendVerificationEmail(email, verifyCode);
    res.status(201).json({ message: '회원가입 완료! 이메일로 발송된 6자리 코드를 입력해주세요.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 이메일 인증 코드 확인
router.post('/verify-email', async (req, res) => {
  const { email, code } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT id FROM users WHERE email = ? AND verify_code = ? AND verify_code_expiry > NOW()',
      [email, code]
    );
    if (rows.length === 0)
      return res.status(400).json({ message: '인증 코드가 올바르지 않거나 만료되었습니다.' });

    await pool.query(
      'UPDATE users SET is_verified = 1, verify_code = NULL, verify_code_expiry = NULL WHERE email = ?',
      [email]
    );
    res.json({ message: '이메일 인증이 완료되었습니다!' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류' });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ message: '이메일 또는 비밀번호가 틀렸습니다.' });

    const user = rows[0];
    if (!user.is_verified) return res.status(403).json({ message: '이메일 인증이 필요합니다.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: '이메일 또는 비밀번호가 틀렸습니다.' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, email: user.email, nickname: user.nickname, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: '서버 오류' });
  }
});

// 비밀번호 찾기
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(404).json({ message: '등록되지 않은 이메일입니다.' });

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    await pool.query('UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?', [resetCode, expiry, email]);
    await sendPasswordResetEmail(email, resetCode);

    res.json({ message: '비밀번호 재설정 코드를 이메일로 발송했습니다.' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류' });
  }
});

// 비밀번호 재설정
router.post('/reset-password', async (req, res) => {
  const { email, code, password } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT id FROM users WHERE email = ? AND reset_token = ? AND reset_token_expiry > NOW()',
      [email, code]
    );
    if (rows.length === 0) return res.status(400).json({ message: '유효하지 않거나 만료된 코드입니다.' });

    const hashed = await bcrypt.hash(password, 10);
    await pool.query('UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE email = ?', [hashed, email]);

    res.json({ message: '비밀번호가 재설정되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류' });
  }
});

module.exports = router;