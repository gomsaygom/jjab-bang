import { useState } from 'react'
import Header from '../components/Header'

export default function JeonseCalc() {
  const [salePrice,   setSalePrice]   = useState('')
  const [jeonsePrice, setJeonsePrice] = useState('')
  const [result,      setResult]      = useState(null)

  const calculate = () => {
    const sale   = parseFloat(salePrice)
    const jeonse = parseFloat(jeonsePrice)
    if (!sale || !jeonse || sale <= 0) { alert('올바른 금액을 입력해주세요.'); return }
    const rate = (jeonse / sale) * 100
    let risk, color, desc
    if (rate >= 80) {
      risk = '위험'; color = '#dc2626'
      desc = '전세가율이 80% 이상입니다. 전세사기 위험이 높습니다. 계약 전 등기부등본을 반드시 확인하세요.'
    } else if (rate >= 60) {
      risk = '주의'; color = '#d97706'
      desc = '전세가율이 60~80% 수준입니다. 주의가 필요합니다. 근저당 설정 여부를 확인하세요.'
    } else {
      risk = '안전'; color = '#16a34a'
      desc = '전세가율이 60% 미만으로 비교적 안전합니다. 그래도 등기부등본 확인은 필수입니다.'
    }
    setResult({ rate: rate.toFixed(1), risk, color, desc })
  }

  const checklist = [
    { icon:'📄', text:'등기부등본 발급 후 근저당·가압류 확인' },
    { icon:'🏦', text:'선순위 채권 합계가 매매가의 70% 이하인지 확인' },
    { icon:'📋', text:'건축물대장으로 불법 건축물 여부 확인' },
    { icon:'🔑', text:'임대인 신분증과 등기부 소유자 일치 여부 확인' },
    { icon:'📬', text:'전입신고 + 확정일자 반드시 받기' },
    { icon:'🛡️', text:'전세보증보험 가입 (HUG/SGI서울보증) 검토' },
  ]

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc' }}>
      <Header />
      <div style={{ maxWidth:720, margin:'0 auto', padding:'32px 16px' }}>
        <h2 style={{ marginBottom:8 }}>🛡️ 전세가율 계산기</h2>
        <p style={{ color:'#64748b', marginBottom:28, fontSize:14 }}>매매가 대비 전세가 비율을 계산하여 전세사기 위험도를 확인합니다.</p>

        <div style={{ background:'#fff', borderRadius:16, padding:'24px', border:'1px solid #e2e8f0', marginBottom:24 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
            <div>
              <label style={{ display:'block', fontSize:13, color:'#64748b', marginBottom:6, fontWeight:600 }}>매매가 (만원)</label>
              <input type="number" value={salePrice} onChange={e => setSalePrice(e.target.value)}
                placeholder="예: 30000"
                style={{ width:'100%', padding:'12px', borderRadius:8, border:'1px solid #e2e8f0', fontSize:15, boxSizing:'border-box' }}/>
              {salePrice && <p style={{ margin:'4px 0 0', fontSize:12, color:'#94a3b8' }}>{(salePrice/10000).toFixed(2)}억원</p>}
            </div>
            <div>
              <label style={{ display:'block', fontSize:13, color:'#64748b', marginBottom:6, fontWeight:600 }}>전세가 (만원)</label>
              <input type="number" value={jeonsePrice} onChange={e => setJeonsePrice(e.target.value)}
                placeholder="예: 22000"
                style={{ width:'100%', padding:'12px', borderRadius:8, border:'1px solid #e2e8f0', fontSize:15, boxSizing:'border-box' }}/>
              {jeonsePrice && <p style={{ margin:'4px 0 0', fontSize:12, color:'#94a3b8' }}>{(jeonsePrice/10000).toFixed(2)}억원</p>}
            </div>
          </div>
          <button onClick={calculate}
            style={{ width:'100%', padding:'14px', background:'#4F8EF7', color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontSize:16, fontWeight:700 }}>
            전세가율 계산하기
          </button>
        </div>

        {result && (
          <div style={{ background:'#fff', borderRadius:16, padding:'24px', border:`2px solid ${result.color}`, marginBottom:24 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <h3 style={{ margin:0, fontSize:18 }}>계산 결과</h3>
              <span style={{ padding:'6px 18px', borderRadius:20, fontWeight:700, fontSize:15, background:result.color, color:'#fff' }}>{result.risk}</span>
            </div>
            <div style={{ marginBottom:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontSize:13, color:'#64748b' }}>전세가율</span>
                <span style={{ fontSize:20, fontWeight:700, color:result.color }}>{result.rate}%</span>
              </div>
              <div style={{ background:'#f1f5f9', borderRadius:8, height:14, overflow:'hidden' }}>
                <div style={{ height:'100%', borderRadius:8, transition:'width 0.5s', width:`${Math.min(result.rate,100)}%`, background:result.color }}/>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:4, fontSize:11, color:'#94a3b8' }}>
                <span>0%</span><span>60% (주의)</span><span>80% (위험)</span><span>100%</span>
              </div>
            </div>
            <div style={{ background:result.color+'15', borderRadius:10, padding:'14px', marginBottom:12 }}>
              <p style={{ margin:0, fontSize:14, color:result.color, fontWeight:600 }}>{result.desc}</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div style={{ background:'#f8fafc', borderRadius:10, padding:'14px', textAlign:'center' }}>
                <p style={{ margin:'0 0 4px', fontSize:12, color:'#64748b' }}>매매가</p>
                <p style={{ margin:0, fontSize:16, fontWeight:700 }}>{(salePrice/10000).toFixed(1)}억</p>
              </div>
              <div style={{ background:'#f8fafc', borderRadius:10, padding:'14px', textAlign:'center' }}>
                <p style={{ margin:'0 0 4px', fontSize:12, color:'#64748b' }}>전세가</p>
                <p style={{ margin:0, fontSize:16, fontWeight:700 }}>{(jeonsePrice/10000).toFixed(1)}억</p>
              </div>
            </div>
          </div>
        )}

        <div style={{ background:'#fff', borderRadius:16, padding:'24px', border:'1px solid #e2e8f0' }}>
          <h3 style={{ margin:'0 0 16px', fontSize:16 }}>📋 전세사기 예방 체크리스트</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {checklist.map((item, i) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'12px', background:'#f8fafc', borderRadius:10 }}>
                <span style={{ fontSize:20 }}>{item.icon}</span>
                <p style={{ margin:0, fontSize:14, color:'#374151' }}>{item.text}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop:16, padding:'14px', background:'#eff6ff', borderRadius:10, border:'1px solid #bfdbfe' }}>
            <p style={{ margin:0, fontSize:13, color:'#1d4ed8' }}>
              💡 <strong>등기부등본 무료 발급:</strong>{' '}
              <a href="https://www.iros.go.kr" target="_blank" rel="noreferrer" style={{ color:'#1d4ed8' }}>
                대법원 인터넷등기소 (www.iros.go.kr)
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}