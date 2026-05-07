const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.use(authMiddleware, adminMiddleware);

// 대시보드 통계
router.get('/dashboard', async (req, res) => {
  try {
    const [[{ total_users }]] = await pool.query('SELECT COUNT(*) as total_users FROM users');
    const [[{ total_reviews }]] = await pool.query('SELECT COUNT(*) as total_reviews FROM reviews');
    const [[{ pending_certs }]] = await pool.query("SELECT COUNT(*) as pending_certs FROM certifications WHERE status = 'pending'");
    const [[{ total_reports }]] = await pool.query('SELECT COUNT(*) as total_reports FROM reports');

    const [popular] = await pool.query(
      `SELECT p.id, p.name, p.district, COUNT(f.id) as fav_count
       FROM properties p JOIN favorites f ON p.id = f.property_id
       GROUP BY p.id ORDER BY fav_count DESC LIMIT 5`
    );

    res.json({ total_users, total_reviews, pending_certs, total_reports, popular_properties: popular });
  } catch (err) {
    res.status(500).json({ message: '서버 오류' });
  }
});

// 신고된 리뷰 목록
router.get('/reports', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.id as report_id, rv.id as review_id, rv.content, rv.is_hidden,
              COUNT(r.id) as report_count, rv.created_at
       FROM reports r JOIN reviews rv ON r.review_id = rv.id
       GROUP BY rv.id ORDER BY report_count DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '서버 오류' });
  }
});

// 리뷰 숨김/복구
router.patch('/reviews/:id/hide', async (req, res) => {
  const { hide } = req.body;
  try {
    await pool.query('UPDATE reviews SET is_hidden = ? WHERE id = ?', [hide ? 1 : 0, req.params.id]);
    res.json({ message: hide ? '리뷰를 숨겼습니다.' : '리뷰를 복구했습니다.' });
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
       WHERE c.status = 'pending' ORDER BY c.created_at ASC`
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

// 회원 정지/해제
router.patch('/users/:id/ban', async (req, res) => {
  const { ban } = req.body;
  try {
    await pool.query('UPDATE users SET is_banned = ? WHERE id = ?', [ban ? 1 : 0, req.params.id]);
    res.json({ message: ban ? '회원이 정지되었습니다.' : '정지가 해제되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류' });
  }
});

module.exports = router;