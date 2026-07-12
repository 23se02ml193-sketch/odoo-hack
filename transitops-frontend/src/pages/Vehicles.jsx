import { useMemo, useState } from 'react'
import { Plus, Search, Pencil, Trash2, Truck, ArrowUpDown } from 'lucide-react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { PageHeader, Card, Button, Field, Input, Select, EmptyState } from '../components/ui'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import { VEHICLE_TYPES, VEHICLE_STATUS, REGIONS } from '../data/seed'

const emptyForm = { regNumber: '', name: '', type: 'Van', maxLoad: '', odometer: '', acquisitionCost: '', status: 'Available', region: 'West' }

export default function Vehicles() {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useData()
  const { user } = useAuth()
  const canEdit = user?.role === 'Fleet Manager'
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortKey, setSortKey] = useState('regNumber')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  // Memoize filtered and sorted list
  const filtered = useMemo(() => {
    let list = vehicles.filter((v) =>
      (v.regNumber.toLowerCase().includes(search.toLowerCase()) || v.name.toLowerCase().includes(search.toLowerCase())) &&
      (typeFilter === 'All' || v.type === typeFilter) &&
      (statusFilter === 'All' || v.status === statusFilter)
    )
    list = [...list].sort((a, b) => (a[sortKey] > b[sortKey] ? 1 : -1))
    return list
  }, [vehicles, search, typeFilter, statusFilter, sortKey])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (v) => {
    setEditingId(v.id)
    setForm({ ...v })
    setErrors({})
    setModalOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const localErrors = {}
    if (!form.regNumber.trim()) localErrors.regNumber = 'Required.'
    if (!form.name.trim()) localErrors.name = 'Required.'
    if (!form.maxLoad || Number(form.maxLoad) <= 0) localErrors.maxLoad = 'Enter a positive number.'
    if (Object.keys(localErrors).length) { setErrors(localErrors); return }

    const payload = {
      ...form,
      maxLoad: Number(form.maxLoad),
      odometer: Number(form.odometer) || 0,
      acquisitionCost: Number(form.acquisitionCost) || 0,
    }
    const ok = editingId ? updateVehicle(editingId, payload) : addVehicle(payload)
    if (ok) setModalOpen(false)
  }

  return (
    <div>
      <PageHeader
        eyebrow="Fleet assets"
        title="Vehicle Registry"
        subtitle="Master list of every vehicle in the fleet, and its live dispatch status."
        action={canEdit && <Button onClick={openCreate}><Plus size={15} /> Register vehicle</Button>}
      />

      <div className="mb-4 flex flex-wrap gap-2.5">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[--color-text-faint]" />
          <Input placeholder="Search by reg. number or name…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-40">
          <option value="All">All types</option>
          {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
          <option value="All">All statuses</option>
          {VEHICLE_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Select value={sortKey} onChange={(e) => setSortKey(e.target.value)} className="w-44">
          <option value="regNumber">Sort: Reg. Number</option>
          <option value="name">Sort: Name</option>
          <option value="odometer">Sort: Odometer</option>
          <option value="status">Sort: Status</option>
        </Select>
      </div>

      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={Truck} title="No vehicles match your filters" subtitle="Try clearing search or filters, or register a new vehicle." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[--color-hairline] text-xs uppercase tracking-wider text-[--color-text-faint]">
                  <th className="px-4 py-3 font-medium">Reg. Number</th>
                  <th className="px-4 py-3 font-medium">Name / Model</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Max Load</th>
                  <th className="px-4 py-3 font-medium">Odometer</th>
                  <th className="px-4 py-3 font-medium">Region</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  {canEdit && <th className="px-4 py-3 font-medium text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr key={v.id} className="border-b border-[--color-hairline] last:border-0 hover:bg-[--color-panel-raised]/50">
                    <td className="px-4 py-3 font-mono text-xs text-[--color-text]">{v.regNumber}</td>
                    <td className="px-4 py-3 text-[--color-text]">{v.name}</td>
                    <td className="px-4 py-3 text-[--color-text-muted]">{v.type}</td>
                    <td className="px-4 py-3 text-[--color-text-muted]">{v.maxLoad.toLocaleString()} kg</td>
                    <td className="px-4 py-3 font-mono text-xs text-[--color-text-muted]">{v.odometer.toLocaleString()} km</td>
                    <td className="px-4 py-3 text-[--color-text-muted]">{v.region}</td>
                    <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                    {canEdit && (
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5">
                          <button onClick={() => openEdit(v)} className="focus-ring rounded-md p-1.5 text-[--color-text-muted] hover:bg-[--color-panel-raised] hover:text-[--color-amber]">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => deleteVehicle(v.id)} className="focus-ring rounded-md p-1.5 text-[--color-text-muted] hover:bg-[--color-panel-raised] hover:text-[--color-alert]">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit vehicle' : 'Register vehicle'} wide>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <Field label="Registration Number" error={errors.regNumber}>
            <Input value={form.regNumber} onChange={(e) => setForm({ ...form, regNumber: e.target.value })} placeholder="GJ-01-AB-1234" />
          </Field>
          <Field label="Name / Model" error={errors.name}>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Van-05" />
          </Field>
          <Field label="Type">
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </Field>
          <Field label="Region">
            <Select value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}>
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </Select>
          </Field>
          <Field label="Max Load Capacity (kg)" error={errors.maxLoad}>
            <Input type="number" min="1" value={form.maxLoad} onChange={(e) => setForm({ ...form, maxLoad: e.target.value })} />
          </Field>
          <Field label="Odometer (km)">
            <Input type="number" min="0" value={form.odometer} onChange={(e) => setForm({ ...form, odometer: e.target.value })} />
          </Field>
          <Field label="Acquisition Cost (₹)">
            <Input type="number" min="0" value={form.acquisitionCost} onChange={(e) => setForm({ ...form, acquisitionCost: e.target.value })} />
          </Field>
          <Field label="Status" hint="Manual override — trip/maintenance actions also change this automatically.">
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {VEHICLE_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </Field>
          <div className="col-span-2 mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editingId ? 'Save changes' : 'Register vehicle'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
