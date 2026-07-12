import { useMemo } from 'react'
import Papa from 'papaparse'
import { Download } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useData } from '../context/DataContext'
import { PageHeader, Card, Button } from '../components/ui'

export default function Reports() {
  const { vehicles, trips, vehicleFuelCost, vehicleMaintenanceCost, vehicleExpenseCost, vehicleOperationalCost, vehicleDistance, vehicleFuelUsed } = useData()

  const rows = useMemo(() => vehicles.map((v) => {
    const distance = vehicleDistance(v.id)
    const fuelUsed = vehicleFuelUsed(v.id)
    const fuel = vehicleFuelCost(v.id)
    const maintenanceCost = vehicleMaintenanceCost(v.id)
    const totalCost = vehicleOperationalCost(v.id)
    const fuelEfficiency = fuelUsed > 0 ? distance / fuelUsed : 0
    const utilization = trips.filter((t) => t.vehicleId === v.id && t.status !== 'Cancelled').length
    // Revenue is estimated at ₹28/km carried (placeholder rate — swap with your actual billing rate).
    const revenue = distance * 28
    const roi = v.acquisitionCost > 0 ? ((revenue - totalCost) / v.acquisitionCost) * 100 : 0
    return { vehicle: v, distance, fuelUsed, fuel, maintenanceCost, totalCost, fuelEfficiency, utilization, revenue, roi }
  }), [vehicles, trips, vehicleFuelCost, vehicleMaintenanceCost, vehicleExpenseCost, vehicleOperationalCost, vehicleDistance, vehicleFuelUsed])

  const exportCsv = () => {
    const csv = Papa.unparse(rows.map((r) => ({
      RegNumber: r.vehicle.regNumber,
      Name: r.vehicle.name,
      DistanceKm: r.distance,
      FuelUsedL: r.fuelUsed,
      FuelEfficiencyKmPerL: r.fuelEfficiency.toFixed(2),
      FuelCost: r.fuel,
      MaintenanceCost: r.maintenanceCost,
      TotalOperationalCost: r.totalCost,
      EstRevenue: r.revenue,
      ROIPercent: r.roi.toFixed(2),
    })))
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `transitops-report-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const efficiencyData = rows.map((r) => ({ name: r.vehicle.name, kmPerL: Number(r.fuelEfficiency.toFixed(2)) }))
  const costData = rows.map((r) => ({ name: r.vehicle.name, fuel: r.fuel, maintenance: r.maintenanceCost }))
  const roiData = rows.map((r) => ({ name: r.vehicle.name, roi: Number(r.roi.toFixed(1)) }))

  return (
    <div>
      <PageHeader
        eyebrow="Insights"
        title="Reports & Analytics"
        subtitle="Fuel efficiency, utilization, operational cost, and ROI — computed live from trip, fuel, and maintenance data."
        action={<Button onClick={exportCsv}><Download size={15} /> Export CSV</Button>}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <p className="mb-4 font-[--font-display] text-sm font-semibold text-[--color-text]">Fuel efficiency (km / liter)</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={efficiencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#24304a" vertical={false} />
                <XAxis dataKey="name" stroke="#5A6478" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#5A6478" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#182338', border: '1px solid #24304a', borderRadius: 8, fontSize: 12 }} cursor={{ fill: 'rgba(61,220,151,0.06)' }} />
                <Bar dataKey="kmPerL" fill="#3DDC97" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <p className="mb-4 font-[--font-display] text-sm font-semibold text-[--color-text]">Fuel vs. maintenance cost</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#24304a" vertical={false} />
                <XAxis dataKey="name" stroke="#5A6478" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#5A6478" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#182338', border: '1px solid #24304a', borderRadius: 8, fontSize: 12 }} cursor={{ fill: 'rgba(244,168,37,0.06)' }} />
                <Bar dataKey="fuel" stackId="a" fill="#F4A825" radius={[0, 0, 0, 0]} name="Fuel" />
                <Bar dataKey="maintenance" stackId="a" fill="#5B9FED" radius={[6, 6, 0, 0]} name="Maintenance" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <p className="mb-4 font-[--font-display] text-sm font-semibold text-[--color-text]">Estimated ROI by vehicle (%)</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={roiData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#24304a" vertical={false} />
                <XAxis dataKey="name" stroke="#5A6478" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#5A6478" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#182338', border: '1px solid #24304a', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="roi" stroke="#F4A825" strokeWidth={2} dot={{ fill: '#F4A825', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 text-[11px] text-[--color-text-faint]">
            ROI = (Estimated Revenue − (Maintenance + Fuel)) / Acquisition Cost. Revenue is estimated at a placeholder ₹28/km — wire this up to your real billing data.
          </p>
        </Card>
      </div>

      <Card className="mt-4 overflow-hidden">
        <div className="border-b border-[--color-hairline] px-4 py-3">
          <p className="font-[--font-display] text-sm font-semibold text-[--color-text]">Full report table</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[--color-hairline] text-xs uppercase tracking-wider text-[--color-text-faint]">
                <th className="px-4 py-3 font-medium">Vehicle</th>
                <th className="px-4 py-3 font-medium">Distance</th>
                <th className="px-4 py-3 font-medium">Fuel Efficiency</th>
                <th className="px-4 py-3 font-medium">Op. Cost</th>
                <th className="px-4 py-3 font-medium">Est. ROI</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.vehicle.id} className="border-b border-[--color-hairline] last:border-0 hover:bg-[--color-panel-raised]/50">
                  <td className="px-4 py-3 font-mono text-xs text-[--color-text]">{r.vehicle.regNumber}</td>
                  <td className="px-4 py-3 text-[--color-text-muted]">{r.distance.toLocaleString()} km</td>
                  <td className="px-4 py-3 text-[--color-text-muted]">{r.fuelEfficiency.toFixed(2)} km/L</td>
                  <td className="px-4 py-3 text-[--color-text-muted]">₹{r.totalCost.toLocaleString()}</td>
                  <td className={`px-4 py-3 font-medium ${r.roi >= 0 ? 'text-[--color-teal]' : 'text-[--color-alert]'}`}>{r.roi.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
