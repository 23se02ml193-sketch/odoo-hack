# TransitOps — Member 1 Setup Guide (Environment & Backend)

This covers everything on your plate: installing Odoo + PostgreSQL, dropping in
the module, and the hourly push cadence.

## 1. Install PostgreSQL

**Ubuntu/Debian / WSL:**
```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo -u postgres createuser -s $USER   # gives your OS user superuser DB rights
```

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
createuser -s $USER
```

If the hackathon provides a shared Odoo server / DB connection string instead,
skip this step and just plug those credentials into `odoo.conf` (step 3).

## 2. Install Odoo 17

```bash
git clone https://github.com/odoo/odoo.git --depth 1 --branch 17.0 odoo17
cd odoo17
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

If `pip install` fails on a package (common ones: `psycopg2`, `Pillow`,
`lxml`), install the OS build deps first:
```bash
sudo apt install -y python3-dev libxml2-dev libxslt1-dev libldap2-dev \
  libsasl2-dev libjpeg-dev build-essential libpq-dev
```

## 3. Drop in the custom module

Odoo loads addons from any folder passed via `--addons-path`. Create a
sibling folder for your team's custom code and place this module there:

```bash
mkdir -p ~/transitops-hackathon/custom_addons
cp -r transitops ~/transitops-hackathon/custom_addons/
```

Your final folder should look like:
```
custom_addons/
  transitops/
    __init__.py
    __manifest__.py
    models/
      __init__.py
      vehicle.py
      driver.py
      trip.py
      maintenance.py
      fuel_log.py
      expense.py
    security/
      transitops_security.xml
      ir.model.access.csv
    views/
      vehicle_views.xml
      driver_views.xml
      trip_views.xml
      maintenance_views.xml
      fuel_expense_views.xml
      transitops_menus.xml
    data/
      sequence_data.xml
```

## 4. Create the database and run the server

```bash
cd odoo17
source venv/bin/activate
./odoo-bin -d transitops_db \
  --addons-path=addons,custom_addons \
  -i transitops
```

- `-d transitops_db` creates/uses a DB called `transitops_db`
- `--addons-path` must include both Odoo's built-in `addons` folder AND your
  `custom_addons` folder
- `-i transitops` installs your module on first run (drop `-i` on later runs)

Open **http://localhost:8069**, create the database through the wizard if it
doesn't already exist, then log in. Go to **Settings → Users** to assign each
teammate to one of the four TransitOps groups (Fleet Manager / Driver /
Safety Officer / Financial Analyst) — enable developer mode
(**Settings → Activate developer mode**) if the groups aren't visible yet.

## 5. What's already built for you in this module

- **Models**: `transit.vehicle`, `transit.driver`, `transit.trip`,
  `transit.maintenance`, `transit.fuel.log`, `transit.expense`
- **Business logic enforced in Python** (not just UI):
  - Unique registration number / license number (SQL + Python constraints)
  - Cargo weight ≤ vehicle max load capacity
  - Vehicle/driver already `on_trip` can't be dispatched again
  - Suspended drivers / expired licenses blocked from dispatch
  - Retired or In Shop vehicles excluded via domain filters on the Trip form
  - Dispatch → both go `on_trip`; Complete → both go `available`;
    Cancel (from dispatched) → both restored to `available`
  - Creating a maintenance record → vehicle auto-flips to `in_shop`;
    closing it → vehicle restored to `available` (unless retired)
  - Computed fields: fuel efficiency, total operational cost, ROI
- **Security**: 4 role groups with an access-rights matrix in
  `ir.model.access.csv` (Fleet Manager and Financial Analyst get the widest
  write access; Driver can create/edit trips and log fuel; Safety Officer
  owns driver records)
- **Basic views** (list/form/search) for every model so the module is
  installable and demoable end-to-end today — Member 3 should treat these as
  a starting point to restyle, not final UI.

## 6. Your hourly push cadence

Suggested rhythm for the 8-hour window:
1. **Hour 1**: Env up, module installs cleanly, empty models visible in UI
2. **Hour 2–3**: Vehicle + Driver CRUD confirmed working via demo data
3. **Hour 4–5**: Trip dispatch/complete/cancel state machine tested against
   the example workflow in the problem statement (Van-05 / Alex scenario)
4. **Hour 6**: Maintenance auto-status-transition tested
5. **Hour 7**: Fuel/expense logging + computed cost fields verified
6. **Hour 8**: Buffer for bugs Member 2/3 find while building menus/reports

Push to GitHub after each milestone, not just at the end — commit early and
often so Member 2 can build the ER diagram/menus against real model names.

## 7. Quick manual test (mirrors the spec's example workflow)

1. Vehicles → New → `Van-05`, capacity 500 kg → Save
2. Drivers → New → `Alex`, license expiry in the future → Save
3. Trips → New → source/destination, pick Van-05 + Alex, cargo weight 450 →
   Save → click **Dispatch** (should succeed; Van-05/Alex now show `On Trip`)
4. Try cargo weight 600 kg on a new trip → Dispatch should raise a
   `ValidationError`
5. Click **Complete** on the first trip → Van-05/Alex return to `Available`
6. Maintenance → New → pick Van-05 → Save → vehicle status auto-flips to
   `In Shop` and disappears from the Trip form's vehicle domain
7. Click **Close** on the maintenance record → Van-05 returns to `Available`

## 8. Known gaps to flag to your team

- Dashboard KPI aggregation (Active Vehicles, Fleet Utilization %, etc.) and
  charts are Member 3's territory — the underlying computed fields
  (`fuel_efficiency`, `total_operational_cost`, `roi`) already exist on
  `transit.vehicle` for them to build against.
- CSV export works out of the box via Odoo's native list-view export;
  PDF export (optional per spec) isn't built — lowest priority if time runs out.
- Email reminders for expiring licenses (bonus) isn't built — could be a
  scheduled `ir.cron` action calling a method on `transit.driver` if time allows.
