import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import Header from '../components/Header'

export default function MyPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [tab, setTab] = useState('favorites')
  const [favorites, setFavorites] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    if (tab === 'favorites') fetchFavorites()
    else fetchReviews()
  }, [tab, user])

  const fetchFavorites = async () => {
    setLoading(true)
    try { const res = await api.get('/favorites'); setFavorites(res.data) }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const fetchReviews = async () => {
    setLoading(true)
    try { const res = await api.get('/reviews/my'); setReviews(res.data) }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const removeFavorite = async (propertyId) => {
    try {
      await api.delete(`/favorites/${propertyId}`)
      setFavorites(prev => prev.filter(f => f.property_id !== propertyId))
    } catch (e) { console.error(e) }
  }

  const deleteReview = async (reviewId) => {
    if (!confirm('리뷰를 삭제할까요?')) return
    try {
      await api.delete(`/reviews/${reviewId}`)
      setReviews(prev => prev.filter(r => r.id !== reviewId))
    } catch (e) { console.error(e) }
  }

  const STARS = (n) => '★'.repeat(n) + '☆'.repeat(5 - n)

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc' }}>
      <Header />
      <div style={{ maxWidth:800, margin:'0 auto', padding:'24px 16px' }}>

        {/* 프로필 카드 */}
        <div style={{ background:'#fff', borderRadius:16, padding:'20px', border:'1px solid #e2e8f0', marginBottom:20, display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ width:56, height:56, borderRadius:'50%', background:'#4F8EF7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>👤</div>
          <div style={{ minWidth:0 }}>
            <h3 style={{ margin:'0 0 4px', fontSize:18 }}>{user?.nickname}</h3>
            <p style={{ margin:0, color:'#64748b', fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email}</p>
            <span style={{ display:'inline-block', marginTop:6, padding:'2px 10px', borderRadius:20, fontSize:12, background: user?.role === 'admin' ? '#fee2e2' : '#e0f2fe', color: user?.role === 'admin' ? '#dc2626' : '#0284c7' }}>
              {user?.role === 'admin' ? '관리자' : '일반회원'}
            </span>
          </div>
        </div>

        {/* 탭 */}
        <div style={{ display:'flex', gap:4, marginBottom:20, background:'#fff', borderRadius:12, padding:4, border:'1px solid #e2e8f0' }}>
          {[['favorites','❤️ 즐겨찾기'],['reviews','⭐ 내 리뷰']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              style={{ flex:1, padding:'10px', borderRadius:8, border:'none', cursor:'pointer', fontWeight: tab===key?700:400,
                background: tab===key?'#4F8EF7':'transparent', color: tab===key?'#fff':'#64748b', fontSize:14 }}>
              {label}
            </button>
          ))}
        </div>

        {/* 즐겨찾기 */}
        {tab === 'favorites' && (
          loading ? <div style={{ textAlign:'center', padding:'40px', color:'#94a3b8' }}>로딩 중...</div>
          : favorites.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px', color:'#94a3b8', background:'#fff', borderRadius:16, border:'1px solid #e2e8f0' }}>
              <div style={{ fontSize:40, marginBottom:12 }}>🏠</div>
              <p>즐겨찾기한 매물이 없습니다.</p>
              <button onClick={() => navigate('/map')}
                style={{ padding:'10px 24px', background:'#4F8EF7', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', marginTop:8 }}>
                매물 보러 가기
              </button>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {favorites.map(f => (
                <div key={f.property_id} style={{ background:'#fff', borderRadius:12, padding:'16px', border:'1px solid #e2e8f0' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
                    <div style={{ minWidth:0 }}>
                      <h4 style={{ margin:'0 0 4px', fontSize:15, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.name}</h4>
                      <p style={{ margin:'0 0 4px', fontSize:12, color:'#64748b' }}>{f.district} · {f.type} · {f.deal_type}</p>
                      <p style={{ margin:0, fontSize:15, fontWeight:700, color:'#4F8EF7' }}>{f.price ? (f.price/10000).toFixed(1)+'억' : '-'}</p>
                    </div>
                    <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                      <button onClick={() => navigate(`/property/${f.property_id}`)}
                        style={{ padding:'6px 10px', borderRadius:8, border:'1px solid #e2e8f0', cursor:'pointer', fontSize:12, background:'#fff' }}>상세</button>
                      <button onClick={() => removeFavorite(f.property_id)}
                        style={{ padding:'6px 10px', borderRadius:8, border:'none', cursor:'pointer', fontSize:12, background:'#fee2e2', color:'#dc2626' }}>삭제</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* 내 리뷰 */}
        {tab === 'reviews' && (
          loading ? <div style={{ textAlign:'center', padding:'40px', color:'#94a3b8' }}>로딩 중...</div>
          : reviews.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px', color:'#94a3b8', background:'#fff', borderRadius:16, border:'1px solid #e2e8f0' }}>
              <div style={{ fontSize:40, marginBottom:12 }}>⭐</div>
              <p>작성한 리뷰가 없습니다.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {reviews.map(r => (
                <div key={r.id} style={{ background:'#fff', borderRadius:12, padding:'16px', border:'1px solid #e2e8f0' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                    <div>
                      <h4 style={{ margin:'0 0 4px', fontSize:14 }}>{r.property_name || '매물'}</h4>
                      <p style={{ margin:0, fontSize:12, color:'#94a3b8' }}>{r.created_at?.slice(0,10)}</p>
                    </div>
                    <button onClick={() => deleteReview(r.id)}
                      style={{ padding:'5px 10px', borderRadius:6, border:'none', cursor:'pointer', fontSize:12, background:'#fee2e2', color:'#dc2626' }}>삭제</button>
                  </div>
                  <div style={{ display:'flex', gap:12, marginBottom:8, flexWrap:'wrap' }}>
                    {[['소음',r.noise],['채광',r.sunlight],['수압',r.water_pressure],['관리비',r.management_fee],['환경',r.environment]].map(([label,val]) => (
                      <div key={label} style={{ fontSize:12 }}>
                        <span style={{ color:'#64748b' }}>{label} </span>
                        <span style={{ color:'#f59e0b' }}>{STARS(val||0)}</span>
                      </div>
                    ))}
                  </div>
                  {r.content && <p style={{ margin:0, fontSize:13, color:'#374151', background:'#f8fafc', borderRadius:8, padding:'10px' }}>{r.content}</p>}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}