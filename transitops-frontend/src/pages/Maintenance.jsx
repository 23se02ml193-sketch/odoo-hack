import { useMemo, useState } from 'react'
import { Plus, Wrench, CheckCircle2 } from 'lucide-react'
import { useData } from '../context/DataContext'
import { PageHeader, Card, Button, Field, Input, Select, TextArea, EmptyState } from '../components/ui'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'

const emptyForm = { vehicleId: '', type: 'Oil Change', description: '', cost: '', date: new Date().toISOString().slice(0, 10) }

export default function Maintenance() {
  const { vehicles, maintenance, createMaintenance, closeMaintenance } = useData()
  const [statusFilter, setStatusFilter] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const eligibleVehicles = vehicles.filter((v) => v.status !== 'In Shop' && v.status !== 'Retired')

  const filtered = useMemo(() => maintenance.filter((m) => statusFilter === 'All' || m.status === statusFilter)
    .sort((a, b) => (a.date < b.date ? 1 : -1)), [maintenance, statusFilter])

  const vehicleOf = (id) => vehicles.find((v) => v.id === id)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.vehicleId || !form.cost) return
    createMaintenance({ ...form, cost: Number(form.cost) })
    setForm(emptyForm)
    setModalOpen(false)
  }

  return (
    <div>
      <PageHeader
        eyebrow="Vehicle lifecycle"
        title="Maintenance"
        subtitle="Opening a record automatically moves the vehicle to In Shop and out of dispatch."
        action={<Button onClick={() => setModalOpen(true)}><Plus size={15} /> New record</Button>}
      />

      <div className="mb-4 flex gap-2.5">
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
          <option value="All">All statuses</option>
          <option value="Active">Active</option>
          <option value="Closed">Closed</option>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={Wrench} title="No maintenance records" /></Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[--color-hairline] text-xs uppercase tracking-wider text-[--color-text-faint]">
                  <th className="px-4 py-3 font-medium">Vehicle</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Cost</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const v = vehicleOf(m.vehicleId)
                  return (
                    <tr key={m.id} className="border-b border-[--color-hairline] last:border-0 hover:bg-[--color-panel-raised]/50">
                      <td className="px-4 py-3 font-mono text-xs text-[--color-text]">{v?.regNumber || '—'}</td>
                      <td className="px-4 py-3 text-[--color-text-muted]">{m.type}</td>
                      <td className="px-4 py-3 text-[--color-text-muted]">{m.description}</td>
                      <td className="px-4 py-3 text-[--color-text]">₹{m.cost.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-xs text-[--color-text-muted]">{m.date}</td>
                      <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                      <td className="px-4 py-3 text-right">
                        {m.status === 'Active' && (
                          <Button variant="teal" onClick={() => closeMaintenance(m.id)} className="ml-auto"><CheckCircle2 size={14} /> Close</Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New maintenance record">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Vehicle" hint="Vehicles already In Shop or Retired aren't listed.">
            <Select required value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}>
              <option value="">Select vehicle</option>
              {eligibleVehicles.map((v) => <option key={v.id} value={v.id}>{v.regNumber} — {v.name}</option>)}
            </Select>
          </Field>
          <Field label="Maintenance Type">
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option>Oil Change</option>
              <option>Tyre Replacement</option>
              <option>Brake Service</option>
              <option>Engine Repair</option>
              <option>Body Work</option>
              <option>Other</option>
            </Select>
          </Field>
          <Field label="Description">
            <TextArea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What's being done…" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Cost (₹)"><Input required type="number" min="0" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} /></Field>
            <Field label="Date"><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create record</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
