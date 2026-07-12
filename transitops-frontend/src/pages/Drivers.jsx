import { useMemo, useState } from 'react'
import { Plus, Search, Pencil, Trash2, Users, AlertTriangle } from 'lucide-react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { PageHeader, Card, Button, Field, Input, Select, EmptyState } from '../components/ui'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import { DRIVER_STATUS } from '../data/seed'
import { isLicenseExpired, daysUntil } from '../utils/rules'

const emptyForm = { name: '', licenseNumber: '', licenseCategory: 'LMV', licenseExpiry: '', contact: '', safetyScore: 90, status: 'Available' }

export default function Drivers() {
  const { drivers, addDriver, updateDriver, deleteDriver } = useData()
  const { user } = useAuth()
  const canEdit = user?.role === 'Fleet Manager' || user?.role === 'Safety Officer'
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  const filtered = useMemo(() => drivers.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) &&
    (statusFilter === 'All' || d.status === statusFilter)
  ), [drivers, search, statusFilter])

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setErrors({}); setModalOpen(true) }
  const openEdit = (d) => { setEditingId(d.id); setForm({ ...d }); setErrors({}); setModalOpen(true) }

  const handleSubmit = (e) => {
    e.preventDefault()
    const localErrors = {}
    if (!form.name.trim()) localErrors.name = 'Required.'
    if (!form.licenseNumber.trim()) localErrors.licenseNumber = 'Required.'
    if (!form.licenseExpiry) localErrors.licenseExpiry = 'Required.'
    if (Object.keys(localErrors).length) { setErrors(localErrors); return }

    const payload = { ...form, safetyScore: Number(form.safetyScore) }
    if (editingId) updateDriver(editingId, payload)
    else addDriver(payload)
    setModalOpen(false)
  }

  return (
    <div>
      <PageHeader
        eyebrow="Compliance"
        title="Driver Management"
        subtitle="License validity, safety scores, and duty status for every driver."
        action={canEdit && <Button onClick={openCreate}><Plus size={15} /> Add driver</Button>}
      />

      <div className="mb-4 flex flex-wrap gap-2.5">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[--color-text-faint]" />
          <Input placeholder="Search by name…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
          <option value="All">All statuses</option>
          {DRIVER_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
      </div>

      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={Users} title="No drivers match your filters" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[--color-hairline] text-xs uppercase tracking-wider text-[--color-text-faint]">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">License No.</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Expiry</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Safety Score</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  {canEdit && <th className="px-4 py-3 font-medium text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => {
                  const expired = isLicenseExpired(d)
                  const soon = !expired && daysUntil(d.licenseExpiry) <= 30
                  return (
                    <tr key={d.id} className="border-b border-[--color-hairline] last:border-0 hover:bg-[--color-panel-raised]/50">
                      <td className="px-4 py-3 text-[--color-text]">{d.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-[--color-text-muted]">{d.licenseNumber}</td>
                      <td className="px-4 py-3 text-[--color-text-muted]">{d.licenseCategory}</td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1.5 font-mono text-xs ${expired ? 'text-[--color-alert]' : soon ? 'text-[--color-amber]' : 'text-[--color-text-muted]'}`}>
                          {(expired || soon) && <AlertTriangle size={12} />}
                          {d.licenseExpiry}{expired && ' (expired)'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[--color-text-muted]">{d.contact}</td>
                      <td className="px-4 py-3">
                        <span className={d.safetyScore >= 85 ? 'text-[--color-teal]' : d.safetyScore >= 70 ? 'text-[--color-amber]' : 'text-[--color-alert]'}>
                          {d.safetyScore}
                        </span>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                      {canEdit && (
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1.5">
                            <button onClick={() => openEdit(d)} className="focus-ring rounded-md p-1.5 text-[--color-text-muted] hover:bg-[--color-panel-raised] hover:text-[--color-amber]"><Pencil size={14} /></button>
                            <button onClick={() => deleteDriver(d.id)} className="focus-ring rounded-md p-1.5 text-[--color-text-muted] hover:bg-[--color-panel-raised] hover:text-[--color-alert]"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit driver' : 'Add driver'} wide>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <Field label="Full Name" error={errors.name}>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Contact Number">
            <Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="+91 90000 00000" />
          </Field>
          <Field label="License Number" error={errors.licenseNumber}>
            <Input value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} />
          </Field>
          <Field label="License Category">
            <Select value={form.licenseCategory} onChange={(e) => setForm({ ...form, licenseCategory: e.target.value })}>
              <option value="LMV">LMV</option>
              <option value="HMV">HMV</option>
              <option value="MC">Motorcycle</option>
            </Select>
          </Field>
          <Field label="License Expiry Date" error={errors.licenseExpiry}>
            <Input type="date" value={form.licenseExpiry} onChange={(e) => setForm({ ...form, licenseExpiry: e.target.value })} />
          </Field>
          <Field label="Safety Score (0–100)">
            <Input type="number" min="0" max="100" value={form.safetyScore} onChange={(e) => setForm({ ...form, safetyScore: e.target.value })} />
          </Field>
          <Field label="Status" hint="Trip actions also change this automatically.">
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {DRIVER_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </Field>
          <div className="col-span-2 mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editingId ? 'Save changes' : 'Add driver'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
