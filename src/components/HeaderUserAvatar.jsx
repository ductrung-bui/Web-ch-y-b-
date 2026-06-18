import { useState } from 'react'
import {
  avatarBackgroundColor,
  avatarInitial,
  normalizeAvatarUrl,
} from '../utils/userAvatar.js'

/** Avatar app-shell — ảnh hoặc 1 chữ + nền màu (kiểu Google) */
export function HeaderUserAvatar({ user, className = 'app-shell__avatar' }) {
  const url = normalizeAvatarUrl(user?.avatarUrl)
  const [broken, setBroken] = useState(false)
  const showImage = Boolean(url && !broken)
  const initial = avatarInitial(user)
  const bg = avatarBackgroundColor(user)

  const classes = [
    className,
    showImage ? '' : 'user-avatar--initial app-shell__avatar--initial',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span
      className={classes}
      title={user?.fullName || user?.email || ''}
      style={showImage ? undefined : { backgroundColor: bg, color: '#fff' }}
    >
      {showImage ? (
        <img
          className="app-shell__avatarImg teleport-user-avatar-img"
          src={url}
          alt={user?.fullName || user?.email || 'Avatar'}
          onError={() => setBroken(true)}
        />
      ) : (
        <span className="teleport-user-avatar-initial app-shell__avatarInitial" aria-hidden>
          {initial}
        </span>
      )}
    </span>
  )
}
