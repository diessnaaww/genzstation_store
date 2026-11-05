import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminHeader from '../../components/admin/AdminHeader'
const titles={'/admin':'Dashboard','/admin/products':'Manajemen Produk','/admin/categories':'Manajemen Kategori','/admin/orders':'Manajemen Pesanan','/admin/settings':'Pengaturan Toko'}
function AdminLayout(){
 const [open,setOpen]=useState(false);const location=useLocation()
 return <div className="min-h-screen bg-[#F8FAFC] lg:flex"><AdminSidebar open={open} onClose={()=>setOpen(false)}/><div className="min-w-0 flex-1"><AdminHeader title={titles[location.pathname]||'Admin'} onMenu={()=>setOpen(true)}/><main><Outlet/></main></div></div>
}
export default AdminLayout
