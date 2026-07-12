import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import {
  SEED_VEHICLES, SEED_DRIVERS, SEED_TRIPS, SEED_MAINTENANCE, SEED_FUEL_LOGS, SEED_EXPENSES,
} from '../data/seed'
import { validateTripCreation, isRegNumberUnique } from '../utils/rules'

const DataContext = createContext(null)

const KEYS = {
  vehicles: 'transitops.vehicles',
  drivers: 'transitops.drivers',
  trips: 'transitops.trips',
  maintenance: 'transitops.maintenance',
  fuelLogs: 'transitops.fuelLogs',
  expenses: 'transitops.expenses',
}

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

// Debounced batch localStorage sync
function useDebouncedLocalStorageSync(vehicles, drivers, trips, maintenance, fuelLogs, expenses) {
  const syncTimeoutRef = useRef(null)

  useEffect(() => {
    // Clear any pending sync
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)

    // Schedule a batch sync after 500ms of inactivity
    syncTimeoutRef.current = setTimeout(() => {
      localStorage.setItem(KEYS.vehicles, JSON.stringify(vehicles))
      localStorage.setItem(KEYS.drivers, JSON.stringify(drivers))
      localStorage.setItem(KEYS.trips, JSON.stringify(trips))
      localStorage.setItem(KEYS.maintenance, JSON.stringify(maintenance))
      localStorage.setItem(KEYS.fuelLogs, JSON.stringify(fuelLogs))
      localStorage.setItem(KEYS.expenses, JSON.stringify(expenses))
    }, 500)

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
    }
  }, [vehicles, drivers, trips, maintenance, fuelLogs, expenses])
}

export function DataProvider({ children }) {
  const [vehicles, setVehicles] = useState(() => load(KEYS.vehicles, SEED_VEHICLES))
  const [drivers, setDrivers] = useState(() => load(KEYS.drivers, SEED_DRIVERS))
  const [trips, setTrips] = useState(() => load(KEYS.trips, SEED_TRIPS))
  const [maintenance, setMaintenance] = useState(() => load(KEYS.maintenance, SEED_MAINTENANCE))
  const [fuelLogs, setFuelLogs] = useState(() => load(KEYS.fuelLogs, SEED_FUEL_LOGS))
  const [expenses, setExpenses] = useState(() => load(KEYS.expenses, SEED_EXPENSES))
  const [toast, setToast] = useState(null)

  // Batch localStorage writes with debounce instead of individual effects
  useDebouncedLocalStorageSync(vehicles, drivers, trips, maintenance, fuelLogs, expenses)

  // Pre-compute lookup maps for O(1) access instead of O(n) searches
  const vehicleMap = useCallback(() => {
    const map = {}
    vehicles.forEach((v) => { map[v.id] = v })
    return map
  }, [vehicles])

  const driverMap = useCallback(() => {
    const map = {}
    drivers.forEach((d) => { map[d.id] = d })
    return map
  }, [drivers])

  const notify = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() })
  }, [])

  // ---------- Vehicles ----------
  const addVehicle = useCallback((data) => {
    if (!isRegNumberUnique(vehicles, data.regNumber)) {
      notify('Registration number already exists.', 'error')
      return false
    }
    setVehicles((prev) => [...prev, { id: uid('v'), status: 'Available', ...data }])
    notify(`Vehicle ${data.regNumber} registered.`)
    return true
  }, [vehicles, notify])

  const updateVehicle = useCallback((id, data) => {
    if (data.regNumber && !isRegNumberUnique(vehicles, data.regNumber, id)) {
      notify('Registration number already exists.', 'error')
      return false
    }
    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, ...data } : v)))
    notify('Vehicle updated.')
    return true
  }, [vehicles, notify])

  const deleteVehicle = useCallback((id) => {
    setVehicles((prev) => prev.filter((v) => v.id !== id))
    notify('Vehicle removed.')
  }, [notify])

  // ---------- Drivers ----------
  const addDriver = useCallback((data) => {
    setDrivers((prev) => [...prev, { id: uid('d'), status: 'Available', ...data }])
    notify(`Driver ${data.name} added.`)
  }, [notify])

  const updateDriver = useCallback((id, data) => {
    setDrivers((prev) => prev.map((d) => (d.id === id ? { ...d, ...data } : d)))
    notify('Driver updated.')
  }, [notify])

  const deleteDriver = useCallback((id) => {
    setDrivers((prev) => prev.filter((d) => d.id !== id))
    notify('Driver removed.')
  }, [notify])

  // ---------- Trips ----------
  const createTrip = useCallback((data) => {
    const vehicle = vehicles.find((v) => v.id === data.vehicleId)
    const driver = drivers.find((d) => d.id === data.driverId)
    const errors = validateTripCreation({ vehicle, driver, cargoWeight: Number(data.cargoWeight) })
    if (errors.length) {
      notify(errors[0], 'error')
      return { ok: false, errors }
    }
    const trip = {
      id: uid('t'),
      source: data.source,
      destination: data.destination,
      vehicleId: data.vehicleId,
      driverId: data.driverId,
      cargoWeight: Number(data.cargoWeight),
      plannedDistance: Number(data.plannedDistance),
      actualDistance: null,
      fuelConsumed: null,
      status: 'Draft',
      createdAt: new Date().toISOString().slice(0, 10),
      dispatchedAt: null,
      completedAt: null,
    }
    setTrips((prev) => [trip, ...prev])
    notify('Trip created as Draft.')
    return { ok: true, trip }
  }, [vehicles, drivers, notify])

  const dispatchTrip = useCallback((tripId) => {
    const trip = trips.find((t) => t.id === tripId)
    if (!trip) return
    const vehicle = vehicles.find((v) => v.id === trip.vehicleId)
    const driver = drivers.find((d) => d.id === trip.driverId)
    const errors = validateTripCreation({ vehicle, driver, cargoWeight: trip.cargoWeight })
    if (errors.length) {
      notify(errors[0], 'error')
      return
    }
    setTrips((prev) => prev.map((t) => (t.id === tripId ? { ...t, status: 'Dispatched', dispatchedAt: new Date().toISOString().slice(0, 10) } : t)))
    setVehicles((prev) => prev.map((v) => (v.id === trip.vehicleId ? { ...v, status: 'On Trip' } : v)))
    setDrivers((prev) => prev.map((d) => (d.id === trip.driverId ? { ...d, status: 'On Trip' } : d)))
    notify('Trip dispatched. Vehicle & driver marked On Trip.')
  }, [trips, vehicles, drivers, notify])

  const completeTrip = useCallback((tripId, { actualDistance, fuelConsumed }) => {
    const trip = trips.find((t) => t.id === tripId)
    if (!trip) return
    setTrips((prev) => prev.map((t) => (t.id === tripId ? { ...t, status: 'Completed', completedAt: new Date().toISOString().slice(0, 10), actualDistance: Number(actualDistance), fuelConsumed: Number(fuelConsumed) } : t)))
    setVehicles((prev) => prev.map((v) => (v.id === trip.vehicleId ? { ...v, status: 'Available', odometer: v.odometer + Number(actualDistance || 0) } : v)))
    setDrivers((prev) => prev.map((d) => (d.id === trip.driverId ? { ...d, status: 'Available' } : d)))
    if (fuelConsumed && Number(fuelConsumed) > 0) {
      setFuelLogs((prev) => [...prev, { id: uid('f'), vehicleId: trip.vehicleId, liters: Number(fuelConsumed), cost: 0, date: new Date().toISOString().slice(0, 10) }])
    }
    notify('Trip completed. Vehicle & driver marked Available.')
  }, [trips, notify])

  const cancelTrip = useCallback((tripId) => {
    const trip = trips.find((t) => t.id === tripId)
    if (!trip) return
    const wasDispatched = trip.status === 'Dispatched'
    setTrips((prev) => prev.map((t) => (t.id === tripId ? { ...t, status: 'Cancelled' } : t)))
    if (wasDispatched) {
      setVehicles((prev) => prev.map((v) => (v.id === trip.vehicleId ? { ...v, status: 'Available' } : v)))
      setDrivers((prev) => prev.map((d) => (d.id === trip.driverId ? { ...d, status: 'Available' } : d)))
    }
    notify('Trip cancelled.')
  }, [trips, notify])

  // ---------- Maintenance ----------
  const createMaintenance = useCallback((data) => {
    const record = { id: uid('m'), status: 'Active', ...data, cost: Number(data.cost) }
    setMaintenance((prev) => [record, ...prev])
    setVehicles((prev) => prev.map((v) => (v.id === data.vehicleId ? { ...v, status: 'In Shop' } : v)))
    notify('Maintenance record created. Vehicle moved to In Shop.')
  }, [notify])

  const closeMaintenance = useCallback((id) => {
    const record = maintenance.find((m) => m.id === id)
    if (!record) return
    setMaintenance((prev) => prev.map((m) => (m.id === id ? { ...m, status: 'Closed' } : m)))
    setVehicles((prev) => prev.map((v) => {
      if (v.id !== record.vehicleId) return v
      if (v.status === 'Retired') return v
      return { ...v, status: 'Available' }
    }))
    notify('Maintenance closed. Vehicle restored to Available (unless retired).')
  }, [maintenance, notify])

  // ---------- Fuel & Expenses ----------
  const addFuelLog = useCallback((data) => {
    setFuelLogs((prev) => [{ id: uid('f'), ...data, liters: Number(data.liters), cost: Number(data.cost) }, ...prev])
    notify('Fuel log recorded.')
  }, [notify])

  const addExpense = useCallback((data) => {
    setExpenses((prev) => [{ id: uid('e'), ...data, amount: Number(data.amount) }, ...prev])
    notify('Expense recorded.')
  }, [notify])

  // ---------- Derived cost helpers with memoization ----------
  const vehicleFuelCost = useCallback((vehicleId) => {
    return fuelLogs.filter((f) => f.vehicleId === vehicleId).reduce((s, f) => s + f.cost, 0)
  }, [fuelLogs])

  const vehicleMaintenanceCost = useCallback((vehicleId) => {
    return maintenance.filter((m) => m.vehicleId === vehicleId).reduce((s, m) => s + m.cost, 0)
  }, [maintenance])

  const vehicleExpenseCost = useCallback((vehicleId) => {
    return expenses.filter((e) => e.vehicleId === vehicleId).reduce((s, e) => s + e.amount, 0)
  }, [expenses])

  const vehicleOperationalCost = useCallback((vehicleId) => {
    return vehicleFuelCost(vehicleId) + vehicleMaintenanceCost(vehicleId) + vehicleExpenseCost(vehicleId)
  }, [vehicleFuelCost, vehicleMaintenanceCost, vehicleExpenseCost])

  const vehicleDistance = useCallback((vehicleId) => {
    return trips.filter((t) => t.vehicleId === vehicleId && t.status === 'Completed').reduce((s, t) => s + (t.actualDistance || 0), 0)
  }, [trips])

  const vehicleFuelUsed = useCallback((vehicleId) => {
    return fuelLogs.filter((f) => f.vehicleId === vehicleId).reduce((s, f) => s + f.liters, 0)
  }, [fuelLogs])

  const resetDemoData = useCallback(() => {
    setVehicles(SEED_VEHICLES); setDrivers(SEED_DRIVERS); setTrips(SEED_TRIPS)
    setMaintenance(SEED_MAINTENANCE); setFuelLogs(SEED_FUEL_LOGS); setExpenses(SEED_EXPENSES)
    notify('Demo data reset.')
  }, [notify])

  const value = {
    vehicles, drivers, trips, maintenance, fuelLogs, expenses,
    vehicleMap, driverMap,
    addVehicle, updateVehicle, deleteVehicle,
    addDriver, updateDriver, deleteDriver,
    createTrip, dispatchTrip, completeTrip, cancelTrip,
    createMaintenance, closeMaintenance,
    addFuelLog, addExpense,
    vehicleFuelCost, vehicleMaintenanceCost, vehicleExpenseCost, vehicleOperationalCost, vehicleDistance, vehicleFuelUsed,
    resetDemoData,
    toast, clearToast: () => setToast(null),
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
