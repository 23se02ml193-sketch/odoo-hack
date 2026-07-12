# -*- coding: utf-8 -*-
{
    'name': 'TransitOps – Smart Transport Operations Platform',
    'version': '18.0.1.0.0',
    'summary': 'Production-ready Fleet, Driver, Trip, and Maintenance Operations Management',
    'description': """
TransitOps is a comprehensive transport operations platform for Odoo 18.
Key Features:
- Fleet Vehicle Management with CRUD, search, Kanban, and image support.
- Driver Profiles with licensing validations, safety scoring, and status checks.
- Trip Workflow management (Draft -> Dispatched -> Completed / Cancelled).
- Auto-updated statuses for Vehicles and Drivers.
- Maintenance tracking with workflow validations.
- Automated Fuel Logs with efficiency calculations.
- Comprehensive Expense tracking and operational cost integration.
- Custom Odoo Dashboard showing operational KPIs and metrics.
- PDF QWeb Reports for Fleet, Trips, Expenses, and Maintenance.
- Scheduled actions for License, Insurance, and Maintenance reminders.
    """,
    'category': 'Operations/Transportation',
    'author': 'Antigravity AI',
    'website': 'https://github.com/antigravity',
    'depends': ['base', 'mail'],
    'data': [
        'security/transit_ops_security.xml',
        'security/ir.model.access.csv',
        'data/scheduled_actions.xml',
        'views/dashboard_views.xml',
        'views/fleet_vehicle_views.xml',
        'views/driver_views.xml',
        'views/trip_views.xml',
        'views/maintenance_views.xml',
        'views/fuel_log_views.xml',
        'views/expense_views.xml',
        'views/menu_views.xml',
        'reports/reports.xml',
        'reports/report_templates.xml',
    ],
    'demo': [
        'demo/demo_data.xml',
    ],
    'installable': True,
    'application': True,
    'license': 'LGPL-3',
}
