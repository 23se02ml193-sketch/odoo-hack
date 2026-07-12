import { useMemo, useState, useCallback, useRef, useEffect } from 'react'
import { Plus, Route as RouteIcon, PlayCircle, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { useData } from '../context/DataContext'
import { PageHeader, Card, Button, Field, Input, Select, EmptyState } from '../components/ui'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import { validateTripCreation, createDebounce } from '../utils/rules'

const emptyForm = { source: '', destination: '', vehicleId: '', driverId: '', cargoWeight: '', plannedDistance: '' }

export default function Trips() {
  const { vehicles, drivers, trips, createTrip, dispatchTrip, completeTrip, cancelTrip, vehicleMap, driverMap } = useData()
  const [statusFilter, setStatusFilter] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [completeModal, setCompleteModal] = useState(null)
  const [completeForm, setCompleteForm] = useState({ actualDistance: '', fuelConsumed: '' })
  const [form, setForm] = useState(emptyForm)
  const [liveErrors, setLiveErrors] = useState([])

  // Pre-compute lookup maps for O(1) access
  const vMap = useMemo(() => vehicleMap(), [vehicleMap])
  const dMap = useMemo(() => driverMap(), [driverMap])

  const availableVehicles = useMemo(() => vehicles.filter((v) => v.status === 'Available'), [vehicles])
  const availableDrivers = useMemo(() => drivers.filter((d) => d.status === 'Available'), [drivers])

  const filtered = useMemo(() => trips.filter((t) => statusFilter === 'All' || t.status === statusFilter)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)), [trips, statusFilter])

  // Debounce live validation to avoid redundant checks
  const debouncedCheckLiveRef = useRef(null)
  useEffect(() => {
    if (!debouncedCheckLiveRef.current) {
      debouncedCheckLiveRef.current = createDebounce((next) => {
        const vehicle = vehicles.find((v) => v.id === next.vehicleId)
        const driver = drivers.find((d) => d.id === next.driverId)
        if (!vehicle && !driver && !next.cargoWeight) { setLiveErrors([]); return }
        setLiveErrors(validateTripCreation({ vehicle, driver, cargoWeight: Number(next.cargoWeight) || 0 }))
      }, 300)
    }
  }, [])

  const openCreate = () => { setForm(emptyForm); setLiveErrors([]); setModalOpen(true) }

  const updateForm = (patch) => {
    const next = { ...form, ...patch }
    setForm(next)
    // Debounce validation on every keystroke
    if (debouncedCheckLiveRef.current) {
      debouncedCheckLiveRef.current(next)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const result = createTrip(form)
    if (result.ok) setModalOpen(false)
  }

  const openComplete = (trip) => {
    setCompleteModal(trip)
    setCompleteForm({ actualDistance: trip.plannedDistance, fuelConsumed: '' })
  }

  const handleComplete = (e) => {
    e.preventDefault()
    completeTrip(completeModal.id, completeForm)
    setCompleteModal(null)
  }

  return (
    <div>
      <PageHeader
        eyebrow="Dispatch board"
        title="Trip Management"
        subtitle="Draft → Dispatched → Completed / Cancelled — validated against fleet rules at every step."
        action={<Button onClick={openCreate}><Plus size={15} /> New trip</Button>}
      />

      <div className="mb-4 flex gap-2.5">
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-44">
          <option value="All">All statuses</option>
          {['Draft', 'Dispatched', 'Completed', 'Cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={RouteIcon} title="No trips yet" subtitle="Create a trip to get it into the dispatch queue." /></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => {
            // Use pre-mapped lookups instead of .find() on every render
            const vehicle = vMap[t.vehicleId]
            const driver = dMap[t.driverId]
            return (
              <Card key={t.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[--color-panel-raised]">
                      <RouteIcon size={16} className="text-[--color-amber]" />
                    </div>
                    <div>
                      <p className="font-[--font-display] text-sm font-semibold text-[--color-text]">{t.source} → {t.destination}</p>
                      <p className="mt-0.5 text-xs text-[--color-text-muted]">
                        {vehicle?.regNumber || 'Unassigned'} · {driver?.name || 'Unassigned'} · {t.cargoWeight}kg · {t.plannedDistance}km planned
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={t.status} />
                    {t.status === 'Draft' && (
                      <>
                        <Button variant="teal" onClick={() => dispatchTrip(t.id)}><PlayCircle size={14} /> Dispatch</Button>
                        <Button variant="danger" onClick={() => cancelTrip(t.id)}><XCircle size={14} /> Cancel</Button>
                      </>
                    )}
                    {t.status === 'Dispatched' && (
                      <>
                        <Button variant="teal" onClick={() => openComplete(t)}><CheckCircle2 size={14} /> Complete</Button>
                        <Button variant="danger" onClick={() => cancelTrip(t.id)}><XCircle size={14} /> Cancel</Button>
                      </>
                    )}
                  </div>
                </div>
                {t.status === 'Completed' && (
                  <p className="mt-3 border-t border-[--color-hairline] pt-2.5 text-xs text-[--color-text-faint]">
                    Actual distance: <span className="font-mono text-[--color-text-muted]">{t.actualDistance}km</span> · Fuel consumed: <span className="font-mono text-[--color-text-muted]">{t.fuelConsumed}L</span>
                  </p>
                )}
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create trip" wide>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <Field label="Source"><Input required value={form.source} onChange={(e) => updateForm({ source: e.target.value })} placeholder="Ahmedabad" /></Field>
          <Field label="Destination"><Input required value={form.destination} onChange={(e) => updateForm({ destination: e.target.value })} placeholder="Surat" /></Field>
          <Field label="Vehicle" hint={`${availableVehicles.length} available`}>
            <Select required value={form.vehicleId} onChange={(e) => updateForm({ vehicleId: e.target.value })}>
              <option value="">Select vehicle</option>
              {availableVehicles.map((v) => <option key={v.id} value={v.id}>{v.regNumber} — {v.name} (max {v.maxLoad}kg)</option>)}
            </Select>
          </Field>
          <Field label="Driver" hint={`${availableDrivers.length} available`}>
            <Select required value={form.driverId} onChange={(e) => updateForm({ driverId: e.target.value })}>
              <option value="">Select driver</option>
              {availableDrivers.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.licenseCategory})</option>)}
            </Select>
          </Field>
          <Field label="Cargo Weight (kg)"><Input required type="number" min="1" value={form.cargoWeight} onChange={(e) => updateForm({ cargoWeight: e.target.value })} /></Field>
          <Field label="Planned Distance (km)"><Input required type="number" min="1" value={form.plannedDistance} onChange={(e) => updateForm({ plannedDistance: e.target.value })} /></Field>

          {liveErrors.length > 0 && (
            <div className="col-span-2 space-y-1 rounded-lg border border-[--color-alert-dim] bg-[--color-alert]/10 p-3">
              {liveErrors.map((err, i) => (
                <p key={i} className="flex items-start gap-1.5 text-xs text-[--color-alert]"><AlertCircle size={13} className="mt-0.5 shrink-0" /> {err}</p>
              ))}
            </div>
          )}

          <div className="col-span-2 mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={liveErrors.length > 0}>Create as Draft</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!completeModal} onClose={() => setCompleteModal(null)} title="Complete trip">
        <form onSubmit={handleComplete} className="space-y-4">
          <Field label="Final Odometer Distance Covered (km)">
            <Input required type="number" min="0" value={completeForm.actualDistance} onChange={(e) => setCompleteForm({ ...completeForm, actualDistance: e.target.value })} />
          </Field>
          <Field label="Fuel Consumed (liters)">
            <Input required type="number" min="0" step="0.1" value={completeForm.fuelConsumed} onChange={(e) => setCompleteForm({ ...completeForm, fuelConsumed: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setCompleteModal(null)}>Cancel</Button>
            <Button type="submit">Mark completed</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
