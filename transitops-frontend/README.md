# TransitOps — Frontend

A React + Tailwind frontend for the TransitOps hackathon brief: fleet, driver, dispatch,
maintenance, and expense management with RBAC and enforced business rules.

This is **frontend-only** — all data lives in the browser (React state persisted to
`localStorage`) and is seeded with demo vehicles, drivers, and trips so the app is usable
immediately. Swap the `DataContext` (`src/context/DataContext.jsx`) for real API calls
when your backend is ready — every screen already reads from and writes through it, so
you shouldn't need to touch the pages themselves.

## Run it

```bash
npm install
npm run dev
```

Open the printed local URL. Demo logins (password `demo123` for all):

| Role | Email |
|---|---|
| Fleet Manager | fleet@transitops.io |
| Driver | driver@transitops.io |
| Safety Officer | safety@transitops.io |
| Financial Analyst | finance@transitops.io |

Click a role card on the login screen to auto-fill credentials.

## What's built

- **Auth + RBAC** (`context/AuthContext.jsx`) — mock login, role-based nav & page access
- **Dashboard** — KPIs, filters (type/status/region), fleet-status pie, trip-lifecycle bar chart
- **Vehicle Registry** — CRUD, unique reg-number validation, search/filter/sort
- **Driver Management** — CRUD, license-expiry warnings, safety score display
- **Trip Management** — Draft → Dispatched → Completed/Cancelled, with live validation
  against every rule in section 4 of the brief (load capacity, license validity, double-booking, etc.)
- **Maintenance** — opening a record auto-flips the vehicle to "In Shop"; closing restores it
- **Fuel & Expenses** — logs + auto-computed operational cost per vehicle
- **Reports & Analytics** — fuel efficiency, cost breakdown, ROI charts (Recharts) + CSV export

## Where the business rules live

`src/utils/rules.js` has every validation function (license expiry, dispatch eligibility,
load-capacity check, unique reg number). `src/context/DataContext.jsx` calls into these
before any status-changing action, so the rules only need to be written once.

## Team split suggestion (3 people, ~8 hrs)

1. **Backend/API integrator** — replace `DataContext`'s localStorage calls with real
   endpoints; wire up `AuthContext.login` to a real auth API.
2. **Trips + Maintenance + Fuel/Expenses** — these three screens share the most business
   logic; one person owning all three avoids merge conflicts in `rules.js`.
3. **Dashboard + Reports + polish** — charts, CSV export, empty/loading states, and a pass
   over mobile responsiveness before demo.

## Stack

Vite, React 19, React Router 7, Tailwind CSS 4, Recharts, PapaParse (CSV), Lucide icons.
