import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const STARS = (n) => '★'.repeat(n) + '☆'.repeat(5 - n)

export default function PropertyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [property,    setProperty]    = useState(null)
  const [reviews,     setReviews]     = useState([])
  const [isFavorite,  setIsFavorite]  = useState(false)
  const [showForm,    setShowForm]    = useState(false)
  const [certStatus,  setCertStatus]  = useState(null) // null | 'pending' | 'approved'
  const [loading,     setLoading]     = useState(true)
  const [submitting,  setSubmitting]  = useState(false)

  const [form, setForm] = useState({
    noise: 3, sunlight: 3, water_pressure: 3,
    management_fee: 3, environment: 3, content: ''
  })

  useEffect(() => {
    fetchAll()
  }, [id])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [propRes, revRes] = await Promise.all([
        api.get(`/properties/${id}`),
        api.get(`/reviews/property/${id}`),
      ])
      setProperty(propRes.data)
      setReviews(revRes.data)

      if (user) {
        const [favRes, certRes] = await Promise.all([
          api.get(`/favorites/check/${id}`),
          api.get('/reviews/cert-status'),
        ])
        setIsFavorite(favRes.data.isFavorite)
        setCertStatus(certRes.data.status)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async () => {
    if (!user) { navigate('/login'); return }
    try {
      if (isFavorite) {
        await api.delete(`/favorites/${id}`)
      } else {
        await api.post(`/favorites/${id}`)
      }
      setIsFavorite(!isFavorite)
    } catch (e) { console.error(e) }
  }

  const submitReview = async () => {
    if (!user) { navigate('/login'); return }
    setSubmitting(true)
    try {
      await api.post('/reviews', { property_id: id, ...form })
      setShowForm(false)
      setForm({ noise:3, sunlight:3, water_pressure:3, management_fee:3, environment:3, content:'' })
      const res = await api.get(`/reviews/property/${id}`)
      setReviews(res.data)
      alert('리뷰가 등록되었습니다!')
    } catch (e) {
      alert(e.response?.data?.message || '리뷰 등록 실패')
    } finally {
      setSubmitting(false)
    }
  }

  const reportReview = async (reviewId) => {
    const reason = prompt('신고 사유를 입력해주세요.')
    if (!reason) return
    try {
      await api.post(`/reviews/${reviewId}/report`, { reason })
      alert('신고가 접수되었습니다.')
    } catch (e) {
      alert(e.response?.data?.message || '신고 실패')
    }
  }

  const avgScore = (r) => {
    const vals = [r.noise, r.sunlight, r.water_pressure, r.management_fee, r.environment].filter(Boolean)
    return vals.length ? (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1) : '-'
  }

  if (loading) return <div style={{ textAlign:'center', padding:'80px', color:'#94a3b8' }}>로딩 중...</div>
  if (!property) return <div style={{ textAlign:'center', padding:'80px', color:'#94a3b8' }}>매물을 찾을 수 없습니다.</div>

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc' }}>
      {/* 헤더 */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 24px', background:'#fff', borderBottom:'1px solid #e2e8f0' }}>
        <h2 style={{ color:'#4F8EF7', cursor:'pointer', margin:0 }} onClick={() => navigate('/')}>🏠 짭방</h2>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          {user ? (
            <>
              <span style={{ fontSize:14, color:'#666' }}>{user.nickname}님</span>
              <button onClick={() => navigate('/mypage')} style={{ padding:'6px 12px', cursor:'pointer', borderRadius:6, border:'1px solid #ddd' }}>마이페이지</button>
              <button onClick={logout} style={{ padding:'6px 12px', cursor:'pointer', borderRadius:6, border:'1px solid #ddd' }}>로그아웃</button>
            </>
          ) : (
            <button onClick={() => navigate('/login')} style={{ padding:'6px 12px', background:'#4F8EF7', color:'#fff', border:'none', borderRadius:6, cursor:'pointer' }}>로그인</button>
          )}
        </div>
      </div>

      <div style={{ maxWidth:800, margin:'0 auto', padding:'32px 24px' }}>
        {/* 뒤로가기 */}
        <button onClick={() => navigate(-1)} style={{ marginBottom:16, background:'none', border:'none', color:'#64748b', cursor:'pointer', fontSize:14 }}>
          ← 뒤로가기
        </button>

        {/* 매물 정보 카드 */}
        <div style={{ background:'#fff', borderRadius:16, padding:'28px', border:'1px solid #e2e8f0', marginBottom:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div>
              <h2 style={{ margin:'0 0 8px', fontSize:22 }}>{property.name}</h2>
              <p style={{ margin:'0 0 4px', color:'#64748b', fontSize:14 }}>
                📍 {property.district} · {property.type}
              </p>
              <div style={{ display:'flex', gap:8, marginTop:10 }}>
                <span style={{ padding:'4px 12px', borderRadius:20, fontSize:12, background:'#e0f2fe', color:'#0284c7' }}>{property.deal_type}</span>
                {property.floor && <span style={{ padding:'4px 12px', borderRadius:20, fontSize:12, background:'#f1f5f9', color:'#475569' }}>{property.floor}층</span>}
                {property.area && <span style={{ padding:'4px 12px', borderRadius:20, fontSize:12, background:'#f1f5f9', color:'#475569' }}>{property.area}㎡</span>}
              </div>
            </div>
            <div style={{ textAlign:'right' }}>
              <p style={{ margin:'0 0 8px', fontSize:24, fontWeight:700, color:'#4F8EF7' }}>
                {property.price ? (property.price / 10000).toFixed(1) + '억' : '-'}
              </p>
              <button onClick={toggleFavorite}
                style={{ padding:'8px 20px', borderRadius:8, border:'1px solid #e2e8f0', cursor:'pointer', fontSize:18, background: isFavorite ? '#fee2e2' : '#fff' }}>
                {isFavorite ? '❤️' : '🤍'} {isFavorite ? '저장됨' : '즐겨찾기'}
              </button>
            </div>
          </div>
        </div>

        {/* 리뷰 섹션 */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <h3 style={{ margin:0 }}>⭐ 거주자 리뷰 ({reviews.length})</h3>
          {user && (
            <button onClick={() => setShowForm(!showForm)}
              style={{ padding:'8px 18px', background:'#4F8EF7', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:14 }}>
              {showForm ? '취소' : '+ 리뷰 작성'}
            </button>
          )}
        </div>

        {/* 리뷰 작성 폼 */}
        {showForm && (
          <div style={{ background:'#fff', borderRadius:16, padding:'24px', border:'1px solid #e2e8f0', marginBottom:20 }}>
            {certStatus !== 'approved' ? (
              <div style={{ textAlign:'center', padding:'20px' }}>
                <p style={{ color:'#64748b', marginBottom:12 }}>
                  {certStatus === 'pending' ? '⏳ 계약서 인증 검토 중입니다.' : '📄 계약서/영수증 인증 후 리뷰 작성이 가능합니다.'}
                </p>
                {!certStatus && (
                  <button onClick={() => navigate('/mypage')}
                    style={{ padding:'8px 20px', background:'#4F8EF7', color:'#fff', border:'none', borderRadius:8, cursor:'pointer' }}>
                    인증 서류 제출하기
                  </button>
                )}
              </div>
            ) : (
              <>
                <h4 style={{ margin:'0 0 16px' }}>리뷰 작성</h4>
                {[
                  ['noise','소음'],['sunlight','채광'],
                  ['water_pressure','수압'],['management_fee','관리비'],['environment','환경']
                ].map(([key, label]) => (
                  <div key={key} style={{ display:'flex', alignItems:'center', gap:16, marginBottom:12 }}>
                    <span style={{ width:60, fontSize:14, color:'#374151' }}>{label}</span>
                    <div style={{ display:'flex', gap:4 }}>
                      {[1,2,3,4,5].map(n => (
                        <button key={n} onClick={() => setForm(p => ({...p,[key]:n}))}
                          style={{ fontSize:20, background:'none', border:'none', cursor:'pointer', color: form[key] >= n ? '#f59e0b' : '#d1d5db' }}>
                          ★
                        </button>
                      ))}
                    </div>
                    <span style={{ fontSize:13, color:'#94a3b8' }}>{form[key]}점</span>
                  </div>
                ))}
                <textarea
                  value={form.content}
                  onChange={e => setForm(p => ({...p, content: e.target.value}))}
                  placeholder="자유롭게 후기를 작성해주세요."
                  rows={4}
                  style={{ width:'100%', padding:'12px', borderRadius:8, border:'1px solid #e2e8f0', fontSize:14, resize:'vertical', boxSizing:'border-box', marginTop:8 }}
                />
                <button onClick={submitReview} disabled={submitting}
                  style={{ marginTop:12, width:'100%', padding:'12px', background:'#4F8EF7', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:15, fontWeight:700 }}>
                  {submitting ? '등록 중...' : '리뷰 등록'}
                </button>
              </>
            )}
          </div>
        )}

        {/* 리뷰 목록 */}
        {reviews.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px', color:'#94a3b8', background:'#fff', borderRadius:16, border:'1px solid #e2e8f0' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>💬</div>
            <p>아직 리뷰가 없습니다. 첫 리뷰를 작성해보세요!</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {reviews.map(r => (
              <div key={r.id} style={{ background:'#fff', borderRadius:12, padding:'20px', border:'1px solid #e2e8f0' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:36, height:36, borderRadius:'50%', background:'#e0f2fe', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>👤</div>
                    <div>
                      <p style={{ margin:0, fontSize:13, fontWeight:600 }}>익명 거주자</p>
                      <p style={{ margin:0, fontSize:11, color:'#94a3b8' }}>{r.created_at?.slice(0,10)}</p>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:18, color:'#f59e0b', fontWeight:700 }}>{avgScore(r)}</span>
                    <span style={{ fontSize:12, color:'#94a3b8' }}>/ 5.0</span>
                    {user && (
                      <button onClick={() => reportReview(r.id)}
                        style={{ padding:'4px 10px', borderRadius:6, border:'1px solid #fca5a5', background:'#fff', color:'#dc2626', cursor:'pointer', fontSize:12 }}>
                        신고
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ display:'flex', gap:16, marginBottom:10, flexWrap:'wrap' }}>
                  {[['소음',r.noise],['채광',r.sunlight],['수압',r.water_pressure],['관리비',r.management_fee],['환경',r.environment]].map(([label,val]) => (
                    <div key={label} style={{ fontSize:13 }}>
                      <span style={{ color:'#64748b' }}>{label} </span>
                      <span style={{ color:'#f59e0b' }}>{STARS(val||0)}</span>
                    </div>
                  ))}
                </div>
                {r.content && (
                  <p style={{ margin:0, fontSize:14, color:'#374151', background:'#f8fafc', borderRadius:8, padding:'10px' }}>{r.content}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
