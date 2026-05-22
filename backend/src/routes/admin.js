const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.use(authMiddleware, adminMiddleware);

// 대시보드 통계
router.get('/dashboard', async (req, res) => {
  try {
    const [[{ totalUsers }]]      = await pool.query('SELECT COUNT(*) as totalUsers FROM users');
    const [[{ totalProperties }]] = await pool.query('SELECT COUNT(*) as totalProperties FROM properties');
    const [[{ pendingCerts }]]    = await pool.query("SELECT COUNT(*) as pendingCerts FROM certifications WHERE status = 'pending'");
    const [[{ totalReports }]]    = await pool.query('SELECT COUNT(*) as totalReports FROM reports');
    const [recentUsers]           = await pool.query(
      'SELECT id, nickname, email, created_at FROM users ORDER BY created_at DESC LIMIT 5'
    );
    res.json({ totalUsers, totalProperties, pendingCerts, totalReports, recentUsers });
  } catch (err) {
    res.status(500).json({ message: '서버 오류' });
  }
});

// 인증 서류 목록
router.get('/certifications', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.id, c.file_path, c.status, c.created_at, u.email, u.nickname
       FROM certifications c JOIN users u ON c.user_id = u.id
       ORDER BY c.created_at ASC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '서버 오류' });
  }
});

// 인증 승인/거절
router.patch('/certifications/:id', async (req, res) => {
  const { status } = req.body;
  try {
    await pool.query('UPDATE certifications SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: status === 'approved' ? '인증이 승인되었습니다.' : '인증이 거절되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류' });
  }
});

// 신고된 리뷰 목록
router.get('/reports', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.id, r.review_id, r.reason, r.created_at, u.nickname
       FROM reports r
       JOIN users u ON r.user_id = u.id
       ORDER BY r.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '서버 오류' });
  }
});

// 리뷰 숨김
router.patch('/reviews/:id/hide', async (req, res) => {
  try {
    await pool.query('UPDATE reviews SET is_hidden = 1 WHERE id = ?', [req.params.id]);
    res.json({ message: '리뷰를 숨겼습니다.' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류' });
  }
});

// 회원 목록
router.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, email, nickname, role, is_verified, is_banned, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '서버 오류' });
  }
});

// 회원 정지
router.patch('/users/:id/ban', async (req, res) => {
  try {
    await pool.query('UPDATE users SET is_banned = 1 WHERE id = ?', [req.params.id]);
    res.json({ message: '회원이 정지되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류' });
  }
});

// 회원 정지 해제
router.patch('/users/:id/unban', async (req, res) => {
  try {
    await pool.query('UPDATE users SET is_banned = 0 WHERE id = ?', [req.params.id]);
    res.json({ message: '정지가 해제되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류' });
  }
});

module.exports = router;