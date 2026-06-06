import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Header from '../components/Header'

const DISTRICT_COORDS = {
  // 서울 중구
  '필동':     [37.5596, 126.9956], '필동1가':  [37.5587, 126.9940],
  '필동2가':  [37.5592, 126.9955], '필동3가':  [37.5597, 126.9970],
  '충무로':   [37.5607, 126.9928], '충무로2가':[37.5614, 126.9910],
  '충무로3가':[37.5607, 126.9930], '충무로5가':[37.5596, 126.9965],
  '남산동':   [37.5560, 126.9920], '남산동2가':[37.5567, 126.9940],
  '장충동':   [37.5617, 127.0031], '장충동1가':[37.5604, 127.0040],
  '장충동2가':[37.5609, 127.0060], '신당동':   [37.5655, 127.0124],
  '황학동':   [37.5698, 127.0182], '을지로동': [37.5658, 126.9983],
  '을지로2가':[37.5661, 126.9863], '을지로3가':[37.5659, 126.9900],
  '을지로4가':[37.5657, 126.9940], '을지로5가':[37.5653, 126.9975],
  '을지로6가':[37.5649, 127.0010], '광희동1가':[37.5630, 127.0075],
  '광희동2가':[37.5625, 127.0080], '묵정동':   [37.5620, 127.0050],
  '쌍림동':   [37.5664, 127.0200], '무학동':   [37.5680, 127.0180],
  '흥인동':   [37.5700, 127.0210], '저동2가':  [37.5655, 126.9935],
  '회현동1가':[37.5572, 126.9793], '회현동2가':[37.5568, 126.9810],
  '회현동3가':[37.5564, 126.9826], '남창동':   [37.5584, 126.9754],
  '북창동':   [37.5597, 126.9770], '남대문로5가':[37.5587, 126.9774],
  '순화동':   [37.5610, 126.9726], '의주로1가':[37.5620, 126.9696],
  '만리동1가':[37.5594, 126.9673], '만리동2가':[37.5590, 126.9655],
  '중림동':   [37.5574, 126.9716],
  // 경주시 동
  '황남동':   [35.8350, 129.2180], '황오동':   [35.8390, 129.2200],
  '성건동':   [35.8520, 129.2150], '동천동':   [35.8600, 129.2280],
  '불국동':   [35.7902, 129.3315], '노서동':   [35.8450, 129.2080],
  '동방동':   [35.8480, 129.2150], '동부동':   [35.8408, 129.2245],
  '서부동':   [35.8418, 129.2098], '석장동':   [35.8532, 129.2412],
  '성동동':   [35.8489, 129.2389], '시래동':   [35.8552, 129.2458],
  '구정동':   [35.8445, 129.2210], '구황동':   [35.8305, 129.2290],
  '마동':     [35.8310, 129.2310], '용강동':   [35.8468, 129.2268],
  '진현동':   [35.8180, 129.2240], '황성동':   [35.8559, 129.2268],
  '충효동':   [35.8601, 129.2184],
  // 경주시 읍/면
  '외동읍':   [35.7730, 129.3480], '안강읍':   [35.9690, 129.2030],
  '건천읍':   [35.8280, 129.1120], '현곡면':   [35.9060, 129.2210],
  '감포읍':   [35.7882, 129.4990], '강동면':   [35.9523, 129.3124],
  '서면':     [35.8060, 129.1400], '내남면':   [35.7540, 129.1550],
  '양남면':   [35.7266, 129.4167], '천북면':   [35.9120, 129.3480],
}

const DEFAULT_COORD = (district) => {
  if (!district) return [37.5641, 126.9977]
  const first = district.split(' ')[0]
  if (DISTRICT_COORDS[first]) return DISTRICT_COORDS[first]
  if (['감포','강동','건천','외동','안강','현곡','내남','양남','천북','서면'].some(k => district.includes(k)))
    return [35.8562, 129.2247]
  return [37.5641, 126.9977]
}

const REGION_CENTER = {
  '중구':   { lat:37.5641, lng:126.9977, level:7 },
  '경주시': { lat:35.8562, lng:129.2247, level:8 },
}

const REGION_LAWD = {
  '중구':   '11140',
  '경주시': '47130',
}

export default function Map() {
  const mapRef        = useRef(null)
  const mapObj        = useRef(null)
  const markersRef    = useRef([])
  const infowindowRef = useRef(null)
  const navigate      = useNavigate()

  const [type,       setType]       = useState('')
  const [dealType,   setDealType]   = useState('')
  const [region,     setRegion]     = useState('전체')
  const [nameQuery,  setNameQuery]  = useState('')
  const [properties, setProperties] = useState([])
  const [selected,   setSelected]   = useState(null)

  useEffect(() => {
    const init = () => {
      if (!mapRef.current) return
      window.kakao.maps.load(() => {
        const map = new window.kakao.maps.Map(mapRef.current, {
          center: new window.kakao.maps.LatLng(37.5641, 126.9977),
          level: 8,
        })
        mapObj.current = map
        fetchProperties('', '', '전체', '')
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

  const fetchProperties = async (t='', d='', r='전체', n='') => {
    try {
      const params = {}
      if (t) params.type = t
      if (d) params.deal_type = d
      if (r !== '전체' && REGION_LAWD[r]) params.lawd_cd = REGION_LAWD[r]
      if (n) params.name = n
      const res = await api.get('/properties', { params })
      setProperties(res.data)
      renderMarkers(res.data)
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
    if (infowindowRef.current) infowindowRef.current.close()
    infowindowRef.current = null
    setSelected(null)

    const seen = new Set()
    list.forEach(p => {
      const key = `${p.district}-${p.name}`
      if (seen.has(key)) return
      seen.add(key)

      // DB 좌표 우선, 없으면 하드코딩 폴백
      const base = DISTRICT_COORDS[p.district] || DEFAULT_COORD(p.district)
      const lat = p.lat
        ? parseFloat(p.lat) + (Math.random()-0.5)*0.0005
        : base[0] + (Math.random()-0.5)*0.001
      const lng = p.lng
        ? parseFloat(p.lng) + (Math.random()-0.5)*0.0005
        : base[1] + (Math.random()-0.5)*0.001

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
        if (infowindowRef.current) infowindowRef.current.close()
        infowindow.open(mapObj.current, marker)
        infowindowRef.current = infowindow
        setSelected(p)
      })
      markersRef.current.push(marker)
    })
  }

  const handleRegion = (r) => {
    setRegion(r)
    fetchProperties(type, dealType, r, nameQuery)
  }

  const handleSearch = () => {
    fetchProperties(type, dealType, region, nameQuery)
  }

  const closeSelected = () => {
    setSelected(null)
    if (infowindowRef.current) infowindowRef.current.close()
    infowindowRef.current = null
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', position:'fixed', top:0, left:0, right:0, bottom:0 }}>
      <Header />

      <div style={{ background:'#f8f9fa', borderBottom:'1px solid #eee', zIndex:10 }}>
        <div style={{ display:'flex', gap:6, padding:'8px 16px 4px', overflowX:'auto' }}>
          {['전체','중구','경주시'].map(r => (
            <button key={r} onClick={() => handleRegion(r)}
              style={{ padding:'5px 14px', borderRadius:20, border:'none', cursor:'pointer', fontSize:12, fontWeight:600, whiteSpace:'nowrap', flexShrink:0,
                background: region===r ? '#4F8EF7' : '#fff', color: region===r ? '#fff' : '#64748b',
                boxShadow:'0 1px 4px rgba(0,0,0,0.08)' }}>
              {r}
            </button>
          ))}
        </div>
        <div style={{ display:'flex', gap:8, padding:'6px 16px 8px', flexWrap:'wrap', alignItems:'center' }}>
          <div style={{ display:'flex', background:'#fff', borderRadius:8, border:'1px solid #ddd', overflow:'hidden', flexShrink:0 }}>
            <input
              value={nameQuery}
              onChange={e => setNameQuery(e.target.value)}
              onKeyDown={e => e.key==='Enter' && handleSearch()}
              placeholder="건물명 검색"
              style={{ padding:'6px 10px', border:'none', outline:'none', fontSize:13, width:140 }}
            />
            <button onClick={handleSearch}
              style={{ padding:'6px 10px', background:'#4F8EF7', color:'#fff', border:'none', cursor:'pointer', fontSize:12 }}>
              🔍
            </button>
          </div>
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
          <button onClick={handleSearch}
            style={{ padding:'6px 14px', background:'#4F8EF7', color:'#fff', border:'none', borderRadius:6, fontSize:13, cursor:'pointer' }}>
            검색
          </button>
          <span style={{ fontSize:13, color:'#94a3b8' }}>{properties.length}개 매물</span>
        </div>
      </div>

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
              <button onClick={closeSelected}
                style={{ background:'none', border:'none', fontSize:18, cursor:'pointer', color:'#94a3b8' }}>✕</button>
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
