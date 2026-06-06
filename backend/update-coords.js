require('dotenv').config();
const axios = require('axios');
const pool  = require('./src/config/db');

async function getCoords(keyword) {
  try {
    const res = await axios.get('https://dapi.kakao.com/v2/local/search/keyword.json', {
      params: { query: keyword, size: 1 },
      headers: { Authorization: `KakaoAK ${process.env.KAKAO_REST_KEY}` }
    });
    const doc = res.data.documents[0];
    if (!doc) return null;
    return { lat: parseFloat(doc.y), lng: parseFloat(doc.x) };
  } catch (e) { return null; }
}

async function getAddressCoords(keyword) {
  try {
    const res = await axios.get('https://dapi.kakao.com/v2/local/search/address.json', {
      params: { query: keyword, size: 1 },
      headers: { Authorization: `KakaoAK ${process.env.KAKAO_REST_KEY}` }
    });
    const doc = res.data.documents[0];
    if (!doc) return null;
    return { lat: parseFloat(doc.y), lng: parseFloat(doc.x) };
  } catch (e) { return null; }
}

function isLotNumber(name) {
  return /^\(?\d+[-–]\d+\)?$/.test(name.trim()) || /^\(?\d+\)?$/.test(name.trim())
}

function isValidCoord(coords, lawd_cd) {
  if (!coords) return false
  if (lawd_cd === '11140') {
    return coords.lat >= 37.54 && coords.lat <= 37.58
        && coords.lng >= 126.95 && coords.lng <= 127.02
  } else {
    return coords.lat >= 35.60 && coords.lat <= 36.10
        && coords.lng >= 128.90 && coords.lng <= 129.60
  }
}

async function run() {
  const [rows] = await pool.query(
    `SELECT DISTINCT name, district, lawd_cd FROM properties ORDER BY name`
  );
  console.log(`고유 건물: ${rows.length}개`);

  for (const row of rows) {
    const cleanName = row.name.replace(/[()]/g, '').trim()
    const region = row.lawd_cd === '11140' ? '서울 중구' : '경북 경주시'

    let coords = null
    if (isLotNumber(row.name)) {
      coords = await getAddressCoords(`${region} ${row.district.split(' ')[0]} ${cleanName}`)
            || await getAddressCoords(`${region} ${cleanName}`)
    } else {
      coords = await getCoords(`${region} ${row.name}`)
            || await getCoords(`${region} ${row.district} ${row.name}`)
    }

    if (coords && isValidCoord(coords, row.lawd_cd)) {
      await pool.query(
        'UPDATE properties SET lat=?, lng=? WHERE name=? AND district=?',
        [coords.lat, coords.lng, row.name, row.district]
      );
      console.log(`✅ ${row.name} (${row.district})`)
    } else {
      console.log(`❌ ${row.name} (${row.district}) → 범위 벗어남 또는 미발견, 스킵`)
    }
    await new Promise(r => setTimeout(r, 200));
  }

  console.log('완료!');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });