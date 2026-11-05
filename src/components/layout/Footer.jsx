import { Camera, Mail, MapPin } from 'lucide-react'

const currentYear = new Date().getFullYear()

function Footer() {
  return (
    <footer className="border-t border-zinc-100 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div><p className="mb-3 font-extrabold text-brand-deep">Genzstation<span className="text-brand-coral">.</span></p><p className="max-w-sm text-sm leading-6 text-zinc-500">One-Stop Shopping for Gen Z. Produk digital, lifestyle, kebutuhan harian, dan layanan kreatif dalam satu tempat.</p></div>
        <div><h2 className="mb-4 font-bold">Lokasi operasional</h2><p className="flex items-start gap-2 text-sm text-zinc-500"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /> Pamekasan &amp; Bangkalan, Madura, Jawa Timur</p></div>
        <div><h2 className="mb-4 font-bold">Tetap terhubung</h2><div className="flex gap-3 text-zinc-500"><a href="mailto:hello@genzstation.id" aria-label="Email" className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-bg hover:text-brand-purple"><Mail className="h-4 w-4" /></a><a href="#top" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-bg hover:text-brand-purple"><Camera className="h-4 w-4" /></a></div></div>
      </div>
      <div className="border-t border-zinc-100 py-5 text-center text-xs text-zinc-400">&copy; {currentYear} Genzstation.id</div>
    </footer>
  )
}

export default Footer
