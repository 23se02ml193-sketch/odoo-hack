# TransitOps – Smart Transport Operations Platform

TransitOps is a complete, production-ready Odoo 18 Community module designed to manage fleet vehicles, drivers, trips, fuel efficiency, maintenance operations, and overall logistics costs.

## Features

- **Fleet Vehicle Tracking**: Vehicle model specifications, max capacities, status transitions, document uploads, and live odometer logs.
- **Driver Profiles**: Dynamic licensing expiry check reminders, safety scores, and assignment restrictions.
- **Trip Lifecycle**: Operational workflow (Draft -> Dispatched -> Completed / Cancelled) with automatic status propagation for drivers and vehicles.
- **Maintenance Tracking**: Automated cost expense entries, technician allocations, and status checks.
- **Dashboard**: Modern executive KPI cards (Active Vehicles, Cost Analytics, Trips Count) with responsive navigation buttons.
- **PDF QWeb Reports**: Standardized print templates for vehicles, trips, maintenance logs, and expenses.
- **Reminders Automation**: Cron tasks for vehicle insurance expiries, driver license renewals, and delayed dispatches.

## User Access Matrix

- **Fleet Manager**: Full permissions for all logistics and billing items.
- **Safety Officer**: Driver safety scores, licensing audits, and vehicle maintenance approvals.
- **Financial Analyst**: Fuel receipt monitoring, expense audits, and cost reports.
- **Driver**: Mobile-friendly access to own assigned trips and driver profile information.

## Installation

1. Copy the `transit_ops` directory to your Odoo custom addons directory.
2. Restart the Odoo server.
3. Activate Developer Mode in Odoo.
4. Go to **Apps -> Update Addons List**.
5. Search for "TransitOps" and click **Activate**.
