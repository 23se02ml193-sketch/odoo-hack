import { useMemo, useState } from 'react'
import { Truck, CheckCircle2, Wrench, Route, Clock, UserCheck, Gauge } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useData } from '../context/DataContext'
import { Card, PageHeader, Select } from '../components/ui'
import { VEHICLE_TYPES, REGIONS } from '../data/seed'

function Kpi({ icon: Icon, label, value, tone = 'text' }) {
  const toneClass = {
    text: 'text-[--color-text]',
    amber: 'text-[--color-amber]',
    teal: 'text-[--color-teal]',
    info: 'text-[--color-info]',
    alert: 'text-[--color-alert]',
  }[tone]
  return (
    <Card className="route-line p-4">
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-xs text-[--color-text-muted]">{label}</p>
          <p className={`mt-2 font-[--font-display] text-2xl font-bold ${toneClass}`}>{value}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[--color-panel-raised]">
          <Icon size={16} className={toneClass} />
        </div>
      </div>
    </Card>
  )
}

const PIE_COLORS = { Available: '#3DDC97', 'On Trip': '#F4A825', 'In Shop': '#5B9FED', Retired: '#5A6478' }

export default function Dashboard() {
  const { vehicles, drivers, trips } = useData()
  const [typeFilter, setTypeFilter] = useState('All')
  const [regionFilter, setRegionFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  // Memoize filtered list to prevent recalculation on every render
  const filteredVehicles = useMemo(() => vehicles.filter((v) =>
    (typeFilter === 'All' || v.type === typeFilter) &&
    (regionFilter === 'All' || v.region === regionFilter) &&
    (statusFilter === 'All' || v.status === statusFilter)
  ), [vehicles, typeFilter, regionFilter, statusFilter])

  // Compute all metrics in a single pass through filtered data
  const metrics = useMemo(() => {
    const activeVehicles = filteredVehicles.filter((v) => v.status !== 'Retired').length
    const availableVehicles = filteredVehicles.filter((v) => v.status === 'Available').length
    const inMaintenance = filteredVehicles.filter((v) => v.status === 'In Shop').length
    const utilization = filteredVehicles.length ? Math.round((filteredVehicles.filter((v) => v.status === 'On Trip').length / filteredVehicles.length) * 100) : 0

    return { activeVehicles, availableVehicles, inMaintenance, utilization }
  }, [filteredVehicles])

  // Trip metrics (not filtered, global view)
  const tripMetrics = useMemo(() => {
    const activeTrips = trips.filter((t) => t.status === 'Dispatched').length
    const pendingTrips = trips.filter((t) => t.status === 'Draft').length
    const driversOnDuty = drivers.filter((d) => d.status === 'On Trip').length

    return { activeTrips, pendingTrips, driversOnDuty }
  }, [trips, drivers])

  // Memoize pie chart data
  const pieData = useMemo(() => {
    return ['Available', 'On Trip', 'In Shop', 'Retired'].map((status) => ({
      name: status,
      value: vehicles.filter((v) => v.status === status).length,
    })).filter((d) => d.value > 0)
  }, [vehicles])

  // Memoize bar chart data
  const tripBarData = useMemo(() => {
    return ['Draft', 'Dispatched', 'Completed', 'Cancelled'].map((status) => ({
      status,
      count: trips.filter((t) => t.status === status).length,
    }))
  }, [trips])

  return (
    <div>
      <PageHeader
        eyebrow="Live overview"
        title="Fleet operations dashboard"
        subtitle="Real-time status across vehicles, drivers, and dispatch."
        action={
          <div className="flex gap-2">
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-36">
              <option value="All">All types</option>
              {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
            <Select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} className="w-32">
              <option value="All">All regions</option>
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </Select>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-36">
              <option value="All">All statuses</option>
              {['Available', 'On Trip', 'In Shop', 'Retired'].map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi icon={Truck} label="Active Vehicles" value={metrics.activeVehicles} />
        <Kpi icon={CheckCircle2} label="Available Vehicles" value={metrics.availableVehicles} tone="teal" />
        <Kpi icon={Wrench} label="In Maintenance" value={metrics.inMaintenance} tone="info" />
        <Kpi icon={Route} label="Active Trips" value={tripMetrics.activeTrips} tone="amber" />
        <Kpi icon={Clock} label="Pending Trips" value={tripMetrics.pendingTrips} />
        <Kpi icon={UserCheck} label="Drivers On Duty" value={tripMetrics.driversOnDuty} tone="amber" />
        <Kpi icon={Gauge} label="Fleet Utilization" value={`${metrics.utilization}%`} tone="teal" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-2">
          <p className="mb-4 font-[--font-display] text-sm font-semibold text-[--color-text]">Fleet status split</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3}>
                  {pieData.map((entry) => <Cell key={entry.name} fill={PIE_COLORS[entry.name]} stroke="none" />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#182338', border: '1px solid #24304a', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {pieData.map((d) => (
              <span key={d.name} className="flex items-center gap-1.5 text-xs text-[--color-text-muted]">
                <span className="status-dot" style={{ background: PIE_COLORS[d.name] }} /> {d.name} ({d.value})
              </span>
            ))}
          </div>
        </Card>

        <Card className="p-5 lg:col-span-3">
          <p className="mb-4 font-[--font-display] text-sm font-semibold text-[--color-text]">Trips by lifecycle stage</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tripBarData} key="trip-bar-chart">
                <CartesianGrid strokeDasharray="3 3" stroke="#24304a" vertical={false} />
                <XAxis dataKey="status" stroke="#5A6478" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#5A6478" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#182338', border: '1px solid #24304a', borderRadius: 8, fontSize: 12 }} cursor={{ fill: 'rgba(244,168,37,0.06)' }} />
                <Bar dataKey="count" fill="#F4A825" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}
