import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import Header from '../components/Header'

const STARS = (n) => '★'.repeat(n) + '☆'.repeat(5 - n)

export default function PropertyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [property,      setProperty]      = useState(null)
  const [reviews,       setReviews]       = useState([])
  const [isFavorite,    setIsFavorite]    = useState(false)
  const [showForm,      setShowForm]      = useState(false)
  const [certStatus,    setCertStatus]    = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [submitting,    setSubmitting]    = useState(false)
  const [certFile,      setCertFile]      = useState(null)
  const [certUploading, setCertUploading] = useState(false)
  const [reviewImage,   setReviewImage]   = useState(null)

  const [form, setForm] = useState({
    noise:3, sunlight:3, water_pressure:3, management_fee:3, environment:3, content:''
  })

  useEffect(() => { fetchAll() }, [id])

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
          api.get(`/reviews/cert-status?property_id=${id}`), // ← property_id 추가
        ])
        setIsFavorite(favRes.data.isFavorite)
        setCertStatus(certRes.data.status)
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const toggleFavorite = async () => {
    if (!user) { navigate('/login'); return }
    try {
      if (isFavorite) await api.delete(`/favorites/${id}`)
      else await api.post(`/favorites/${id}`)
      setIsFavorite(!isFavorite)
    } catch (e) { console.error(e) }
  }

  const submitCert = async () => {
    if (!certFile) return alert('파일을 선택해주세요.')
    setCertUploading(true)
    try {
      const formData = new FormData()
      formData.append('cert_file', certFile)
      formData.append('property_id', id) // ← property_id 추가
      await api.post('/reviews/certify', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      alert('인증 서류가 제출되었습니다. 관리자 검토 후 리뷰 작성이 가능합니다.')
      setCertFile(null)
      const res = await api.get(`/reviews/cert-status?property_id=${id}`)
      setCertStatus(res.data.status)
    } catch (e) {
      alert(e.response?.data?.message || '업로드 실패')
    } finally { setCertUploading(false) }
  }

  const submitReview = async () => {
    if (!user) { navigate('/login'); return }
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('property_id', id)
      formData.append('noise', form.noise)
      formData.append('sunlight', form.sunlight)
      formData.append('water_pressure', form.water_pressure)
      formData.append('management_fee', form.management_fee)
      formData.append('environment', form.environment)
      formData.append('content', form.content)
      if (reviewImage) formData.append('review_image', reviewImage)

      await api.post('/reviews', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setShowForm(false)
      setForm({ noise:3, sunlight:3, water_pressure:3, management_fee:3, environment:3, content:'' })
      setReviewImage(null)
      const res = await api.get(`/reviews/property/${id}`)
      setReviews(res.data)
      alert('리뷰가 등록되었습니다!')
    } catch (e) {
      alert(e.response?.data?.message || '리뷰 등록 실패')
    } finally { setSubmitting(false) }
  }

  const reportReview = async (reviewId) => {
    const reason = prompt('신고 사유를 입력해주세요.')
    if (!reason) return
    try {
      await api.post(`/reviews/${reviewId}/report`, { reason })
      alert('신고가 접수되었습니다.')
    } catch (e) { alert(e.response?.data?.message || '신고 실패') }
  }

  const avgScore = (r) => {
    const vals = [r.noise, r.sunlight, r.water_pressure, r.management_fee, r.environment].filter(Boolean)
    return vals.length ? (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1) : '-'
  }

  const IMG_BASE = 'http://localhost:8080/uploads/'

  if (loading) return <div style={{ textAlign:'center', padding:'80px', color:'#94a3b8' }}>로딩 중...</div>
  if (!property) return <div style={{ textAlign:'center', padding:'80px', color:'#94a3b8' }}>매물을 찾을 수 없습니다.</div>

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc' }}>
      <Header />
      <div style={{ maxWidth:800, margin:'0 auto', padding:'32px 24px' }}>
        <button onClick={() => navigate(-1)} style={{ marginBottom:16, background:'none', border:'none', color:'#64748b', cursor:'pointer', fontSize:14 }}>
          ← 뒤로가기
        </button>

        <div style={{ background:'#fff', borderRadius:16, padding:'28px', border:'1px solid #e2e8f0', marginBottom:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div>
              <h2 style={{ margin:'0 0 8px', fontSize:22 }}>{property.name}</h2>
              <p style={{ margin:'0 0 4px', color:'#64748b', fontSize:14 }}>📍 {property.district} · {property.type}</p>
              <div style={{ display:'flex', gap:8, marginTop:10 }}>
                <span style={{ padding:'4px 12px', borderRadius:20, fontSize:12, background:'#e0f2fe', color:'#0284c7' }}>{property.deal_type}</span>
                {property.floor && <span style={{ padding:'4px 12px', borderRadius:20, fontSize:12, background:'#f1f5f9', color:'#475569' }}>{property.floor}층</span>}
                {property.area && <span style={{ padding:'4px 12px', borderRadius:20, fontSize:12, background:'#f1f5f9', color:'#475569' }}>{property.area}㎡</span>}
              </div>
            </div>
            <div style={{ textAlign:'right' }}>
              <p style={{ margin:'0 0 8px', fontSize:24, fontWeight:700, color:'#4F8EF7' }}>
                {property.price ? (property.price/10000).toFixed(1)+'억' : '-'}
              </p>
              <button onClick={toggleFavorite}
                style={{ padding:'8px 20px', borderRadius:8, border:'1px solid #e2e8f0', cursor:'pointer', fontSize:18, background: isFavorite?'#fee2e2':'#fff' }}>
                {isFavorite ? '❤️' : '🤍'} {isFavorite ? '저장됨' : '즐겨찾기'}
              </button>
            </div>
          </div>
        </div>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <h3 style={{ margin:0 }}>⭐ 거주자 리뷰 ({reviews.length})</h3>
          {user && (
            <button onClick={() => setShowForm(!showForm)}
              style={{ padding:'8px 18px', background:'#4F8EF7', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:14 }}>
              {showForm ? '취소' : '+ 리뷰 작성'}
            </button>
          )}
        </div>

        {showForm && (
          <div style={{ background:'#fff', borderRadius:16, padding:'24px', border:'1px solid #e2e8f0', marginBottom:20 }}>
            {certStatus !== 'approved' ? (
              <div>
                <p style={{ color:'#64748b', marginBottom:12 }}>
                  {certStatus === 'pending' ? '⏳ 계약서 인증 검토 중입니다.' : '📄 이 매물의 계약서/영수증을 업로드하여 인증받으세요.'}
                </p>
                {!certStatus && (
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    <label style={{ fontSize:13, color:'#374151', fontWeight:600 }}>계약서 / 영수증 업로드</label>
                    <input type="file" accept=".jpg,.jpeg,.png,.pdf"
                      onChange={e => setCertFile(e.target.files[0])} style={{ fontSize:13 }}/>
                    {certFile && <p style={{ fontSize:12, color:'#64748b', margin:0 }}>선택: {certFile.name}</p>}
                    <button onClick={submitCert} disabled={certUploading}
                      style={{ padding:'10px', background:'#4F8EF7', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:700 }}>
                      {certUploading ? '업로드 중...' : '인증 서류 제출'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <h4 style={{ margin:'0 0 16px' }}>리뷰 작성</h4>
                {[['noise','소음'],['sunlight','채광'],['water_pressure','수압'],['management_fee','관리비'],['environment','환경']].map(([key, label]) => (
                  <div key={key} style={{ display:'flex', alignItems:'center', gap:16, marginBottom:12 }}>
                    <span style={{ width:60, fontSize:14, color:'#374151' }}>{label}</span>
                    <div style={{ display:'flex', gap:4 }}>
                      {[1,2,3,4,5].map(n => (
                        <button key={n} onClick={() => setForm(p => ({...p,[key]:n}))}
                          style={{ fontSize:20, background:'none', border:'none', cursor:'pointer', color: form[key]>=n?'#f59e0b':'#d1d5db' }}>★</button>
                      ))}
                    </div>
                    <span style={{ fontSize:13, color:'#94a3b8' }}>{form[key]}점</span>
                  </div>
                ))}
                <textarea value={form.content} onChange={e => setForm(p => ({...p, content:e.target.value}))}
                  placeholder="자유롭게 후기를 작성해주세요." rows={4}
                  style={{ width:'100%', padding:'12px', borderRadius:8, border:'1px solid #e2e8f0', fontSize:14, resize:'vertical', boxSizing:'border-box', marginTop:8 }}/>
                <div style={{ marginTop:12 }}>
                  <label style={{ fontSize:13, color:'#374151', fontWeight:600 }}>사진 첨부 (선택)</label>
                  <input type="file" accept=".jpg,.jpeg,.png"
                    onChange={e => setReviewImage(e.target.files[0])} style={{ display:'block', marginTop:6, fontSize:13 }}/>
                  {reviewImage && <p style={{ fontSize:12, color:'#64748b', margin:'4px 0 0' }}>선택: {reviewImage.name}</p>}
                </div>
                <button onClick={submitReview} disabled={submitting}
                  style={{ marginTop:12, width:'100%', padding:'12px', background:'#4F8EF7', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:15, fontWeight:700 }}>
                  {submitting ? '등록 중...' : '리뷰 등록'}
                </button>
              </>
            )}
          </div>
        )}

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
                {r.content && <p style={{ margin:0, fontSize:14, color:'#374151', background:'#f8fafc', borderRadius:8, padding:'10px' }}>{r.content}</p>}
                {r.image_path && (
                  <img src={IMG_BASE + r.image_path} alt="리뷰 이미지"
                    style={{ marginTop:10, maxWidth:'100%', borderRadius:8, maxHeight:300, objectFit:'cover' }}/>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}