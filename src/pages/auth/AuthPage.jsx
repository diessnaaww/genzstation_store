import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '../../services/googleSheets.js'
import { useAuth } from '../../contexts/AuthContext'

function AuthPage({ mode: modeProp }) {
  const { mode: routeMode } = useParams()
  const mode = modeProp || routeMode
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', whatsapp: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(location.state?.adminDenied ? 'Akses ditolak. Akun ini bukan administrator.' : '')
  const [message, setMessage] = useState(location.state?.configurationRequired ? 'Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.' : '')
  const [loading, setLoading] = useState(false)
  const isReset = mode === 'reset-password'
  const isForgot = mode === 'forgot-password'
  const isRegister = mode === 'register'

  if (user && !isReset && mode !== 'forgot-password' && !location.state?.adminDenied) {
    navigate('/akun', { replace: true })
    return null
  }

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value })
  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    if (!isSupabaseConfigured) {
      setError('Konfigurasi Supabase belum tersedia.')
      return
    }
    if (isRegister && form.password !== form.confirmPassword) {
      setError('Konfirmasi password tidak sama.')
      return
    }
    if (form.password && form.password.length < 8 && !isForgot) {
      setError('Password minimal 8 karakter.')
      return
    }
    setLoading(true)
    try {
      if (isForgot) {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(form.email, { redirectTo: `${window.location.origin}/reset-password` })
        if (authError) throw authError
        setMessage('Jika email terdaftar, tautan reset password telah dikirim.')
      } else if (isReset) {
        const { error: authError } = await supabase.auth.updateUser({ password: form.password })
        if (authError) throw authError
        setMessage('Password berhasil diperbarui.')
      } else if (isRegister) {
        const { error: authError } = await supabase.auth.signUp({ email: form.email, password: form.password, options: { data: { full_name: form.name, whatsapp: form.whatsapp } } })
        if (authError) throw authError
        setMessage('Registrasi berhasil. Periksa email untuk verifikasi jika Supabase mengaktifkan konfirmasi email.')
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
        if (authError) throw authError
        navigate(location.state?.from || '/akun', { replace: true })
      }
    } catch (authError) {
      setError(authError.message || 'Terjadi kesalahan autentikasi.')
    } finally {
      setLoading(false)
    }
  }

  const title = isReset ? 'Buat password baru' : isForgot ? 'Lupa password' : isRegister ? 'Daftar pelanggan' : 'Masuk'
  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <div className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-extrabold">{title}</h1>
        <p className="mt-2 text-sm text-zinc-500">{isRegister ? 'Buat akun untuk menyimpan profil dan keranjang.' : isForgot || isReset ? 'Ikuti proses pemulihan akun yang aman.' : 'Masuk untuk mengelola pesanan dan alamat.'}</p>
        <form onSubmit={submit} className="mt-7 space-y-4">
          {isRegister && <label className="block text-sm font-bold">Nama lengkap<input name="name" required value={form.name} onChange={update} className="mt-2 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm font-normal outline-none focus:border-brand-purple" /></label>}
          {!isReset && <label className="block text-sm font-bold">Email<input type="email" name="email" required value={form.email} onChange={update} className="mt-2 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm font-normal outline-none focus:border-brand-purple" /></label>}
          {isRegister && <label className="block text-sm font-bold">Nomor WhatsApp<input name="whatsapp" required placeholder="contoh: 62812..." value={form.whatsapp} onChange={update} className="mt-2 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm font-normal outline-none focus:border-brand-purple" /></label>}
          {!isForgot && <label className="block text-sm font-bold">Password<div className="relative mt-2"><input type={showPassword ? 'text' : 'password'} name="password" required value={form.password} onChange={update} className="w-full rounded-xl border border-zinc-200 px-4 py-3 pr-12 text-sm font-normal outline-none focus:border-brand-purple" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'} className="absolute right-3 top-3 text-zinc-400">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div></label>}
          {isRegister && <label className="block text-sm font-bold">Konfirmasi password<input type="password" name="confirmPassword" required value={form.confirmPassword} onChange={update} className="mt-2 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm font-normal outline-none focus:border-brand-purple" /></label>}
          {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          {message && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}
          <button disabled={loading} type="submit" className="w-full rounded-xl bg-brand-purple px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{loading ? 'Memproses...' : isReset ? 'Simpan password' : isForgot ? 'Kirim tautan reset' : isRegister ? 'Daftar' : 'Masuk'}</button>
        </form>
        {!isReset && <div className="mt-5 flex justify-between gap-3 text-sm"><Link to="/forgot-password" className="text-zinc-500">Lupa password?</Link>{isRegister ? <Link to="/login" className="font-bold text-brand-purple">Sudah punya akun</Link> : <Link to="/register" className="font-bold text-brand-purple">Daftar</Link>}</div>}
      </div>
    </div>
  )
}

export default AuthPage
