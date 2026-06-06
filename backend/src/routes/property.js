const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

router.get('/', async (req, res) => {
  const { type, deal_type, min_price, max_price, district, name, lawd_cd } = req.query;
  try {
    let query = 'SELECT * FROM properties WHERE 1=1';
    const params = [];

    if (type)      { query += ' AND type = ?';        params.push(type); }
    if (deal_type) { query += ' AND deal_type = ?';   params.push(deal_type); }
    if (district)  { query += ' AND district LIKE ?'; params.push(`%${district}%`); }
    if (lawd_cd)   { query += ' AND lawd_cd = ?';     params.push(lawd_cd); }
    if (min_price) { query += ' AND price >= ?';      params.push(min_price); }
    if (max_price) { query += ' AND price <= ?';      params.push(max_price); }
    if (name)      { query += ' AND name LIKE ?';     params.push(`%${name}%`); }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '서버 오류' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM properties WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: '매물을 찾을 수 없습니다.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: '서버 오류' });
  }
});

router.post('/:id/favorite', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const propertyId = req.params.id;
  try {
    const [exist] = await pool.query(
      'SELECT id FROM favorites WHERE user_id = ? AND property_id = ?',
      [userId, propertyId]
    );
    if (exist.length > 0) {
      await pool.query('DELETE FROM favorites WHERE user_id = ? AND property_id = ?', [userId, propertyId]);
      return res.json({ favorited: false });
    }
    await pool.query('INSERT INTO favorites (user_id, property_id) VALUES (?, ?)', [userId, propertyId]);
    res.json({ favorited: true });
  } catch (err) {
    res.status(500).json({ message: '서버 오류' });
  }
});

router.get('/my/favorites', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.* FROM properties p
       JOIN favorites f ON p.id = f.property_id
       WHERE f.user_id = ?`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '서버 오류' });
  }
});

router.get('/:id/jeonse-rate', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM properties WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: '매물을 찾을 수 없습니다.' });

    const property = rows[0];
    const [avgRows] = await pool.query(
      `SELECT AVG(price) as avg_sale FROM properties
       WHERE district = ? AND type = ? AND deal_type = '매매'`,
      [property.district, property.type]
    );

    const avgSalePrice = avgRows[0].avg_sale;
    if (!avgSalePrice || property.deal_type !== '전세/월세') {
      return res.json({ rate: null, message: '전세가율 계산 불가' });
    }

    const rate = ((property.price / avgSalePrice) * 100).toFixed(1);
    const risk = rate >= 80 ? 'HIGH' : rate >= 60 ? 'MID' : 'LOW';
    res.json({ rate: parseFloat(rate), avg_sale: avgSalePrice, risk });
  } catch (err) {
    res.status(500).json({ message: '서버 오류' });
  }
});

module.exports = router;