const express = require('express');
const router = express.Router();
const axios = require('axios');
const pool = require('../config/db');

const API_KEY = process.env.PUBLIC_DATA_API_KEY;

const ENDPOINTS = {
  officetel_rent: 'http://openapi.molit.go.kr/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc/getRTMSDataSvcOffiRent',
  officetel_sale: 'http://openapi.molit.go.kr/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc/getRTMSDataSvcOffiTrade',
  multi_rent:     'http://openapi.molit.go.kr/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc/getRTMSDataSvcRHRent',
  multi_sale:     'http://openapi.molit.go.kr/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc/getRTMSDataSvcRHTrade',
};

// 공공데이터 수집 및 DB 저장
router.post('/fetch', async (req, res) => {
  const { lawd_cd, deal_ymd } = req.body;

  try {
    let totalSaved = 0;

    for (const [dataType, url] of Object.entries(ENDPOINTS)) {
      const response = await axios.get(url, {
        params: { serviceKey: API_KEY, LAWD_CD: lawd_cd, DEAL_YMD: deal_ymd, numOfRows: 100, pageNo: 1 },
      });

      const items = response.data?.response?.body?.items?.item;
      if (!items) continue;

      const list = Array.isArray(items) ? items : [items];
      const dealType = dataType.includes('rent') ? '전세/월세' : '매매';
      const propType = dataType.includes('officetel') ? '오피스텔' : '연립다세대';

      for (const item of list) {
        const name = item['연립다세대'] || item['단지'] || item['오피스텔'] || '';
        const district = `${item['법정동'] || ''}`.trim();
        const price = parseInt((item['거래금액'] || '0').replace(/,/g, ''), 10);
        const area = parseFloat(item['전용면적'] || 0);
        const floor = parseInt(item['층'] || 0, 10);
        const year = item['년'] || '';
        const month = item['월'] || '';

        if (!name || !price) continue;

        await pool.query(
          `INSERT INTO properties (name, type, deal_type, district, price, area, floor, deal_year, deal_month, lawd_cd)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE price = VALUES(price)`,
          [name, propType, dealType, district, price, area, floor, year, month, lawd_cd]
        );
        totalSaved++;
      }
    }

    res.json({ message: `${totalSaved}개 데이터 저장 완료` });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: '공공데이터 수집 실패', error: err.message });
  }
});

// 지역별 실거래가 차트 데이터
router.get('/chart', async (req, res) => {
  const { district, type, deal_type } = req.query;
  try {
    const [rows] = await pool.query(
      `SELECT deal_year, deal_month, AVG(price) as avg_price, COUNT(*) as count
       FROM properties
       WHERE district LIKE ? AND type = ? AND deal_type = ?
       GROUP BY deal_year, deal_month
       ORDER BY deal_year ASC, deal_month ASC`,
      [`%${district}%`, type, deal_type]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '서버 오류' });
  }
});

module.exports = router;