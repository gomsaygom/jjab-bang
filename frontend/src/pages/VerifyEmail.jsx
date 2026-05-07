import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../api/axios'

export default function VerifyEmail() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/auth/verify-email', { email, code })
      setSuccess('인증 완료! 로그인 페이지로 이동합니다.')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || '인증 실패')
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: 24 }}>
      <h2>이메일 인증</h2>
      <p style={{ color: '#666', marginBottom: 24 }}>
        <strong>{email}</strong>로 발송된 6자리 코드를 입력해주세요.
      </p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="6자리 코드 입력"
          maxLength={6}
          style={{ width: '100%', padding: 12, fontSize: 24, textAlign: 'center', letterSpacing: 8, marginBottom: 16 }}
        />
        <button type="submit" style={{ width: '100%', padding: 10, background: '#4F8EF7', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, cursor: 'pointer' }}>
          인증하기
        </button>
      </form>
    </div>
  )
}