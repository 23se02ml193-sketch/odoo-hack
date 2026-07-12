import { useMemo, useState } from 'react'
import { Plus, Fuel, Receipt } from 'lucide-react'
import { useData } from '../context/DataContext'
import { PageHeader, Card, Button, Field, Input, Select, TextArea, EmptyState } from '../components/ui'
import Modal from '../components/Modal'

const emptyFuelForm = { vehicleId: '', liters: '', cost: '', date: new Date().toISOString().slice(0, 10) }
const emptyExpenseForm = { vehicleId: '', type: 'Toll', amount: '', date: new Date().toISOString().slice(0, 10), note: '' }

export default function FuelExpenses() {
  const { vehicles, fuelLogs, expenses, addFuelLog, addExpense, vehicleOperationalCost, vehicleFuelCost, vehicleMaintenanceCost, vehicleExpenseCost } = useData()
  const [tab, setTab] = useState('fuel')
  const [fuelModal, setFuelModal] = useState(false)
  const [expenseModal, setExpenseModal] = useState(false)
  const [fuelForm, setFuelForm] = useState(emptyFuelForm)
  const [expenseForm, setExpenseForm] = useState(emptyExpenseForm)

  const vehicleOf = (id) => vehicles.find((v) => v.id === id)

  const costSummary = useMemo(() => vehicles.map((v) => ({
    vehicle: v,
    fuel: vehicleFuelCost(v.id),
    maintenance: vehicleMaintenanceCost(v.id),
    expenses: vehicleExpenseCost(v.id),
    total: vehicleOperationalCost(v.id),
  })).sort((a, b) => b.total - a.total), [vehicles, vehicleFuelCost, vehicleMaintenanceCost, vehicleExpenseCost, vehicleOperationalCost])

  const submitFuel = (e) => {
    e.preventDefault()
    addFuelLog(fuelForm)
    setFuelForm(emptyFuelForm)
    setFuelModal(false)
  }
  const submitExpense = (e) => {
    e.preventDefault()
    addExpense(expenseForm)
    setExpenseForm(emptyExpenseForm)
    setExpenseModal(false)
  }

  return (
    <div>
      <PageHeader
        eyebrow="Cost tracking"
        title="Fuel & Expense Management"
        subtitle="Operational cost per vehicle = Fuel + Maintenance + Other expenses, computed automatically."
        action={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setExpenseModal(true)}><Plus size={15} /> Log expense</Button>
            <Button onClick={() => setFuelModal(true)}><Plus size={15} /> Log fuel</Button>
          </div>
        }
      />

      {/* Per-vehicle cost summary */}
      <Card className="mb-6 overflow-hidden">
        <div className="border-b border-[--color-hairline] px-4 py-3">
          <p className="font-[--font-display] text-sm font-semibold text-[--color-text]">Operational cost by vehicle</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[--color-hairline] text-xs uppercase tracking-wider text-[--color-text-faint]">
                <th className="px-4 py-3 font-medium">Vehicle</th>
                <th className="px-4 py-3 font-medium">Fuel Cost</th>
                <th className="px-4 py-3 font-medium">Maintenance Cost</th>
                <th className="px-4 py-3 font-medium">Other Expenses</th>
                <th className="px-4 py-3 font-medium">Total Operational Cost</th>
              </tr>
            </thead>
            <tbody>
              {costSummary.map(({ vehicle, fuel, maintenance, expenses: exp, total }) => (
                <tr key={vehicle.id} className="border-b border-[--color-hairline] last:border-0 hover:bg-[--color-panel-raised]/50">
                  <td className="px-4 py-3 font-mono text-xs text-[--color-text]">{vehicle.regNumber}</td>
                  <td className="px-4 py-3 text-[--color-text-muted]">₹{fuel.toLocaleString()}</td>
                  <td className="px-4 py-3 text-[--color-text-muted]">₹{maintenance.toLocaleString()}</td>
                  <td className="px-4 py-3 text-[--color-text-muted]">₹{exp.toLocaleString()}</td>
                  <td className="px-4 py-3 font-semibold text-[--color-amber]">₹{total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Tabs */}
      <div className="mb-4 flex gap-2 border-b border-[--color-hairline]">
        <button onClick={() => setTab('fuel')} className={`focus-ring flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm ${tab === 'fuel' ? 'border-[--color-amber] text-[--color-amber]' : 'border-transparent text-[--color-text-muted] hover:text-[--color-text]'}`}>
          <Fuel size={14} /> Fuel Logs
        </button>
        <button onClick={() => setTab('expenses')} className={`focus-ring flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm ${tab === 'expenses' ? 'border-[--color-amber] text-[--color-amber]' : 'border-transparent text-[--color-text-muted] hover:text-[--color-text]'}`}>
          <Receipt size={14} /> Other Expenses
        </button>
      </div>

      {tab === 'fuel' ? (
        <Card className="overflow-hidden">
          {fuelLogs.length === 0 ? <EmptyState icon={Fuel} title="No fuel logs yet" /> : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[--color-hairline] text-xs uppercase tracking-wider text-[--color-text-faint]">
                  <th className="px-4 py-3 font-medium">Vehicle</th>
                  <th className="px-4 py-3 font-medium">Liters</th>
                  <th className="px-4 py-3 font-medium">Cost</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {fuelLogs.map((f) => (
                  <tr key={f.id} className="border-b border-[--color-hairline] last:border-0 hover:bg-[--color-panel-raised]/50">
                    <td className="px-4 py-3 font-mono text-xs text-[--color-text]">{vehicleOf(f.vehicleId)?.regNumber || '—'}</td>
                    <td className="px-4 py-3 text-[--color-text-muted]">{f.liters}L</td>
                    <td className="px-4 py-3 text-[--color-text-muted]">₹{f.cost.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[--color-text-muted]">{f.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      ) : (
        <Card className="overflow-hidden">
          {expenses.length === 0 ? <EmptyState icon={Receipt} title="No expenses logged yet" /> : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[--color-hairline] text-xs uppercase tracking-wider text-[--color-text-faint]">
                  <th className="px-4 py-3 font-medium">Vehicle</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Note</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id} className="border-b border-[--color-hairline] last:border-0 hover:bg-[--color-panel-raised]/50">
                    <td className="px-4 py-3 font-mono text-xs text-[--color-text]">{vehicleOf(e.vehicleId)?.regNumber || '—'}</td>
                    <td className="px-4 py-3 text-[--color-text-muted]">{e.type}</td>
                    <td className="px-4 py-3 text-[--color-text-muted]">₹{e.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[--color-text-muted]">{e.date}</td>
                    <td className="px-4 py-3 text-[--color-text-faint]">{e.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      <Modal open={fuelModal} onClose={() => setFuelModal(false)} title="Log fuel">
        <form onSubmit={submitFuel} className="space-y-4">
          <Field label="Vehicle">
            <Select required value={fuelForm.vehicleId} onChange={(e) => setFuelForm({ ...fuelForm, vehicleId: e.target.value })}>
              <option value="">Select vehicle</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.regNumber} — {v.name}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Liters"><Input required type="number" min="0" step="0.1" value={fuelForm.liters} onChange={(e) => setFuelForm({ ...fuelForm, liters: e.target.value })} /></Field>
            <Field label="Cost (₹)"><Input required type="number" min="0" value={fuelForm.cost} onChange={(e) => setFuelForm({ ...fuelForm, cost: e.target.value })} /></Field>
          </div>
          <Field label="Date"><Input type="date" value={fuelForm.date} onChange={(e) => setFuelForm({ ...fuelForm, date: e.target.value })} /></Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setFuelModal(false)}>Cancel</Button>
            <Button type="submit">Save log</Button>
          </div>
        </form>
      </Modal>

      <Modal open={expenseModal} onClose={() => setExpenseModal(false)} title="Log expense">
        <form onSubmit={submitExpense} className="space-y-4">
          <Field label="Vehicle">
            <Select required value={expenseForm.vehicleId} onChange={(e) => setExpenseForm({ ...expenseForm, vehicleId: e.target.value })}>
              <option value="">Select vehicle</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.regNumber} — {v.name}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Type">
              <Select value={expenseForm.type} onChange={(e) => setExpenseForm({ ...expenseForm, type: e.target.value })}>
                <option>Toll</option><option>Parking</option><option>Fine</option><option>Insurance</option><option>Other</option>
              </Select>
            </Field>
            <Field label="Amount (₹)"><Input required type="number" min="0" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} /></Field>
          </div>
          <Field label="Date"><Input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} /></Field>
          <Field label="Note"><TextArea value={expenseForm.note} onChange={(e) => setExpenseForm({ ...expenseForm, note: e.target.value })} /></Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setExpenseModal(false)}>Cancel</Button>
            <Button type="submit">Save expense</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
