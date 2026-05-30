import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Header from '../components/Header'

const DISTRICT_COORDS = {
  '역삼동':   [37.5004, 127.0365],
  '자곡동':   [37.4691, 127.0852],
  '도곡동':   [37.4926, 127.0400],
  '개포동':   [37.4810, 127.0510],
  '논현동':   [37.5115, 127.0264],
  '압구정동': [37.5271, 127.0287],
  '청담동':   [37.5219, 127.0513],
  '삼성동':   [37.5140, 127.0565],
  '대치동':   [37.4940, 127.0620],
  '수서동':   [37.4850, 127.1010],
  '서초동':   [37.4926, 127.0086],
  '반포동':   [37.5048, 126.9998],
  '잠원동':   [37.5133, 127.0046],
  '방배동':   [37.4812, 126.9962],
  '양재동':   [37.4680, 127.0340],
  '내곡동':   [37.4570, 127.0580],
  '필동':     [37.5596, 126.9956],
  '충무로':   [37.5607, 126.9928],
  '남산동':   [37.5560, 126.9920],
  '장충동':   [37.5617, 127.0031],
  '신당동':   [37.5655, 127.0124],
  '황학동':   [37.5698, 127.0182],
  '을지로동': [37.5658, 126.9983],
  '황남동':   [35.8350, 129.2180],
  '황오동':   [35.8390, 129.2200],
  '성건동':   [35.8520, 129.2150],
  '동천동':   [35.8600, 129.2280],
  '불국동':   [35.7902, 129.3315],
  '외동읍':   [35.7730, 129.3480],
  '안강읍':   [35.9690, 129.2030],
  '건천읍':   [35.8280, 129.1120],
  '현곡면':   [35.9060, 129.2210],
}

const DEFAULT_COORD = (district) => {
  if (['경주'].some(k => district?.includes(k))) return [35.8562, 129.2247]
  if (['서초'].some(k => district?.includes(k))) return [37.4926, 127.0086]
  return [37.5641, 126.9977]
}

const REGION_CENTER = {
  '강남구': { lat:37.4979, lng:127.0276, level:7 },
  '서초구': { lat:37.4926, lng:127.0086, level:7 },
  '중구':   { lat:37.5641, lng:126.9977, level:7 },
  '경주시': { lat:35.8562, lng:129.2247, level:8 },
}

export default function Map() {
  const mapRef  = useRef(null)
  const mapObj  = useRef(null)
  const navigate = useNavigate()

  const [type,       setType]       = useState('')
  const [dealType,   setDealType]   = useState('')
  const [region,     setRegion]     = useState('전체')
  const [properties, setProperties] = useState([])
  const [selected,   setSelected]   = useState(null)
  const markersRef = useRef([])

  useEffect(() => {
    const init = () => {
      if (!mapRef.current) return
      window.kakao.maps.load(() => {
        const map = new window.kakao.maps.Map(mapRef.current, {
          center: new window.kakao.maps.LatLng(37.4979, 127.0276),
          level: 8,
        })
        mapObj.current = map
        fetchProperties('', '', '전체')
      })
    }
    if (window.kakao?.maps) { init() }
    else {
      const timer = setInterval(() => {
        if (window.kakao?.maps) { clearInterval(timer); init() }
      }, 100)
      return () => clearInterval(timer)
    }
  }, [])

  const fetchProperties = async (t = '', d = '', r = '전체') => {
    try {
      const params = {}
      if (t) params.type = t
      if (d) params.deal_type = d
      if (r !== '전체') params.district = r
      const res = await api.get('/properties', { params })
      setProperties(res.data)
      renderMarkers(res.data)

      // 지역 선택 시 지도 이동
      if (r !== '전체' && REGION_CENTER[r] && mapObj.current) {
        const c = REGION_CENTER[r]
        mapObj.current.setCenter(new window.kakao.maps.LatLng(c.lat, c.lng))
        mapObj.current.setLevel(c.level)
      }
    } catch (e) { console.error(e) }
  }

  const renderMarkers = (list) => {
    if (!mapObj.current) return
    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []

    const seen = new Set()
    list.forEach(p => {
      const key = `${p.district}-${p.name}`
      if (seen.has(key)) return
      seen.add(key)

      const base = DISTRICT_COORDS[p.district] || DEFAULT_COORD(p.district)
      const lat = base[0] + (Math.random()-0.5)*0.003
      const lng = base[1] + (Math.random()-0.5)*0.003

      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(lat, lng),
        map: mapObj.current,
      })

      const priceText = p.price ? (p.price/10000).toFixed(1)+'억' : '-'
      const infowindow = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:10px;font-size:13px;min-width:160px">
          <b>${p.name}</b><br/>
          📍 ${p.district} · ${p.type}<br/>
          <span style="color:#4F8EF7;font-weight:700">${p.deal_type} ${priceText}</span>
        </div>`
      })

      window.kakao.maps.event.addListener(marker, 'click', () => {
        infowindow.open(mapObj.current, marker)
        setSelected(p)
      })
      markersRef.current.push(marker)
    })
  }

  const handleRegion = (r) => {
    setRegion(r)
    fetchProperties(type, dealType, r)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', position:'fixed', top:0, left:0, right:0, bottom:0 }}>
      <Header />

      {/* 필터 바 */}
      <div style={{ background:'#f8f9fa', borderBottom:'1px solid #eee', zIndex:10 }}>
        {/* 지역 탭 */}
        <div style={{ display:'flex', gap:6, padding:'8px 16px 4px', overflowX:'auto' }}>
          {['전체','강남구','서초구','중구','경주시'].map(r => (
            <button key={r} onClick={() => handleRegion(r)}
              style={{ padding:'5px 14px', borderRadius:20, border:'none', cursor:'pointer', fontSize:12, fontWeight:600, whiteSpace:'nowrap', flexShrink:0,
                background: region===r ? '#4F8EF7' : '#fff', color: region===r ? '#fff' : '#64748b',
                boxShadow:'0 1px 4px rgba(0,0,0,0.08)' }}>
              {r}
            </button>
          ))}
        </div>
        {/* 유형/거래 */}
        <div style={{ display:'flex', gap:8, padding:'6px 16px 8px', flexWrap:'wrap', alignItems:'center' }}>
          <select value={type} onChange={e => setType(e.target.value)}
            style={{ padding:'6px 10px', borderRadius:6, border:'1px solid #ddd', fontSize:13 }}>
            <option value=''>전체 유형</option>
            <option value='오피스텔'>오피스텔</option>
            <option value='연립다세대'>연립다세대</option>
          </select>
          <select value={dealType} onChange={e => setDealType(e.target.value)}
            style={{ padding:'6px 10px', borderRadius:6, border:'1px solid #ddd', fontSize:13 }}>
            <option value=''>전체 거래</option>
            <option value='매매'>매매</option>
            <option value='전세/월세'>전세/월세</option>
          </select>
          <button onClick={() => fetchProperties(type, dealType, region)}
            style={{ padding:'6px 14px', background:'#4F8EF7', color:'#fff', border:'none', borderRadius:6, fontSize:13, cursor:'pointer' }}>
            검색
          </button>
          <span style={{ fontSize:13, color:'#94a3b8' }}>{properties.length}개 매물</span>
        </div>
      </div>

      {/* 지도 */}
      <div style={{ flex:1, position:'relative' }}>
        <div ref={mapRef} style={{ width:'100%', height:'100%' }} />

        {selected && (
          <div style={{ position:'absolute', bottom:24, left:'50%', transform:'translateX(-50%)', background:'#fff', borderRadius:16, padding:'16px 20px', boxShadow:'0 4px 20px rgba(0,0,0,0.15)', minWidth:260, maxWidth:'90vw', zIndex:100, border:'1px solid #e2e8f0' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <h4 style={{ margin:'0 0 6px', fontSize:15 }}>{selected.name}</h4>
                <p style={{ margin:'0 0 4px', fontSize:13, color:'#64748b' }}>📍 {selected.district} · {selected.type}</p>
                <p style={{ margin:0, fontSize:17, fontWeight:700, color:'#4F8EF7' }}>
                  {selected.deal_type} {selected.price ? (selected.price/10000).toFixed(1)+'억' : '-'}
                </p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', fontSize:18, cursor:'pointer', color:'#94a3b8' }}>✕</button>
            </div>
            <button onClick={() => navigate(`/property/${selected.id}`)}
              style={{ marginTop:12, width:'100%', padding:'10px', background:'#4F8EF7', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:14, fontWeight:600 }}>
              상세보기
            </button>
          </div>
        )}
      </div>
    </div>
  )
}