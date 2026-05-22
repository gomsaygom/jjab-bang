import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import api from '../api/axios'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const DISTRICTS = ['역삼동', '자곡동', '도곡동', '개포동', '논현동', '압구정동', '청담동']
const TYPES     = ['오피스텔', '연립다세대']
const DEALS     = ['전세/월세', '매매']

export default function Chart() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [district,  setDistrict]  = useState('역삼동')
  const [type,      setType]      = useState('오피스텔')
  const [dealType,  setDealType]  = useState('전세/월세')
  const [chartData, setChartData] = useState([])
  const [loading,   setLoading]   = useState(false)

  useEffect(() => { fetchChart() }, [district, type, dealType])

  const fetchChart = async () => {
    setLoading(true)
    try {
      const res = await api.get('/public-data/chart', {
        params: { district, type, deal_type: dealType }
      })
      setChartData(res.data.map(row => ({
        label: `${row.deal_year}.${String(row.deal_month).padStart(2,'0')}`,
        avg:   Math.round(row.avg_price / 1000) / 10,
        count: row.count,
      })))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const data = {
    labels: chartData.map(r => r.label),
    datasets: [{
      label: '평균 보증금 (억원)',
      data: chartData.map(r => r.avg),
      borderColor: '#4F8EF7',
      backgroundColor: 'rgba(79,142,247,0.1)',
      borderWidth: 2.5,
      pointRadius: 5,
      pointBackgroundColor: '#4F8EF7',
      tension: 0.3,
      fill: true,
    }]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: ctx => `평균 보증금: ${ctx.raw}억원`,
        }
      }
    },
    scales: {
      y: {
        ticks: { callback: v => `${v}억` },
        grid: { color: '#f1f5f9' }
      },
      x: { grid: { color: '#f1f5f9' } }
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc' }}>
      {/* 헤더 */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 24px', background:'#fff', borderBottom:'1px solid #e2e8f0' }}>
        <h2 style={{ color:'#4F8EF7', cursor:'pointer', margin:0 }} onClick={() => navigate('/')}>🏠 짭방</h2>
        <div style={{ display:'flex', gap:12 }}>
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

      <div style={{ maxWidth:960, margin:'0 auto', padding:'32px 24px' }}>
        <h2 style={{ marginBottom:8 }}>📊 실거래가 추이 차트</h2>
        <p style={{ color:'#64748b', marginBottom:24, fontSize:14 }}>국토교통부 공공데이터 기반 실거래가 월별 평균</p>

        {/* 필터 */}
        <div style={{ display:'flex', gap:12, marginBottom:32, flexWrap:'wrap' }}>
          {[
            { label:'동네', value:district, set:setDistrict, opts:DISTRICTS },
            { label:'유형', value:type,     set:setType,     opts:TYPES },
            { label:'거래 유형', value:dealType, set:setDealType, opts:DEALS },
          ].map(f => (
            <div key={f.label}>
              <label style={{ fontSize:12, color:'#64748b', display:'block', marginBottom:4 }}>{f.label}</label>
              <select value={f.value} onChange={e => f.set(e.target.value)}
                style={{ padding:'8px 14px', borderRadius:8, border:'1px solid #e2e8f0', fontSize:14, background:'#fff' }}>
                {f.opts.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>

        {/* 차트 */}
        <div style={{ background:'#fff', borderRadius:16, padding:'24px', border:'1px solid #e2e8f0', marginBottom:24 }}>
          <h3 style={{ margin:'0 0 20px', fontSize:16, color:'#1e293b' }}>
            {district} · {type} · {dealType} 월평균 보증금 추이
          </h3>
          {loading ? (
            <div style={{ textAlign:'center', padding:'60px 0', color:'#94a3b8' }}>로딩 중...</div>
          ) : chartData.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 0', color:'#94a3b8' }}>해당 조건의 데이터가 없습니다.</div>
          ) : (
            <Line data={data} options={options} />
          )}
        </div>

        {/* 통계 카드 */}
        {chartData.length > 0 && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            {[
              { label:'총 거래 수',  value: chartData.reduce((s,r) => s+r.count, 0)+'건' },
              { label:'최고 평균가', value: Math.max(...chartData.map(r=>r.avg))+'억원' },
              { label:'최저 평균가', value: Math.min(...chartData.map(r=>r.avg))+'억원' },
            ].map(card => (
              <div key={card.label} style={{ background:'#fff', borderRadius:12, padding:'20px', border:'1px solid #e2e8f0', textAlign:'center' }}>
                <p style={{ fontSize:12, color:'#64748b', margin:'0 0 8px' }}>{card.label}</p>
                <p style={{ fontSize:22, fontWeight:700, color:'#4F8EF7', margin:0 }}>{card.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
