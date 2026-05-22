import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const TABS = [
  { key:'dashboard', label:'📊 대시보드' },
  { key:'certs',     label:'📄 인증 검토' },
  { key:'reports',   label:'🚨 신고 처리' },
  { key:'users',     label:'👥 회원 관리' },
]

export default function Admin() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [tab,   setTab]   = useState('dashboard')
  const [data,  setData]  = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    if (user.role !== 'admin') { navigate('/'); return }
    fetchData()
  }, [tab, user])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (tab === 'dashboard') {
        const res = await api.get('/admin/dashboard')
        setData(res.data)
      } else if (tab === 'certs') {
        const res = await api.get('/admin/certifications')
        setData({ list: res.data })
      } else if (tab === 'reports') {
        const res = await api.get('/admin/reports')
        setData({ list: res.data })
      } else if (tab === 'users') {
        const res = await api.get('/admin/users')
        setData({ list: res.data })
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const approveCert = async (id) => {
    try {
      await api.patch(`/admin/certifications/${id}`, { status: 'approved' })
      fetchData()
    } catch (e) { alert('처리 실패') }
  }

  const rejectCert = async (id) => {
    try {
      await api.patch(`/admin/certifications/${id}`, { status: 'rejected' })
      fetchData()
    } catch (e) { alert('처리 실패') }
  }

  const hideReview = async (reviewId) => {
    try {
      await api.patch(`/admin/reviews/${reviewId}/hide`)
      fetchData()
    } catch (e) { alert('처리 실패') }
  }

  const banUser = async (userId) => {
    if (!confirm('이 회원을 정지하시겠습니까?')) return
    try {
      await api.patch(`/admin/users/${userId}/ban`)
      fetchData()
    } catch (e) { alert('처리 실패') }
  }

  const unbanUser = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/unban`)
      fetchData()
    } catch (e) { alert('처리 실패') }
  }

  const S = {
    card: { background:'#fff', borderRadius:12, padding:'20px', border:'1px solid #e2e8f0' },
    badge: (c) => ({ padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600,
      background: c==='approved'?'#dcfce7':c==='rejected'?'#fee2e2':c==='pending'?'#fef9c3':'#f1f5f9',
      color: c==='approved'?'#16a34a':c==='rejected'?'#dc2626':c==='pending'?'#ca8a04':'#475569' }),
    btn: (c='blue') => ({ padding:'6px 14px', borderRadius:6, border:'none', cursor:'pointer', fontSize:13, fontWeight:600,
      background: c==='green'?'#16a34a':c==='red'?'#dc2626':c==='gray'?'#94a3b8':'#4F8EF7', color:'#fff' }),
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f1f5f9' }}>
      {/* 헤더 */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 24px', background:'#1e293b', borderBottom:'1px solid #334155' }}>
        <h2 style={{ color:'#4F8EF7', cursor:'pointer', margin:0 }} onClick={() => navigate('/')}>🏠 짭방</h2>
        <span style={{ color:'#94a3b8', fontSize:13 }}>🛡️ 관리자 모드</span>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <span style={{ fontSize:13, color:'#94a3b8' }}>{user?.nickname}</span>
          <button onClick={logout} style={{ padding:'6px 12px', cursor:'pointer', borderRadius:6, border:'1px solid #475569', background:'transparent', color:'#94a3b8' }}>로그아웃</button>
        </div>
      </div>

      <div style={{ maxWidth:1000, margin:'0 auto', padding:'32px 24px' }}>
        <h2 style={{ marginBottom:24, color:'#1e293b' }}>관리자 대시보드</h2>

        {/* 탭 */}
        <div style={{ display:'flex', gap:4, marginBottom:24, background:'#fff', borderRadius:12, padding:4, border:'1px solid #e2e8f0' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ flex:1, padding:'10px', borderRadius:8, border:'none', cursor:'pointer', fontWeight: tab===t.key?700:400,
                background: tab===t.key?'#1e293b':'transparent', color: tab===t.key?'#fff':'#64748b', fontSize:13 }}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'60px', color:'#94a3b8' }}>로딩 중...</div>
        ) : (
          <>
            {/* 대시보드 */}
            {tab === 'dashboard' && (
              <div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
                  {[
                    { label:'전체 회원', value: data.totalUsers||0, icon:'👥', color:'#4F8EF7' },
                    { label:'전체 매물', value: data.totalProperties||0, icon:'🏠', color:'#16a34a' },
                    { label:'대기 인증', value: data.pendingCerts||0, icon:'📄', color:'#d97706' },
                    { label:'신고 건수', value: data.totalReports||0, icon:'🚨', color:'#dc2626' },
                  ].map(card => (
                    <div key={card.label} style={{ ...S.card, textAlign:'center' }}>
                      <div style={{ fontSize:32, marginBottom:8 }}>{card.icon}</div>
                      <p style={{ margin:'0 0 4px', fontSize:28, fontWeight:700, color:card.color }}>{card.value}</p>
                      <p style={{ margin:0, fontSize:13, color:'#64748b' }}>{card.label}</p>
                    </div>
                  ))}
                </div>
                <div style={{ ...S.card }}>
                  <h4 style={{ margin:'0 0 12px' }}>최근 가입 회원</h4>
                  {(data.recentUsers||[]).map(u => (
                    <div key={u.id} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #f1f5f9' }}>
                      <span style={{ fontSize:14 }}>{u.nickname} ({u.email})</span>
                      <span style={{ fontSize:12, color:'#94a3b8' }}>{u.created_at?.slice(0,10)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 인증 검토 */}
            {tab === 'certs' && (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {(!data.list || data.list.length === 0) ? (
                  <div style={{ ...S.card, textAlign:'center', padding:'60px', color:'#94a3b8' }}>검토할 인증 서류가 없습니다.</div>
                ) : data.list.map(c => (
                  <div key={c.id} style={{ ...S.card, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <p style={{ margin:'0 0 4px', fontWeight:600 }}>{c.nickname} ({c.email})</p>
                      <p style={{ margin:'0 0 6px', fontSize:13, color:'#64748b' }}>파일: {c.file_path}</p>
                      <span style={S.badge(c.status)}>{c.status === 'pending' ? '검토중' : c.status === 'approved' ? '승인' : '거절'}</span>
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      <a href={`http://localhost:8080/uploads/${c.file_path}`} target="_blank" rel="noreferrer"
                        style={{ ...S.btn('gray'), textDecoration:'none', display:'inline-block' }}>보기</a>
                      {c.status === 'pending' && (
                        <>
                          <button onClick={() => approveCert(c.id)} style={S.btn('green')}>승인</button>
                          <button onClick={() => rejectCert(c.id)} style={S.btn('red')}>거절</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 신고 처리 */}
            {tab === 'reports' && (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {(!data.list || data.list.length === 0) ? (
                  <div style={{ ...S.card, textAlign:'center', padding:'60px', color:'#94a3b8' }}>신고 내역이 없습니다.</div>
                ) : data.list.map(r => (
                  <div key={r.id} style={{ ...S.card, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <p style={{ margin:'0 0 4px', fontWeight:600 }}>리뷰 #{r.review_id}</p>
                      <p style={{ margin:'0 0 4px', fontSize:13, color:'#64748b' }}>신고자: {r.nickname} | 사유: {r.reason}</p>
                      <p style={{ margin:0, fontSize:12, color:'#94a3b8' }}>{r.created_at?.slice(0,10)}</p>
                    </div>
                    <button onClick={() => hideReview(r.review_id)} style={S.btn('red')}>리뷰 숨김</button>
                  </div>
                ))}
              </div>
            )}

            {/* 회원 관리 */}
            {tab === 'users' && (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {(!data.list || data.list.length === 0) ? (
                  <div style={{ ...S.card, textAlign:'center', padding:'60px', color:'#94a3b8' }}>회원이 없습니다.</div>
                ) : data.list.map(u => (
                  <div key={u.id} style={{ ...S.card, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <p style={{ margin:'0 0 4px', fontWeight:600 }}>{u.nickname}
                        <span style={{ marginLeft:8, ...S.badge(u.role === 'admin' ? 'approved' : 'gray') }}>{u.role}</span>
                        {u.is_banned === 1 && <span style={{ marginLeft:6, ...S.badge('rejected') }}>정지됨</span>}
                      </p>
                      <p style={{ margin:0, fontSize:13, color:'#64748b' }}>{u.email} | 가입일: {u.created_at?.slice(0,10)}</p>
                    </div>
                    {u.role !== 'admin' && (
                      u.is_banned === 1
                        ? <button onClick={() => unbanUser(u.id)} style={S.btn('green')}>정지 해제</button>
                        : <button onClick={() => banUser(u.id)} style={S.btn('red')}>정지</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
