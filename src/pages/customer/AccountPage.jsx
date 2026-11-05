import { LogOut, MapPin, UserRound } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../../services/supabase'
import { useAuth } from '../../contexts/AuthContext'

function AccountPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState({ full_name: '', whatsapp: '', avatar_url: '' })
  const [addresses, setAddresses] = useState([])
  const [addressForm, setAddressForm] = useState({ recipient_name: '', whatsapp: '', label: 'Rumah', province: '', city: '', district: '', village: '', detail: '', postal_code: '', courier_note: '', is_default: false })
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!user || !isSupabaseConfigured) return
    const [{ data: profileData }, { data: addressData }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false }).order('created_at'),
    ])
    if (profileData) setProfile(profileData)
    setAddresses(addressData || [])
  }, [user])

  useEffect(() => { load() }, [load])

  const saveProfile = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    if (!/^(\+62|62|0)[0-9]{8,14}$/.test(profile.whatsapp || '')) {
      setError('Format nomor WhatsApp tidak valid.')
      return
    }
    const { error: saveError } = await supabase.from('profiles').update({ full_name: profile.full_name, whatsapp: profile.whatsapp, avatar_url: profile.avatar_url || null, updated_at: new Date().toISOString() }).eq('id', user.id)
    if (saveError) setError(saveError.message)
    else setMessage('Profil berhasil diperbarui.')
  }

  const saveAddress = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    const payload = { ...addressForm, user_id: user.id }
    const query = editingAddressId
      ? supabase.from('addresses').update(payload).eq('id', editingAddressId).eq('user_id', user.id)
      : supabase.from('addresses').insert(payload)
    const { error: saveError } = await query
    if (saveError) setError(saveError.message)
    else {
      setMessage(editingAddressId ? 'Alamat berhasil diperbarui.' : 'Alamat berhasil ditambahkan.')
      setEditingAddressId(null)
      setAddressForm({ recipient_name: '', whatsapp: '', label: 'Rumah', province: '', city: '', district: '', village: '', detail: '', postal_code: '', courier_note: '', is_default: false })
      load()
    }
  }

  const editAddress = (address) => {
    setEditingAddressId(address.id)
    setAddressForm({ recipient_name: address.recipient_name, whatsapp: address.whatsapp, label: address.label, province: address.province, city: address.city, district: address.district, village: address.village, detail: address.detail, postal_code: address.postal_code || '', courier_note: address.courier_note || '', is_default: address.is_default })
  }

  const deleteAddress = async (id) => {
    const { error: deleteError } = await supabase.from('addresses').delete().eq('id', id).eq('user_id', user.id)
    if (deleteError) setError(deleteError.message)
    else load()
  }

  const setDefault = async (id) => {
    const { error: updateError } = await supabase.from('addresses').update({ is_default: true }).eq('id', id).eq('user_id', user.id)
    if (updateError) setError(updateError.message)
    else load()
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-brand-purple">Akunku</p><h1 className="mt-2 text-3xl font-extrabold">Profil & alamat</h1></div><button type="button" onClick={logout} className="flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2 text-sm font-bold"><LogOut className="h-4 w-4" /> Keluar</button></div>
      {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}
      <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
        <section className="rounded-3xl border border-zinc-100 bg-white p-6"><div className="mb-5 flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-lavender text-brand-purple">{profile.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full rounded-full object-cover" /> : <UserRound />}</div><div><p className="font-bold">{profile.full_name || 'Pelanggan'}</p><p className="text-xs text-zinc-500">{user?.email}</p></div></div><form onSubmit={saveProfile} className="space-y-4"><label className="block text-sm font-bold">Nama lengkap<input required value={profile.full_name || ''} onChange={(event) => setProfile({ ...profile, full_name: event.target.value })} className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-3 text-sm font-normal outline-none" /></label><label className="block text-sm font-bold">Nomor WhatsApp<input required value={profile.whatsapp || ''} onChange={(event) => setProfile({ ...profile, whatsapp: event.target.value })} className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-3 text-sm font-normal outline-none" /></label><label className="block text-sm font-bold">Foto profil (URL opsional)<input type="url" value={profile.avatar_url || ''} onChange={(event) => setProfile({ ...profile, avatar_url: event.target.value })} className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-3 text-sm font-normal outline-none" /></label><button type="submit" className="w-full rounded-xl bg-brand-purple px-4 py-3 text-sm font-bold text-white">Simpan profil</button></form></section>
        <section className="rounded-3xl border border-zinc-100 bg-white p-6"><div className="mb-5 flex items-center gap-2"><MapPin className="h-5 w-5 text-brand-purple" /><h2 className="font-extrabold">{editingAddressId ? 'Edit alamat' : 'Tambah alamat'}</h2></div><form onSubmit={saveAddress} className="grid gap-3 sm:grid-cols-2"><input required placeholder="Nama penerima" value={addressForm.recipient_name} onChange={(event) => setAddressForm({ ...addressForm, recipient_name: event.target.value })} className="rounded-xl border border-zinc-200 px-3 py-3 text-sm" /><input required placeholder="Nomor WhatsApp" value={addressForm.whatsapp} onChange={(event) => setAddressForm({ ...addressForm, whatsapp: event.target.value })} className="rounded-xl border border-zinc-200 px-3 py-3 text-sm" /><select value={addressForm.label} onChange={(event) => setAddressForm({ ...addressForm, label: event.target.value })} className="rounded-xl border border-zinc-200 px-3 py-3 text-sm"><option>Rumah</option><option>Kantor</option><option>Lainnya</option></select><input required placeholder="Provinsi" value={addressForm.province} onChange={(event) => setAddressForm({ ...addressForm, province: event.target.value })} className="rounded-xl border border-zinc-200 px-3 py-3 text-sm" /><input required placeholder="Kabupaten/Kota" value={addressForm.city} onChange={(event) => setAddressForm({ ...addressForm, city: event.target.value })} className="rounded-xl border border-zinc-200 px-3 py-3 text-sm" /><input required placeholder="Kecamatan" value={addressForm.district} onChange={(event) => setAddressForm({ ...addressForm, district: event.target.value })} className="rounded-xl border border-zinc-200 px-3 py-3 text-sm" /><input required placeholder="Kelurahan/Desa" value={addressForm.village} onChange={(event) => setAddressForm({ ...addressForm, village: event.target.value })} className="rounded-xl border border-zinc-200 px-3 py-3 text-sm" /><input placeholder="Kode pos" value={addressForm.postal_code} onChange={(event) => setAddressForm({ ...addressForm, postal_code: event.target.value })} className="rounded-xl border border-zinc-200 px-3 py-3 text-sm" /><textarea required placeholder="Detail alamat" value={addressForm.detail} onChange={(event) => setAddressForm({ ...addressForm, detail: event.target.value })} className="min-h-24 rounded-xl border border-zinc-200 px-3 py-3 text-sm sm:col-span-2" /><textarea placeholder="Catatan kurir" value={addressForm.courier_note} onChange={(event) => setAddressForm({ ...addressForm, courier_note: event.target.value })} className="rounded-xl border border-zinc-200 px-3 py-3 text-sm sm:col-span-2" /><label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={addressForm.is_default} onChange={(event) => setAddressForm({ ...addressForm, is_default: event.target.checked })} /> Alamat utama</label><button type="submit" className="rounded-xl bg-brand-purple px-4 py-3 text-sm font-bold text-white sm:col-span-2">{editingAddressId ? 'Simpan perubahan' : 'Tambah alamat'}</button></form><div className="mt-7 space-y-3">{addresses.map((address) => <article key={address.id} className="rounded-2xl border border-zinc-100 p-4"><div className="flex items-start justify-between gap-3"><div><div className="flex gap-2"><strong>{address.recipient_name}</strong>{address.is_default && <span className="rounded-full bg-brand-lime px-2 text-xs">Utama</span>}</div><p className="mt-1 text-sm text-zinc-500">{address.detail}, {address.village}, {address.district}, {address.city}, {address.province}</p></div><div className="flex gap-2 text-xs font-bold text-brand-purple"><button type="button" onClick={() => editAddress(address)}>Edit</button><button type="button" onClick={() => deleteAddress(address.id)}>Hapus</button></div></div>{!address.is_default && <button type="button" onClick={() => setDefault(address.id)} className="mt-3 text-xs font-bold text-brand-purple">Jadikan alamat utama</button>}</article>)}</div></section>
      </div>
    </div>
  )
}

export default AccountPage
