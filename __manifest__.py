{
    'name': 'TransitOps - Smart Transport Operations Platform',
    'version': '17.0.1.0.0',
    'summary': 'Vehicle, Driver, Trip, Maintenance, Fuel & Expense management for fleet operations',
    'description': """
TransitOps
==========
Digitizes vehicle, driver, dispatch, maintenance and expense management
with enforced business rules and operational analytics.

Modules covered:
- Vehicle Registry
- Driver Management
- Trip Management (Draft -> Dispatched -> Completed / Cancelled)
- Maintenance workflow (auto vehicle status transitions)
- Fuel & Expense tracking
- Dashboard KPIs & Reports (Fuel Efficiency, Fleet Utilization, Operational Cost, ROI)
""",
    'category': 'Operations/Fleet',
    'author': 'TransitOps Hackathon Team',
    'depends': ['base', 'mail'],
    'data': [
        'security/transitops_security.xml',
        'security/ir.model.access.csv',
        'data/sequence_data.xml',
        'views/vehicle_views.xml',
        'views/driver_views.xml',
        'views/trip_views.xml',
        'views/maintenance_views.xml',
        'views/fuel_expense_views.xml',
        'views/transitops_menus.xml',
    ],
    'installable': True,
    'application': True,
    'license': 'LGPL-3',
}
