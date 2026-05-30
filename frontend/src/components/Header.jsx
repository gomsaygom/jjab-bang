import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 24px', background:'#fff', borderBottom:'1px solid #E2E8F0', height:56, position:'sticky', top:0, zIndex:100 }}>
      {/* 로고 */}
      <div onClick={() => navigate('/')} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
        <div style={{ width:32, height:32, borderRadius:10, background:'linear-gradient(135deg,#3B82F6,#1D4ED8)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>
          🏠
        </div>
        <span style={{ fontSize:18, fontWeight:800, color:'#1E293B', letterSpacing:-0.5 }}>짭방</span>
        <span style={{ fontSize:11, background:'#EFF6FF', color:'#3B82F6', borderRadius:6, padding:'2px 7px', fontWeight:600 }}>BETA</span>
      </div>

      {/* 버튼 */}
      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
        {user ? (
          <>
            <span style={{ fontSize:13, color:'#64748B', maxWidth:80, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.nickname}</span>
            <button onClick={() => navigate('/mypage')}
              style={{ padding:'6px 14px', cursor:'pointer', borderRadius:8, border:'1px solid #E2E8F0', fontSize:13, background:'#fff', color:'#374151', fontWeight:500 }}>
              마이페이지
            </button>
            {user.role === 'admin' && (
              <button onClick={() => navigate('/admin')}
                style={{ padding:'6px 14px', cursor:'pointer', borderRadius:8, border:'none', fontSize:13, background:'#1E293B', color:'#fff', fontWeight:500 }}>
                관리자
              </button>
            )}
            <button onClick={logout}
              style={{ padding:'6px 14px', cursor:'pointer', borderRadius:8, border:'1px solid #E2E8F0', fontSize:13, background:'#fff', color:'#374151', fontWeight:500 }}>
              로그아웃
            </button>
          </>
        ) : (
          <>
            <button onClick={() => navigate('/login')}
              style={{ padding:'6px 14px', cursor:'pointer', borderRadius:8, border:'1px solid #E2E8F0', fontSize:13, background:'#fff', color:'#374151', fontWeight:500 }}>
              로그인
            </button>
            <button onClick={() => navigate('/register')}
              style={{ padding:'6px 14px', background:'#3B82F6', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600 }}>
              회원가입
            </button>
          </>
        )}
      </div>
    </div>
  )
}