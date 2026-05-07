<<<<<<< HEAD
# 🏠 짭방 (jjab-bang)

> 대학가 스마트 자취방 안심 정보 공유 플랫폼

"선배들이 알려주는 진짜 자취방 정보, 공공 데이터로 확인하고 리뷰로 검증하세요"

## 팀원

| 이름 | 역할 |
|------|------|
| 안효진 | 팀장 / 풀스택 개발 |
| 손현영 | 팀원 |
| 최현우 | 팀원 |
| 김동민 | 팀원 |

## 기술 스택

**Frontend**
- React + Vite (PWA)
- React Router, Axios, Recharts
- Kakao Map API

**Backend**
- Node.js + Express
- MySQL2, JWT, Bcrypt
- Multer (파일 업로드)
- Nodemailer + SendGrid

**Database**
- MySQL

**배포**
- Frontend: Vercel
- Backend: Railway

## 주요 기능

- 🗺️ 카카오맵 기반 매물 위치 표시 및 필터 검색
- 📊 국토교통부 실거래가 차트 (오피스텔/연립다세대)
- ⭐ 항목별 익명 거주 리뷰 (소음/채광/수압/관리비/환경)
- 🔒 계약서/영수증 이미지 인증 기반 리뷰 허가
- 📧 이메일 회원가입 인증 (SendGrid)
- ❤️ 매물 즐겨찾기
- 🛡️ 전세가율 계산기 + 전세사기 예방 체크리스트
- 👨‍💼 관리자 대시보드

## 실행 방법

### Backend
```bash
cd backend
cp .env.example .env   # 환경변수 설정
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 폴더 구조

```
jjab-bang/
├── backend/
│   ├── src/
│   │   ├── config/       # DB 연결, SQL 스키마
│   │   ├── middleware/   # JWT 인증
│   │   ├── routes/       # API 라우터
│   │   └── utils/        # 이메일 전송
│   ├── uploads/          # 업로드 파일
│   └── server.js
└── frontend/
    └── src/
        ├── pages/
        ├── components/
        ├── api/
        └── context/
```
=======
# jjab-bang
>>>>>>> 5dfc0282630ffb884ce9ce598b818fcbc76b5c9a
