import { useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { authApi } from '../api/endpoints.js'
import { applyAccountSidebarIcons } from '../utils/accountIcons.js'
import {
  applyHeaderAvatar,
  bindPageHeaderAvatars,
  normalizeAvatarUrl,
} from '../utils/userAvatar.js'
import { readImageAsDataUrl } from '../utils/avatarFile.js'

const PROFILE_PANEL_CLASS = 'account-profile-panel'

const profileHeadHtml = `
      <div class="account-profile-panel__head">
        <div class="account-profile-panel__avatar-col">
          <div class="account-profile-panel__avatar-wrap">
            <div class="account-profile-panel__avatar user-avatar-box" role="img" aria-label="Ảnh đại diện"></div>
          </div>
          <label class="account-profile-panel__avatar-upload">
            <input
              type="file"
              class="account-profile-panel__avatar-file"
              accept="image/jpeg,image/png,image/webp"
              hidden
            />
            Đổi ảnh
          </label>
          <button type="button" class="account-profile-panel__avatar-remove" hidden>
            Xóa ảnh
          </button>
          <p class="account-profile-panel__avatar-hint">JPG, PNG hoặc WEBP · tối đa 2MB</p>
        </div>
        <div class="account-profile-panel__identity">
          <p class="account-profile-panel__name"></p>
          <p class="account-profile-panel__email"></p>
        </div>
      </div>`

function syncAvatarActions(panel, user) {
  const removeBtn = panel?.querySelector('.account-profile-panel__avatar-remove')
  if (removeBtn) {
    removeBtn.hidden = !normalizeAvatarUrl(user?.avatarUrl)
  }
}

function ensureProfilePanel(host, user) {
  if (!host) return null

  let panel = host.querySelector(`.${PROFILE_PANEL_CLASS}`)
  if (!panel) {
    panel = document.createElement('section')
    panel.className = PROFILE_PANEL_CLASS
    panel.innerHTML = `${profileHeadHtml}
      <h3 class="account-profile-panel__title">Thông tin cá nhân</h3>
      <div class="account-profile-panel__grid">
        <label class="account-field">
          <span class="account-field__label">Họ và tên</span>
          <input type="text" name="fullName" class="account-field__input" autocomplete="name" />
        </label>
        <label class="account-field">
          <span class="account-field__label">Email</span>
          <input type="email" name="email" class="account-field__input" autocomplete="email" readonly />
        </label>
        <label class="account-field">
          <span class="account-field__label">Số điện thoại</span>
          <input type="tel" name="phone" class="account-field__input" autocomplete="tel" />
        </label>
      </div>
      <button type="button" class="account-profile-panel__save">Lưu thông tin</button>
      <p class="account-profile-panel__msg" hidden></p>
    `
    const passwordBlock = host.querySelector('[class*="frame792740-elm"]')
    if (passwordBlock) {
      host.insertBefore(panel, passwordBlock)
    } else {
      host.prepend(panel)
    }
  } else if (!panel.querySelector('.account-profile-panel__avatar-col')) {
    const wrap = document.createElement('div')
    wrap.innerHTML = profileHeadHtml
    const head = wrap.firstElementChild
    const oldHead = panel.querySelector('.account-profile-panel__head')
    if (oldHead) {
      oldHead.replaceWith(head)
    } else {
      panel.insertBefore(head, panel.firstChild)
    }
  }

  const fullNameInput = panel.querySelector('[name="fullName"]')
  const emailInput = panel.querySelector('[name="email"]')
  const phoneInput = panel.querySelector('[name="phone"]')
  if (fullNameInput) fullNameInput.value = user?.fullName || ''
  if (emailInput) emailInput.value = user?.email || ''
  if (phoneInput) phoneInput.value = user?.phone || ''

  const nameEl = panel.querySelector('.account-profile-panel__name')
  const emailEl = panel.querySelector('.account-profile-panel__email')
  if (nameEl) nameEl.textContent = user?.fullName?.trim() || 'Tài khoản'
  if (emailEl) emailEl.textContent = user?.email?.trim() || ''

  const avatarBox = panel.querySelector('.account-profile-panel__avatar')
  if (avatarBox) {
    applyHeaderAvatar(avatarBox, { isAuthenticated: Boolean(user), user })
  }
  syncAvatarActions(panel, user)

  return panel
}

function setMessage(el, text, type = 'info') {
  if (!el) return
  if (!text) {
    el.hidden = true
    el.textContent = ''
    el.classList.remove('account-form-msg--error', 'account-form-msg--success')
    return
  }
  el.hidden = false
  el.textContent = text
  el.classList.toggle('account-form-msg--error', type === 'error')
  el.classList.toggle('account-form-msg--success', type === 'success')
}

/**
 * Trang Thông tin tài khoản (/thay-doi-mat-khau) — hồ sơ + đổi mật khẩu trên layout Teleport.
 */
export function TeleportAccountBinder() {
  const { user, refresh, isAuthenticated } = useAuth()
  const cleanupRef = useRef(() => {})

  useEffect(() => {
    cleanupRef.current()

    const pageEl = document.querySelector('.teleport-page--thaydoimatkhau')
    if (!pageEl) return

    pageEl.querySelector('[class*="thaydoimatkhau-link"]')?.style.setProperty('display', 'none')
    applyAccountSidebarIcons(pageEl)

    const mainTitle = pageEl.querySelector('[class*="text-elm24"]')
    if (mainTitle) mainTitle.textContent = 'Thông tin tài khoản'

    const contentHost = pageEl.querySelector('[class*="frame792742-elm"]')
    const passwordBlock = contentHost?.querySelector('[class*="frame792740-elm"]')
    if (passwordBlock && !contentHost.querySelector('.account-password-heading')) {
      const heading = document.createElement('h3')
      heading.className = 'account-password-heading'
      heading.textContent = 'Thay đổi mật khẩu'
      contentHost.insertBefore(heading, passwordBlock)
    }

    const currentInput = pageEl.querySelector('[class*="input-elm1"]')
    const newInput = pageEl.querySelector('[class*="input-elm2"]')
    const confirmInput = pageEl.querySelector('[class*="input-elm3"]')
    const submitBtn = pageEl.querySelector('[class*="button-elm"]')

    ;[currentInput, newInput, confirmInput].forEach((input) => {
      if (!input) return
      input.type = 'password'
      input.autocomplete = input === currentInput ? 'current-password' : 'new-password'
      input.value = ''
    })

    const passwordMsg = document.createElement('p')
    passwordMsg.className = 'account-password-msg'
    passwordMsg.hidden = true
    submitBtn?.parentElement?.insertBefore(passwordMsg, submitBtn)

    if (!isAuthenticated) {
      setMessage(passwordMsg, 'Vui lòng đăng nhập để quản lý tài khoản.', 'error')
      return
    }

    const profilePanel = ensureProfilePanel(contentHost, user)
    const profileMsg = profilePanel?.querySelector('.account-profile-panel__msg')
    const saveProfileBtn = profilePanel?.querySelector('.account-profile-panel__save')
    const avatarFileInput = profilePanel?.querySelector('.account-profile-panel__avatar-file')
    const avatarRemoveBtn = profilePanel?.querySelector('.account-profile-panel__avatar-remove')
    const avatarUploadLabel = profilePanel?.querySelector('.account-profile-panel__avatar-upload')

    const syncAccountAvatars = (nextUser) => {
      if (profilePanel) ensureProfilePanel(contentHost, nextUser)
      bindPageHeaderAvatars(pageEl, { isAuthenticated: true, user: nextUser })
    }

    const onAvatarPick = async (e) => {
      const file = e.target?.files?.[0]
      e.target.value = ''
      if (!file) return
      setMessage(profileMsg, '')
      if (avatarUploadLabel) avatarUploadLabel.style.pointerEvents = 'none'
      try {
        const dataUrl = await readImageAsDataUrl(file)
        const res = await authApi.uploadAvatar({ dataUrl })
        await refresh()
        syncAccountAvatars(res.user)
        setMessage(profileMsg, res.message || 'Đã cập nhật ảnh đại diện.', 'success')
      } catch (err) {
        setMessage(profileMsg, err.message || 'Không tải được ảnh.', 'error')
      } finally {
        if (avatarUploadLabel) avatarUploadLabel.style.pointerEvents = ''
      }
    }

    const onAvatarRemove = async () => {
      setMessage(profileMsg, '')
      try {
        const res = await authApi.removeAvatar()
        await refresh()
        syncAccountAvatars(res.user)
        setMessage(profileMsg, res.message || 'Đã xóa ảnh đại diện.', 'success')
      } catch (err) {
        setMessage(profileMsg, err.message || 'Không xóa được ảnh.', 'error')
      }
    }

    const onSaveProfile = async () => {
      if (!profilePanel) return
      const fullName = profilePanel.querySelector('[name="fullName"]')?.value?.trim()
      const phone = profilePanel.querySelector('[name="phone"]')?.value?.trim()
      setMessage(profileMsg, '')
      try {
        const { user: updated } = await authApi.updateProfile({ fullName, phone })
        await refresh()
        setMessage(profileMsg, 'Đã lưu thông tin tài khoản.', 'success')
        if (updated) syncAccountAvatars(updated)
      } catch (err) {
        setMessage(profileMsg, err.message || 'Không lưu được thông tin.', 'error')
      }
    }

    const onChangePassword = async (e) => {
      e.preventDefault()
      setMessage(passwordMsg, '')
      const currentPassword = currentInput?.value || ''
      const newPassword = newInput?.value || ''
      const confirmPassword = confirmInput?.value || ''

      if (!currentPassword || !newPassword || !confirmPassword) {
        setMessage(passwordMsg, 'Vui lòng điền đầy đủ các ô mật khẩu.', 'error')
        return
      }
      if (newPassword !== confirmPassword) {
        setMessage(passwordMsg, 'Xác nhận mật khẩu không khớp.', 'error')
        return
      }

      try {
        await authApi.changePassword({ currentPassword, newPassword, confirmPassword })
        if (currentInput) currentInput.value = ''
        if (newInput) newInput.value = ''
        if (confirmInput) confirmInput.value = ''
        setMessage(passwordMsg, 'Đã thay đổi mật khẩu thành công.', 'success')
      } catch (err) {
        setMessage(passwordMsg, err.message || 'Không đổi được mật khẩu.', 'error')
      }
    }

    saveProfileBtn?.addEventListener('click', onSaveProfile)
    submitBtn?.addEventListener('click', onChangePassword)
    avatarFileInput?.addEventListener('change', onAvatarPick)
    avatarRemoveBtn?.addEventListener('click', onAvatarRemove)

    cleanupRef.current = () => {
      saveProfileBtn?.removeEventListener('click', onSaveProfile)
      submitBtn?.removeEventListener('click', onChangePassword)
      avatarFileInput?.removeEventListener('change', onAvatarPick)
      avatarRemoveBtn?.removeEventListener('click', onAvatarRemove)
      passwordMsg.remove()
    }
  }, [user, isAuthenticated, refresh])

  useEffect(() => () => cleanupRef.current(), [])

  return null
}
