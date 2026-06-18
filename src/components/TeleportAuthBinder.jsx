import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { authApi } from '../api/endpoints.js'

function findByText(root, text) {
  const span = [...root.querySelectorAll('span')].find(
    (s) => s.textContent.trim() === text,
  )
  if (!span) return null
  return (
    span.closest('[class*="text-link-elm"]') ||
    span.closest('[class*="chactikhon-elm"]') ||
    span.closest('button') ||
    span.parentElement
  )
}

function ensureMessage(host) {
  if (!host) return null
  let el = host.querySelector('.auth-teleport-msg')
  if (!el) {
    el = document.createElement('p')
    el.className = 'auth-teleport-msg'
    el.setAttribute('role', 'alert')
    const submit = host.querySelector('button[class*="button-elm"]')
    if (submit?.parentElement) {
      submit.parentElement.insertBefore(el, submit)
    } else {
      host.appendChild(el)
    }
  }
  return el
}

function setMessage(el, text, type = 'error') {
  if (!el) return
  if (!text) {
    el.hidden = true
    el.textContent = ''
    return
  }
  el.textContent = text
  el.hidden = false
  el.classList.toggle('auth-teleport-msg--success', type === 'success')
  el.classList.toggle('auth-teleport-msg--error', type !== 'success')
}

function bindBackToLogin(page, navigate) {
  const host =
    page.querySelector('[class*="framengnhp-elm"]') ||
    page.querySelector('[class*="framengkngnhp-elm"]')
  if (!host) return null

  let link = host.querySelector('.auth-teleport-back')
  if (!link) {
    link = document.createElement('button')
    link.type = 'button'
    link.className = 'auth-teleport-back'
    link.textContent = 'Quay lại đăng nhập'
    host.appendChild(link)
  }

  const go = (e) => {
    e.preventDefault()
    e.stopPropagation()
    navigate('/dang-nhap')
  }
  link.addEventListener('click', go)

  return () => {
    link.removeEventListener('click', go)
    link.remove()
  }
}

function bindEnterSubmit(inputs, handler) {
  const onKey = (e) => {
    if (e.key === 'Enter') handler(e)
  }
  inputs.filter(Boolean).forEach((input) => {
    input.addEventListener('keydown', onKey)
  })
  return () => inputs.filter(Boolean).forEach((input) => input.removeEventListener('keydown', onKey))
}

/**
 * Gắn form auth trên layout Teleport (đăng nhập, đăng ký, khôi phục mật khẩu).
 */
export function TeleportAuthBinder({ slug }) {
  const { login, register, isAuthenticated, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const resetToken = searchParams.get('token') || ''
  const resetTokenRef = useRef(resetToken)
  resetTokenRef.current = resetToken
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (isAuthenticated && (slug === 'dangnhap' || slug === 'dangky')) {
      const redirectTo = location.state?.from || '/trang-chu'
      navigate(redirectTo, { replace: true })
    }
  }, [authLoading, isAuthenticated, slug, navigate, location.state])

  useEffect(() => {
    const page = document.querySelector(`.teleport-page--${slug}`)
    if (!page) return

    const cleanups = []

    page.querySelector('button[class*="button-group-elm"]')?.style.setProperty(
      'display',
      'none',
    )

    const headerLogo = page.querySelector('[class*="header-elm"] img[class*="logotchnn1-elm1"]')
    if (headerLogo) {
      headerLogo.style.cursor = 'pointer'
      const goHome = () => navigate('/trang-chu')
      headerLogo.addEventListener('click', goHome)
      cleanups.push(() => headerLogo.removeEventListener('click', goHome))
    }

    if (slug === 'dangnhap') {
      const formRoot = page.querySelector('[class*="framengkngnhp-elm"]')
      const emailInput = page.querySelector('[class*="input-elm1"]')
      const passwordInput = page.querySelector('[class*="input-elm2"]')
      const submitBtn = page.querySelector('button[class*="button-elm"]')
      const msgEl = ensureMessage(formRoot)

      if (emailInput) {
        emailInput.type = 'email'
        emailInput.name = 'email'
        emailInput.autocomplete = 'email'
        emailInput.required = true
      }
      if (passwordInput) {
        passwordInput.type = 'password'
        passwordInput.name = 'password'
        passwordInput.autocomplete = 'current-password'
        passwordInput.required = true
        passwordInput.placeholder = 'Nhập mật khẩu'
      }

      const doLogin = async (e) => {
        e?.preventDefault?.()
        setError('')
        setSubmitting(true)
        if (submitBtn) submitBtn.disabled = true
        try {
          await login(emailInput?.value?.trim() || '', passwordInput?.value || '')
          const redirectTo = location.state?.from || '/trang-chu'
          navigate(redirectTo, { replace: true })
        } catch (err) {
          const message = err?.message || 'Đăng nhập thất bại'
          setError(message)
          setMessage(msgEl, message, 'error')
        } finally {
          setSubmitting(false)
          if (submitBtn) submitBtn.disabled = false
        }
      }

      if (submitBtn) {
        submitBtn.type = 'button'
        submitBtn.addEventListener('click', doLogin)
        cleanups.push(() => submitBtn.removeEventListener('click', doLogin))
      }
      cleanups.push(bindEnterSubmit([emailInput, passwordInput], doLogin))

      const registerHost = findByText(page, 'Đăng ký')
      if (registerHost) {
        registerHost.style.cursor = 'pointer'
        const goRegister = (e) => {
          e.preventDefault()
          navigate('/dang-ky')
        }
        registerHost.addEventListener('click', goRegister)
        cleanups.push(() => registerHost.removeEventListener('click', goRegister))
      }

      const forgotHost = page.querySelector('[class*="chactikhon-elm2"]')
      if (forgotHost) {
        forgotHost.style.cursor = 'pointer'
        const goForgot = (e) => {
          e.preventDefault()
          navigate('/nhap-email-khoi-phuc')
        }
        forgotHost.addEventListener('click', goForgot)
        cleanups.push(() => forgotHost.removeEventListener('click', goForgot))
      }
    }

    if (slug === 'dangky') {
      const formRoot = page.querySelector('[class*="framengkngnhp-elm"]')
      const inputs = [...page.querySelectorAll('[class*="framengkngnhp-elm"] input')]
      const fullNameInput = inputs[0]
      const emailInput = inputs[1]
      const passwordInput = inputs[2]
      const confirmInput = inputs[3]
      const submitBtn = page.querySelector('button[class*="button-elm"]')
      const msgEl = ensureMessage(formRoot)

      if (emailInput) {
        emailInput.type = 'email'
        emailInput.autocomplete = 'email'
        emailInput.required = true
      }
      if (passwordInput) {
        passwordInput.type = 'password'
        passwordInput.autocomplete = 'new-password'
        passwordInput.required = true
      }
      if (confirmInput) {
        confirmInput.type = 'password'
        confirmInput.autocomplete = 'new-password'
        confirmInput.required = true
      }
      if (fullNameInput) fullNameInput.required = true

      const doRegister = async (e) => {
        e?.preventDefault?.()
        setError('')
        if (passwordInput?.value !== confirmInput?.value) {
          const message = 'Mật khẩu nhập lại không khớp'
          setError(message)
          setMessage(msgEl, message, 'error')
          return
        }
        setSubmitting(true)
        if (submitBtn) submitBtn.disabled = true
        try {
          await register({
            fullName: fullNameInput?.value?.trim() || '',
            email: emailInput?.value?.trim() || '',
            phone: '',
            password: passwordInput?.value || '',
          })
          navigate('/trang-chu', { replace: true })
        } catch (err) {
          const message = err?.message || 'Đăng ký thất bại'
          setError(message)
          setMessage(msgEl, message, 'error')
        } finally {
          setSubmitting(false)
          if (submitBtn) submitBtn.disabled = false
        }
      }

      if (submitBtn) {
        submitBtn.type = 'button'
        submitBtn.addEventListener('click', doRegister)
        cleanups.push(() => submitBtn.removeEventListener('click', doRegister))
      }
      cleanups.push(
        bindEnterSubmit(
          [fullNameInput, emailInput, passwordInput, confirmInput],
          doRegister,
        ),
      )

      const loginHost = findByText(page, 'Đăng nhập')
      if (loginHost) {
        loginHost.style.cursor = 'pointer'
        const goLogin = (e) => {
          e.preventDefault()
          navigate('/dang-nhap')
        }
        loginHost.addEventListener('click', goLogin)
        cleanups.push(() => loginHost.removeEventListener('click', goLogin))
      }
    }

    if (slug === 'nhapemailkhoiphuc') {
      const formRoot = page.querySelector('[class*="framengkngnhp-elm"]')
      const emailInput = page.querySelector('[class*="framengkngnhp-elm"] input')
      const submitBtn = page.querySelector('button[class*="button-elm"]')
      const msgEl = ensureMessage(formRoot)
      const backCleanup = bindBackToLogin(page, navigate)
      if (backCleanup) cleanups.push(backCleanup)

      if (emailInput) {
        emailInput.type = 'email'
        emailInput.autocomplete = 'email'
        emailInput.required = true
      }

      const doForgot = async (e) => {
        e?.preventDefault?.()
        setError('')
        setMessage(msgEl, '', 'error')
        setSubmitting(true)
        if (submitBtn) submitBtn.disabled = true
        try {
          const res = await authApi.forgotPassword({
            email: emailInput?.value?.trim() || '',
          })
          setMessage(msgEl, res.message, 'success')
          if (res.resetToken) {
            navigate(`/khoi-phuc-mat-khau?token=${encodeURIComponent(res.resetToken)}`, {
              replace: true,
            })
          }
        } catch (err) {
          const message = err?.message || 'Không gửi được yêu cầu khôi phục'
          setError(message)
          setMessage(msgEl, message, 'error')
        } finally {
          setSubmitting(false)
          if (submitBtn) submitBtn.disabled = false
        }
      }

      if (submitBtn) {
        submitBtn.type = 'button'
        submitBtn.addEventListener('click', doForgot)
        cleanups.push(() => submitBtn.removeEventListener('click', doForgot))
      }
      cleanups.push(bindEnterSubmit([emailInput], doForgot))
    }

    if (slug === 'khoiphucmatkhau') {
      const formRoot = page.querySelector('[class*="framengkngnhp-elm"]')
      const passwordInput = page.querySelector('[class*="input-elm1"]')
      const confirmInput = page.querySelector('[class*="input-elm2"]')
      const submitBtn = page.querySelector('button[class*="button-elm"]')
      const msgEl = ensureMessage(formRoot)
      const backCleanup = bindBackToLogin(page, navigate)
      if (backCleanup) cleanups.push(backCleanup)

      if (passwordInput) {
        passwordInput.type = 'password'
        passwordInput.autocomplete = 'new-password'
        passwordInput.required = true
      }
      if (confirmInput) {
        confirmInput.type = 'password'
        confirmInput.autocomplete = 'new-password'
        confirmInput.required = true
      }

      const doReset = async (e) => {
        e?.preventDefault?.()
        setError('')
        setMessage(msgEl, '', 'error')
        const token = resetTokenRef.current
        if (!token) {
          setMessage(msgEl, 'Thiếu token trong URL', 'error')
          return
        }
        if (passwordInput?.value !== confirmInput?.value) {
          const message = 'Mật khẩu nhập lại không khớp'
          setError(message)
          setMessage(msgEl, message, 'error')
          return
        }
        setSubmitting(true)
        if (submitBtn) submitBtn.disabled = true
        try {
          const res = await authApi.resetPassword({
            token,
            password: passwordInput?.value || '',
          })
          setMessage(msgEl, res.message || 'Đã đổi mật khẩu thành công', 'success')
          setTimeout(() => navigate('/dang-nhap', { replace: true }), 1200)
        } catch (err) {
          const message = err?.message || 'Không đổi được mật khẩu'
          setError(message)
          setMessage(msgEl, message, 'error')
          if (submitBtn) submitBtn.disabled = false
        } finally {
          setSubmitting(false)
        }
      }

      if (submitBtn) {
        submitBtn.type = 'button'
        submitBtn.addEventListener('click', doReset)
        cleanups.push(() => submitBtn.removeEventListener('click', doReset))
      }
      cleanups.push(bindEnterSubmit([passwordInput, confirmInput], doReset))
    }

    return () => cleanups.forEach((fn) => fn())
  }, [slug, login, register, navigate, location.state])

  useEffect(() => {
    if (slug !== 'khoiphucmatkhau') return
    const page = document.querySelector(`.teleport-page--${slug}`)
    const formRoot = page?.querySelector('[class*="framengkngnhp-elm"]')
    const submitBtn = page?.querySelector('button[class*="button-elm"]')
    const msgEl = ensureMessage(formRoot)
    if (!resetToken) {
      setMessage(
        msgEl,
        'Liên kết khôi phục không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu lại từ trang quên mật khẩu.',
        'error',
      )
      if (submitBtn) submitBtn.disabled = true
    } else if (submitBtn) {
      submitBtn.disabled = false
    }
  }, [slug, resetToken])

  useEffect(() => {
    const page = document.querySelector(`.teleport-page--${slug}`)
    const submitBtn = page?.querySelector('button[class*="button-elm"] span')
    if (!submitBtn) return
    if (slug === 'dangnhap') {
      submitBtn.textContent = submitting ? 'Đang đăng nhập…' : 'Đăng nhập'
    }
    if (slug === 'dangky') {
      submitBtn.textContent = submitting ? 'Đang xử lý…' : 'Đăng ký'
    }
    if (slug === 'nhapemailkhoiphuc') {
      submitBtn.textContent = submitting ? 'Đang gửi…' : 'Tiếp tục'
    }
    if (slug === 'khoiphucmatkhau') {
      submitBtn.textContent = submitting ? 'Đang xử lý…' : 'Xác nhận'
    }
  }, [slug, submitting])

  return null
}
