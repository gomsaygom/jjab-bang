const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authMiddleware: auth } = require('../middleware/auth');

// 즐겨찾기 목록 조회
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT f.property_id, p.name, p.district, p.type, p.deal_type, p.price
       FROM favorites f
       JOIN properties p ON f.property_id = p.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '서버 오류' });
  }
});

// 즐겨찾기 추가
router.post('/:propertyId', auth, async (req, res) => {
  try {
    await pool.query(
      'INSERT IGNORE INTO favorites (user_id, property_id) VALUES (?, ?)',
      [req.user.id, req.params.propertyId]
    );
    res.json({ message: '즐겨찾기 추가' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류' });
  }
});

// 즐겨찾기 삭제
router.delete('/:propertyId', auth, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM favorites WHERE user_id = ? AND property_id = ?',
      [req.user.id, req.params.propertyId]
    );
    res.json({ message: '즐겨찾기 삭제' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류' });
  }
});

// 즐겨찾기 여부 확인
router.get('/check/:propertyId', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id FROM favorites WHERE user_id = ? AND property_id = ?',
      [req.user.id, req.params.propertyId]
    );
    res.json({ isFavorite: rows.length > 0 });
  } catch (err) {
    res.status(500).json({ message: '서버 오류' });
  }
});

module.exports = router;