const express = require('express');
const router = express.Router();
const axios = require('axios');
const pool = require('../config/db');

const API_KEY = process.env.PUBLIC_DATA_API_KEY;

const ENDPOINTS = {
  officetel_rent:  'https://apis.data.go.kr/1613000/RTMSDataSvcOffiRent/getRTMSDataSvcOffiRent',
  officetel_trade: 'https://apis.data.go.kr/1613000/RTMSDataSvcOffiTrade/getRTMSDataSvcOffiTrade',
  multi_rent:      'https://apis.data.go.kr/1613000/RTMSDataSvcRHRent/getRTMSDataSvcRHRent',
  multi_trade:     'https://apis.data.go.kr/1613000/RTMSDataSvcRHTrade/getRTMSDataSvcRHTrade',
};

router.post('/fetch', async (req, res) => {
  const { lawd_cd, deal_ymd } = req.body;
  if (!lawd_cd || !deal_ymd)
    return res.status(400).json({ message: 'lawd_cd, deal_ymd 필수' });

  let totalSaved = 0;
  const errors = [];

  for (const [dataType, url] of Object.entries(ENDPOINTS)) {
    try {
      const isRent   = dataType.includes('rent');
      const propType = dataType.includes('officetel') ? '오피스텔' : '연립다세대';
      const dealType = isRent ? '전세/월세' : '매매';

      const response = await axios.get(url, {
        params: { serviceKey: API_KEY, LAWD_CD: lawd_cd, DEAL_YMD: deal_ymd, numOfRows: 100, pageNo: 1 },
        timeout: 10000,
      });

      // JSON 응답 처리
      const data  = response.data;
      const items = data?.response?.body?.items?.item;
      if (!items) {
        console.warn(`[${dataType}] items 없음`);
        continue;
      }

      const list = Array.isArray(items) ? items : [items];
         console.log(`[${dataType}] ${list.length}건, 첫번째:`, JSON.stringify(list[0]));
      for (const item of list) {
        const name     = item.offiNm || item.mhouseNm || '';
        const district = (item.umdNm || '').trim();
        const year     = String(item.dealYear  || '');
        const month    = String(item.dealMonth || '').padStart(2, '0');
        const area     = parseFloat(item.excluUseAr || 0);
        const floor    = parseInt(item.floor || 0, 10);

        let price = 0;
        if (isRent) {
          price = parseInt((String(item.deposit || '0')).replace(/,/g, ''), 10);
        } else {
          price = parseInt((String(item.dealAmount || item.tradeAmount || '0')).replace(/,/g, ''), 10);
        }

        if (!name || !price) continue;

        await pool.query(
          `INSERT INTO properties
             (name, type, deal_type, district, price, area, floor, deal_year, deal_month, lawd_cd)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE price = VALUES(price)`,
          [name, propType, dealType, district, price, area, floor, year, month, lawd_cd]
        );
        totalSaved++;
      }
    } catch (err) {
      console.error(`[${dataType}] 에러:`, err.message);
      errors.push(`${dataType}: ${err.message}`);
    }
  }

  res.json({ message: `${totalSaved}개 데이터 저장 완료`, errors });
});

// 지역별 실거래가 차트 데이터
router.get('/chart', async (req, res) => {
  const { district, type, deal_type } = req.query;
  try {
    let query = `
      SELECT deal_year, deal_month,
             ROUND(AVG(price)) as avg_price,
             COUNT(*) as count
      FROM properties WHERE 1=1
    `;
    const params = [];
    if (district) { query += ' AND district LIKE ?'; params.push(`%${district}%`); }
    if (type)     { query += ' AND type = ?';        params.push(type); }
    if (deal_type){ query += ' AND deal_type = ?';   params.push(deal_type); }
    query += ' GROUP BY deal_year, deal_month ORDER BY deal_year ASC, deal_month ASC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '서버 오류' });
  }
});

// 저장된 지역 목록
router.get('/districts', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT DISTINCT district FROM properties WHERE district != "" ORDER BY district'
    );
    res.json(rows.map(r => r.district));
  } catch (err) {
    res.status(500).json({ message: '서버 오류' });
  }
});

module.exports = router;