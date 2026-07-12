// Seed data — resets localStorage on first run or when "Reset demo data" is used.

export const ROLES = {
  FLEET_MANAGER: 'Fleet Manager',
  DRIVER: 'Driver',
  SAFETY_OFFICER: 'Safety Officer',
  FINANCIAL_ANALYST: 'Financial Analyst',
}

// Which routes each role can see/use.
export const ROLE_PERMISSIONS = {
  [ROLES.FLEET_MANAGER]: ['dashboard', 'vehicles', 'drivers', 'trips', 'maintenance', 'fuel', 'reports'],
  [ROLES.DRIVER]: ['dashboard', 'trips'],
  [ROLES.SAFETY_OFFICER]: ['dashboard', 'drivers'],
  [ROLES.FINANCIAL_ANALYST]: ['dashboard', 'fuel', 'reports'],
}

export const SEED_USERS = [
  { id: 'u1', name: 'Priya Shah', email: 'fleet@transitops.io', password: 'demo123', role: ROLES.FLEET_MANAGER },
  { id: 'u2', name: 'Alex Menon', email: 'driver@transitops.io', password: 'demo123', role: ROLES.DRIVER },
  { id: 'u3', name: 'Kabir Rao', email: 'safety@transitops.io', password: 'demo123', role: ROLES.SAFETY_OFFICER },
  { id: 'u4', name: 'Neha Iyer', email: 'finance@transitops.io', password: 'demo123', role: ROLES.FINANCIAL_ANALYST },
]

export const VEHICLE_TYPES = ['Van', 'Truck', 'Mini Truck', 'Trailer', 'Pickup']
export const VEHICLE_STATUS = ['Available', 'On Trip', 'In Shop', 'Retired']
export const DRIVER_STATUS = ['Available', 'On Trip', 'Off Duty', 'Suspended']
export const TRIP_STATUS = ['Draft', 'Dispatched', 'Completed', 'Cancelled']
export const REGIONS = ['North', 'South', 'East', 'West']

const today = new Date()
const daysFromNow = (n) => {
  const d = new Date(today)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}
const daysAgo = (n) => daysFromNow(-n)

export const SEED_VEHICLES = [
  { id: 'v1', regNumber: 'GJ-01-AB-1234', name: 'Van-05', type: 'Van', maxLoad: 500, odometer: 18420, acquisitionCost: 850000, status: 'Available', region: 'West' },
  { id: 'v2', regNumber: 'GJ-01-CD-5566', name: 'Truck-11', type: 'Truck', maxLoad: 3000, odometer: 52310, acquisitionCost: 2200000, status: 'On Trip', region: 'West' },
  { id: 'v3', regNumber: 'MH-04-EF-7788', name: 'Mini-02', type: 'Mini Truck', maxLoad: 1200, odometer: 30110, acquisitionCost: 1150000, status: 'In Shop', region: 'North' },
  { id: 'v4', regNumber: 'MH-04-GH-9012', name: 'Trailer-01', type: 'Trailer', maxLoad: 8000, odometer: 71050, acquisitionCost: 3500000, status: 'Available', region: 'South' },
  { id: 'v5', regNumber: 'DL-08-IJ-3344', name: 'Pickup-07', type: 'Pickup', maxLoad: 800, odometer: 9820, acquisitionCost: 650000, status: 'Retired', region: 'East' },
]

export const SEED_DRIVERS = [
  { id: 'd1', name: 'Alex Menon', licenseNumber: 'DL-MH-2019-001122', licenseCategory: 'LMV', licenseExpiry: daysFromNow(220), contact: '+91 98200 11223', safetyScore: 92, status: 'Available' },
  { id: 'd2', name: 'Ritu Verma', licenseNumber: 'DL-GJ-2018-004455', licenseCategory: 'HMV', licenseExpiry: daysFromNow(45), contact: '+91 90210 33445', safetyScore: 88, status: 'On Trip' },
  { id: 'd3', name: 'Sameer Khan', licenseNumber: 'DL-DL-2020-007788', licenseCategory: 'HMV', licenseExpiry: daysAgo(10), contact: '+91 99887 66554', safetyScore: 74, status: 'Available' },
  { id: 'd4', name: 'Farah Patel', licenseNumber: 'DL-MH-2021-009900', licenseCategory: 'LMV', licenseExpiry: daysFromNow(365), contact: '+91 91234 56780', safetyScore: 95, status: 'Suspended' },
]

export const SEED_TRIPS = [
  { id: 't1', source: 'Ahmedabad', destination: 'Surat', vehicleId: 'v2', driverId: 'd2', cargoWeight: 2400, plannedDistance: 265, actualDistance: null, fuelConsumed: null, status: 'Dispatched', createdAt: daysAgo(1), dispatchedAt: daysAgo(1), completedAt: null },
  { id: 't2', source: 'Mumbai', destination: 'Pune', vehicleId: 'v4', driverId: 'd1', cargoWeight: 5200, plannedDistance: 150, actualDistance: 154, fuelConsumed: 42, status: 'Completed', createdAt: daysAgo(6), dispatchedAt: daysAgo(6), completedAt: daysAgo(5) },
  { id: 't3', source: 'Delhi', destination: 'Jaipur', vehicleId: 'v5', driverId: 'd4', cargoWeight: 300, plannedDistance: 280, actualDistance: null, fuelConsumed: null, status: 'Cancelled', createdAt: daysAgo(9), dispatchedAt: daysAgo(9), completedAt: null },
]

export const SEED_MAINTENANCE = [
  { id: 'm1', vehicleId: 'v3', type: 'Oil Change', description: 'Routine service + brake pad check', cost: 4200, date: daysAgo(2), status: 'Active' },
  { id: 'm2', vehicleId: 'v2', type: 'Tyre Replacement', description: 'Rear tyres replaced', cost: 18500, date: daysAgo(20), status: 'Closed' },
]

export const SEED_FUEL_LOGS = [
  { id: 'f1', vehicleId: 'v2', liters: 120, cost: 12600, date: daysAgo(1) },
  { id: 'f2', vehicleId: 'v4', liters: 38, cost: 3990, date: daysAgo(6) },
  { id: 'f3', vehicleId: 'v1', liters: 25, cost: 2625, date: daysAgo(3) },
]

export const SEED_EXPENSES = [
  { id: 'e1', vehicleId: 'v2', type: 'Toll', amount: 850, date: daysAgo(1), note: 'Ahmedabad–Surat expressway' },
  { id: 'e2', vehicleId: 'v4', type: 'Parking', amount: 200, date: daysAgo(5), note: 'Pune depot' },
]
