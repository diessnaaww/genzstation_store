function MetricCard({ title, value, icon: Icon, tone = 'bg-brand-lavender text-brand-purple', detail }) {
  return <div className="rounded-2xl border border-zinc-100 bg-white p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-zinc-400">{title}</p><p className="mt-3 text-2xl font-extrabold">{value}</p>{detail && <p className="mt-2 text-xs text-zinc-500">{detail}</p>}</div>{Icon && <div className={`rounded-xl p-3 ${tone}`}><Icon className="h-5 w-5" /></div>}</div></div>
}
export default MetricCard
