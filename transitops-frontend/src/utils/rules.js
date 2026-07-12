// Mandatory Business Rules — centralized so every page enforces the same logic.

export function isLicenseExpired(driver, asOf = new Date()) {
  if (!driver?.licenseExpiry) return false
  return new Date(driver.licenseExpiry) < asOf
}

export function isVehicleDispatchable(vehicle) {
  return vehicle && vehicle.status === 'Available'
}

export function isDriverAssignable(driver) {
  if (!driver) return false
  if (driver.status === 'Suspended' || driver.status === 'On Trip') return false
  if (isLicenseExpired(driver)) return false
  return true
}

export function isRegNumberUnique(vehicles, regNumber, excludeId = null) {
  const normalized = regNumber.trim().toLowerCase()
  return !vehicles.some((v) => v.id !== excludeId && v.regNumber.trim().toLowerCase() === normalized)
}

export function validateTripCreation({ vehicle, driver, cargoWeight }) {
  const errors = []
  if (!vehicle) errors.push('Select a vehicle.')
  else if (!isVehicleDispatchable(vehicle)) errors.push(`Vehicle ${vehicle.regNumber} is ${vehicle.status.toLowerCase()} and cannot be assigned.`)

  if (!driver) errors.push('Select a driver.')
  else if (driver.status === 'Suspended') errors.push(`${driver.name} is suspended and cannot be assigned.`)
  else if (driver.status === 'On Trip') errors.push(`${driver.name} is already on a trip.`)
  else if (isLicenseExpired(driver)) errors.push(`${driver.name}'s license expired on ${driver.licenseExpiry}.`)

  if (vehicle && cargoWeight > vehicle.maxLoad) {
    errors.push(`Cargo weight (${cargoWeight}kg) exceeds ${vehicle.name}'s max load capacity (${vehicle.maxLoad}kg).`)
  }
  if (!cargoWeight || cargoWeight <= 0) errors.push('Cargo weight must be greater than 0.')

  return errors
}

export function daysUntil(dateStr) {
  const diff = new Date(dateStr) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export const STATUS_COLORS = {
  // Vehicle / Driver
  Available: 'teal',
  'On Trip': 'amber',
  'In Shop': 'info',
  Retired: 'faint',
  Suspended: 'alert',
  'Off Duty': 'faint',
  // Trip
  Draft: 'faint',
  Dispatched: 'amber',
  Completed: 'teal',
  Cancelled: 'alert',
  // Maintenance
  Active: 'amber',
  Closed: 'teal',
}
