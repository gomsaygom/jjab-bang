const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const certStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `cert_${Date.now()}${ext}`);
  },
});
const certUpload = multer({
  storage: certStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('jpg, png, pdf 파일만 업로드 가능합니다.'));
  },
});

const reviewStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `review_${Date.now()}${ext}`);
  },
});
const reviewUpload = multer({
  storage: reviewStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('jpg, png 파일만 업로드 가능합니다.'));
  },
});

// 인증 상태 확인 (/:id 보다 먼저!)
router.get('/cert-status', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT status FROM certifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [req.user.id]
    );
    res.json({ status: rows.length > 0 ? rows[0].status : null });
  } catch (err) {
    res.status(500).json({ message: '서버 오류' });
  }
});

// 내 리뷰 목록 (/:id 보다 먼저!)
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, p.name as property_name
       FROM reviews r
       LEFT JOIN properties p ON r.property_id = p.id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '서버 오류' });
  }
});

// 인증 파일 업로드
router.post('/certify', authMiddleware, certUpload.single('cert_file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: '파일을 업로드해주세요.' });
  try {
    await pool.query(
      'INSERT INTO certifications (user_id, file_path, status) VALUES (?, ?, ?)',
      [req.user.id, req.file.filename, 'pending']
    );
    res.json({ message: '인증 서류가 제출되었습니다. 관리자 검토 후 리뷰 작성이 가능합니다.' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류' });
  }
});

// 특정 매물 리뷰 목록
router.get('/property/:propertyId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.id, r.noise, r.sunlight, r.water_pressure, r.management_fee, r.environment,
              r.content, r.image_path, r.created_at
       FROM reviews r
       WHERE r.property_id = ? AND r.is_hidden = 0
       ORDER BY r.created_at DESC`,
      [req.params.propertyId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '서버 오류' });
  }
});

// 리뷰 작성
router.post('/', authMiddleware, reviewUpload.single('review_image'), async (req, res) => {
  const { property_id, noise, sunlight, water_pressure, management_fee, environment, content } = req.body;
  const image_path = req.file ? req.file.filename : null;
  try {
    const [cert] = await pool.query(
      'SELECT id FROM certifications WHERE user_id = ? AND status = ?',
      [req.user.id, 'approved']
    );
    if (cert.length === 0)
      return res.status(403).json({ message: '계약서/영수증 인증 후 리뷰 작성이 가능합니다.' });

    const [dup] = await pool.query(
      'SELECT id FROM reviews WHERE user_id = ? AND property_id = ?',
      [req.user.id, property_id]
    );
    if (dup.length > 0)
      return res.status(409).json({ message: '이미 리뷰를 작성한 매물입니다.' });

    await pool.query(
      `INSERT INTO reviews (user_id, property_id, noise, sunlight, water_pressure, management_fee, environment, content, image_path)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, property_id, noise, sunlight, water_pressure, management_fee, environment, content, image_path]
    );
    res.status(201).json({ message: '리뷰가 등록되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류' });
  }
});

// 리뷰 수정
router.put('/:id', authMiddleware, async (req, res) => {
  const { noise, sunlight, water_pressure, management_fee, environment, content } = req.body;
  try {
    const [rows] = await pool.query('SELECT user_id FROM reviews WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: '리뷰를 찾을 수 없습니다.' });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: '권한 없음' });

    await pool.query(
      `UPDATE reviews SET noise=?, sunlight=?, water_pressure=?, management_fee=?, environment=?, content=? WHERE id=?`,
      [noise, sunlight, water_pressure, management_fee, environment, content, req.params.id]
    );
    res.json({ message: '리뷰가 수정되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류' });
  }
});

// 리뷰 삭제
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT user_id FROM reviews WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: '리뷰를 찾을 수 없습니다.' });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: '권한 없음' });

    await pool.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    res.json({ message: '리뷰가 삭제되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류' });
  }
});

// 리뷰 신고
router.post('/:id/report', authMiddleware, async (req, res) => {
  const { reason } = req.body;
  try {
    await pool.query(
      'INSERT INTO reports (user_id, review_id, reason) VALUES (?, ?, ?)',
      [req.user.id, req.params.id, reason]
    );
    const [count] = await pool.query('SELECT COUNT(*) as cnt FROM reports WHERE review_id = ?', [req.params.id]);
    if (count[0].cnt >= 5) {
      await pool.query('UPDATE reviews SET is_hidden = 1 WHERE id = ?', [req.params.id]);
    }
    res.json({ message: '신고가 접수되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류' });
  }
});

module.exports = router;