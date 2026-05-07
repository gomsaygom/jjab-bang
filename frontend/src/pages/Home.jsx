import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ color: '#4F8EF7' }}>🏠 짭방</h1>
        <div>
          {user ? (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span>{user.nickname}님</span>
              <button onClick={() => navigate('/mypage')} style={{ padding: '6px 12px', cursor: 'pointer' }}>마이페이지</button>
              {user.role === 'admin' && (
                <button onClick={() => navigate('/admin')} style={{ padding: '6px 12px', cursor: 'pointer' }}>관리자</button>
              )}
              <button onClick={logout} style={{ padding: '6px 12px', cursor: 'pointer' }}>로그아웃</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => navigate('/login')} style={{ padding: '6px 12px', cursor: 'pointer' }}>로그인</button>
              <button onClick={() => navigate('/register')} style={{ padding: '6px 12px', background: '#4F8EF7', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>회원가입</button>
            </div>
          )}
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <h2 style={{ fontSize: 28, marginBottom: 16 }}>대학가 자취방 안심 정보</h2>
        <p style={{ color: '#666', marginBottom: 32 }}>선배들이 알려주는 진짜 자취방 정보, 공공 데이터로 확인하고 리뷰로 검증하세요</p>
        <button
          onClick={() => navigate('/map')}
          style={{ padding: '14px 32px', background: '#4F8EF7', color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, cursor: 'pointer' }}
        >
          🗺️ 매물 지도 보기
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 40 }}>
        <div style={{ background: '#f8f9fa', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 32 }}>📊</div>
          <h3>실거래가 차트</h3>
          <p style={{ color: '#666', fontSize: 14 }}>국토교통부 공공데이터 기반</p>
        </div>
        <div style={{ background: '#f8f9fa', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 32 }}>⭐</div>
          <h3>익명 리뷰</h3>
          <p style={{ color: '#666', fontSize: 14 }}>실거주자 인증 리뷰</p>
        </div>
        <div style={{ background: '#f8f9fa', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 32 }}>🛡️</div>
          <h3>전세사기 예방</h3>
          <p style={{ color: '#666', fontSize: 14 }}>전세가율 계산 + 체크리스트</p>
        </div>
      </div>
    </div>
  )
}