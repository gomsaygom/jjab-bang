import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'

export default function Home() {
  const navigate = useNavigate()

  const cards = [
    { icon:'📊', title:'실거래가 차트', desc:'국토교통부 공공데이터 기반 월별 추이', path:'/chart', color:'#3B82F6', bg:'#EFF6FF', border:'#BFDBFE' },
    { icon:'⭐', title:'익명 리뷰',    desc:'실거주자 인증 후 작성하는 솔직한 리뷰', path:'/map',   color:'#F59E0B', bg:'#FFFBEB', border:'#FDE68A' },
    { icon:'🛡️', title:'전세사기 예방', desc:'전세가율 계산 + 예방 체크리스트',       path:'/jeonse', color:'#10B981', bg:'#ECFDF5', border:'#A7F3D0' },
  ]

  return (
    <div style={{ minHeight:'100vh', background:'#F8FAFC' }}>
      <Header />

      {/* 히어로 */}
      <div style={{
        background:'linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #0F2744 100%)',
        padding:'clamp(48px,8vw,96px) 24px',
        textAlign:'center',
        position:'relative',
        overflow:'hidden',
      }}>
        <div style={{ position:'absolute', top:-80, right:-80, width:360, height:360, borderRadius:'50%', background:'rgba(59,130,246,0.07)' }}/>
        <div style={{ position:'absolute', bottom:-100, left:-100, width:480, height:480, borderRadius:'50%', background:'rgba(59,130,246,0.04)' }}/>
        <div style={{ position:'absolute', top:'30%', left:'10%', width:8, height:8, borderRadius:'50%', background:'rgba(96,165,250,0.4)' }}/>
        <div style={{ position:'absolute', top:'20%', right:'15%', width:5, height:5, borderRadius:'50%', background:'rgba(96,165,250,0.3)' }}/>

        <div style={{ position:'relative', maxWidth:640, margin:'0 auto' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(59,130,246,0.12)', border:'1px solid rgba(59,130,246,0.25)', borderRadius:24, padding:'6px 16px', marginBottom:24 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#60A5FA', display:'inline-block' }}/>
            <span style={{ color:'#93C5FD', fontSize:12, fontWeight:600, letterSpacing:0.5 }}>대학가 자취방 안심 플랫폼</span>
          </div>

          <h1 style={{ color:'#F8FAFC', fontSize:'clamp(28px,5.5vw,48px)', fontWeight:800, margin:'0 0 16px', lineHeight:1.25, letterSpacing:-1 }}>
            자취방 구하기 전<br/>
            <span style={{ background:'linear-gradient(90deg,#60A5FA,#818CF8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              진짜 정보
            </span>부터 확인하세요
          </h1>

          <p style={{ color:'#94A3B8', fontSize:'clamp(14px,2.5vw,17px)', marginBottom:40, lineHeight:1.8 }}>
            선배들의 솔직한 리뷰, 국토교통부 실거래가,<br/>
            전세사기 예방까지 한 곳에서
          </p>

          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => navigate('/map')}
              style={{ padding:'14px 32px', background:'linear-gradient(135deg,#3B82F6,#2563EB)', color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 20px rgba(59,130,246,0.35)' }}
              onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
              🗺️ 매물 지도 보기
            </button>
            <button onClick={() => navigate('/chart')}
              style={{ padding:'14px 32px', background:'rgba(255,255,255,0.08)', color:'#E2E8F0', border:'1px solid rgba(255,255,255,0.15)', borderRadius:12, fontSize:15, fontWeight:600, cursor:'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.13)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.08)'}>
              📊 실거래가 보기
            </button>
          </div>
        </div>
      </div>

      {/* 카드 */}
      <div style={{ maxWidth:960, margin:'0 auto', padding:'56px 20px 40px' }}>
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <p style={{ color:'#94A3B8', fontSize:12, fontWeight:700, letterSpacing:3, marginBottom:8, textTransform:'uppercase' }}>주요 기능</p>
          <h2 style={{ color:'#1E293B', fontSize:'clamp(20px,3vw,26px)', fontWeight:800, margin:0 }}>필요한 정보를 한눈에</h2>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:20 }}>
          {cards.map(c => (
            <div key={c.title} onClick={() => navigate(c.path)}
              style={{ background:'#fff', borderRadius:20, padding:'28px', cursor:'pointer', border:`1px solid ${c.border}`, boxShadow:'0 2px 8px rgba(0,0,0,0.05)', transition:'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.boxShadow=`0 16px 40px rgba(0,0,0,0.1)` }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.05)' }}
            >
              <div style={{ width:52, height:52, borderRadius:14, background:c.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, marginBottom:18 }}>
                {c.icon}
              </div>
              <h3 style={{ margin:'0 0 8px', fontSize:17, fontWeight:700, color:'#1E293B' }}>{c.title}</h3>
              <p style={{ color:'#64748B', fontSize:14, margin:'0 0 20px', lineHeight:1.65 }}>{c.desc}</p>
              <div style={{ display:'flex', alignItems:'center', gap:4, color:c.color, fontSize:13, fontWeight:700 }}>
                바로가기
                <span style={{ fontSize:16 }}>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 통계 */}
      <div style={{ maxWidth:960, margin:'0 auto 0', padding:'0 20px 56px' }}>
        <div style={{ background:'linear-gradient(135deg,#1E293B,#0F172A)', borderRadius:24, padding:'40px 32px', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24, textAlign:'center' }}>
          {[
            { num:'1,216+', label:'등록 매물', icon:'🏠' },
            { num:'4개',    label:'수집 지역', icon:'📍' },
            { num:'100%',   label:'익명 보장', icon:'🔒' },
          ].map((s,i) => (
            <div key={s.label} style={{ borderRight: i<2 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
              <div style={{ fontSize:24, marginBottom:8 }}>{s.icon}</div>
              <p style={{ margin:'0 0 4px', fontSize:'clamp(22px,4vw,32px)', fontWeight:800, color:'#F8FAFC' }}>{s.num}</p>
              <p style={{ margin:0, fontSize:13, color:'#64748B' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}