import { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { authApi } from '../api/endpoints.js'

export function AuthForms({ slug }) {
  if (slug === 'dangnhap') return <LoginForm />
  if (slug === 'dangky') return <RegisterForm />
  if (slug === 'dangxuat') return <LogoutPanel />
  if (slug === 'nhapemailkhoiphuc') return <ForgotPasswordForm />
  if (slug === 'khoiphucmatkhau') return <ResetPasswordForm />
  if (slug === 'thaydoimatkhau') return <ChangePasswordForm />
  return null
}

function FormBox({ title, children }) {
  return (
    <div className="auth-form-box">
      <h2 className="auth-form-box__title">{title}</h2>
      {children}
    </div>
  )
}

function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      const redirectTo = location.state?.from || '/trang-chu'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormBox title="Đăng nhập">
      <form onSubmit={submit} className="auth-form">
        <label>
          Email
          <input
            type="email"
            placeholder="Nhập email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <label>
          Mật khẩu
          <input
            type="password"
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        {error && <p className="auth-form__error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
        </button>
        <p className="auth-form__links">
          <Link to="/dang-ky">Đăng ký</Link>
          {' · '}
          <Link to="/nhap-email-khoi-phuc">Quên mật khẩu?</Link>
        </p>
      </form>
    </FormBox>
  )
}

function RegisterForm() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await register(form)
      navigate('/trang-chu')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormBox title="Đăng ký (MySQL)">
      <form onSubmit={submit} className="auth-form">
        {['fullName', 'email', 'phone', 'password'].map((key) => (
          <label key={key}>
            {key === 'fullName' ? 'Họ và tên' : key === 'password' ? 'Mật khẩu' : key}
            <input
              type={key === 'password' ? 'password' : key === 'email' ? 'email' : 'text'}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              required={key !== 'phone'}
            />
          </label>
        ))}
        {error && <p className="auth-form__error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Đang xử lý…' : 'Đăng ký'}
        </button>
      </form>
    </FormBox>
  )
}

function LogoutPanel() {
  const { logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const confirm = async () => {
    await logout()
    navigate('/dang-nhap')
  }

  if (!isAuthenticated) {
    return (
      <FormBox title="Đăng xuất">
        <p>Bạn chưa đăng nhập.</p>
      </FormBox>
    )
  }

  return (
    <FormBox title="Đăng xuất">
      <p>Bạn có muốn đăng xuất?</p>
      <button type="button" onClick={confirm}>
        Xác nhận đăng xuất
      </button>
    </FormBox>
  )
}

function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [devToken, setDevToken] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    const res = await authApi.forgotPassword({ email })
    setMsg(res.message)
    if (res.resetToken) setDevToken(res.resetToken)
  }

  return (
    <FormBox title="Khôi phục mật khẩu">
      <form onSubmit={submit} className="auth-form">
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <button type="submit">Tiếp tục</button>
        {msg && <p>{msg}</p>}
        {devToken && (
          <p>
            Dev token: <code>{devToken}</code> — dùng tại{' '}
            <Link to={`/khoi-phuc-mat-khau?token=${devToken}`}>Khôi phục</Link>
          </p>
        )}
      </form>
    </FormBox>
  )
}

function ResetPasswordForm() {
  const [params] = useSearchParams()
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const token = params.get('token') || ''

  const submit = async (e) => {
    e.preventDefault()
    await authApi.resetPassword({ token, password })
    setMsg('Đã đổi mật khẩu. Đăng nhập lại.')
  }

  return (
    <FormBox title="Đặt mật khẩu mới">
      <form onSubmit={submit} className="auth-form">
        <label>
          Mật khẩu mới
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={!token}>
          Xác nhận
        </button>
        {!token && <p className="auth-form__error">Thiếu token trong URL</p>}
        {msg && <p>{msg}</p>}
      </form>
    </FormBox>
  )
}

function ChangePasswordForm() {
  const { isAuthenticated } = useAuth()
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' })
  const [msg, setMsg] = useState('')

  if (!isAuthenticated) {
    return (
      <FormBox title="Thay đổi mật khẩu">
        <p>
          <Link to="/dang-nhap">Đăng nhập</Link> trước.
        </p>
      </FormBox>
    )
  }

  const submit = async (e) => {
    e.preventDefault()
    await authApi.changePassword(form)
    setMsg('Đã thay đổi mật khẩu.')
  }

  return (
    <FormBox title="Thay đổi mật khẩu">
      <form onSubmit={submit} className="auth-form">
        <label>
          Mật khẩu hiện tại
          <input
            type="password"
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
          />
        </label>
        <label>
          Mật khẩu mới
          <input
            type="password"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          />
        </label>
        <button type="submit">Xác nhận</button>
        {msg && <p>{msg}</p>}
      </form>
    </FormBox>
  )
}
