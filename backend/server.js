const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// 미들웨어
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 라우터
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/properties', require('./src/routes/property'));
app.use('/api/reviews', require('./src/routes/review'));
app.use('/api/admin', require('./src/routes/admin'));
app.use('/api/public-data', require('./src/routes/publicData'));

// 헬스체크
app.get('/', (req, res) => res.json({ message: '짭방 API 서버 정상 동작 중' }));

app.listen(PORT, () => console.log(`서버 실행 중: http://localhost:${PORT}`));
