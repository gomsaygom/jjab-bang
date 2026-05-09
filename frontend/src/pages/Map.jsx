import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Map() {
  const mapRef = useRef(null)
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  useEffect(() => {
  const initMap = () => {
    if (!mapRef.current) return
    window.kakao.maps.load(() => {
      const container = mapRef.current
      const options = {
        center: new window.kakao.maps.LatLng(37.5665, 126.9780),
        level: 5,
      }
      const map = new window.kakao.maps.Map(container, options)

      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(37.5665, 126.9780),
        map,
      })

      const infowindow = new window.kakao.maps.InfoWindow({
        content: '<div style="padding:8px; font-size:13px;">📍 테스트 매물<br/>오피스텔 · 전세 5000만</div>',
      })

      window.kakao.maps.event.addListener(marker, 'click', () => {
        infowindow.open(map, marker)
      })
    })
  }

  if (window.kakao && window.kakao.maps) {
    initMap()
  } else {
    const timer = setInterval(() => {
      if (window.kakao && window.kakao.maps) {
        clearInterval(timer)
        initMap()
      }
    }, 100)
    return () => clearInterval(timer)
  }
}, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', background: '#fff', borderBottom: '1px solid #eee', zIndex: 10 }}>
        <h2 style={{ color: '#4F8EF7', cursor: 'pointer', margin: 0 }} onClick={() => navigate('/')}>🏠 짭방</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          {user ? (
            <>
              <span style={{ fontSize: 14, color: '#666' }}>{user.nickname}님</span>
              <button onClick={() => navigate('/mypage')} style={{ padding: '6px 12px', cursor: 'pointer', borderRadius: 6, border: '1px solid #ddd' }}>마이페이지</button>
              <button onClick={logout} style={{ padding: '6px 12px', cursor: 'pointer', borderRadius: 6, border: '1px solid #ddd' }}>로그아웃</button>
            </>
          ) : (
            <button onClick={() => navigate('/login')} style={{ padding: '6px 12px', background: '#4F8EF7', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>로그인</button>
          )}
        </div>
      </div>

      {/* 필터 바 */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 24px', background: '#f8f9fa', borderBottom: '1px solid #eee', flexWrap: 'wrap', zIndex: 10 }}>
        <select style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13 }}>
          <option>전체 유형</option>
          <option>오피스텔</option>
          <option>연립다세대</option>
        </select>
        <select style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13 }}>
          <option>전체 거래</option>
          <option>매매</option>
          <option>전세/월세</option>
        </select>
        <button style={{ padding: '6px 16px', background: '#4F8EF7', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>
          검색
        </button>
      </div>

      {/* 지도 */}
      <div ref={mapRef} style={{ flex: 1, width: '100%' }} />
    </div>
  )
}
