import { useEffect, useState } from 'react'
import { apiGet } from '../api/endpoints.js'

export function DbStatusBadge() {
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    apiGet('/health/db')
      .then((d) => setStatus(d.ok ? 'connected' : 'error'))
      .catch(() => setStatus('offline'))
  }, [])

  const labels = {
    checking: 'Đang kết nối MySQL…',
    connected: 'MySQL: đã kết nối',
    offline: 'MySQL: chưa kết nối',
    error: 'MySQL: lỗi',
  }

  return (
    <span className={`db-badge db-badge--${status}`} title={labels[status]}>
      {labels[status]}
    </span>
  )
}
