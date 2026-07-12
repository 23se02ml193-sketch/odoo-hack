# -*- coding: utf-8 -*-
from odoo import models, fields, api
from odoo.exceptions import ValidationError

class FleetVehicle(models.Model):
    _name = 'transit.vehicle'
    _description = 'Fleet Vehicle'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char(string='Vehicle Name', required=True, tracking=True)
    registration_no = fields.Char(string='Registration Number', required=True, copy=False, tracking=True, index=True)
    model = fields.Char(string='Vehicle Model', required=True)
    type = fields.Selection([
        ('sedan', 'Sedan'),
        ('suv', 'SUV'),
        ('van', 'Van'),
        ('truck', 'Truck'),
        ('semi', 'Semi-Truck')
    ], string='Vehicle Type', default='truck', required=True)
    max_capacity = fields.Float(string='Maximum Load Capacity (kg)', required=True)
    odometer = fields.Float(string='Current Odometer (km)', tracking=True)
    purchase_date = fields.Date(string='Purchase Date')
    acquisition_cost = fields.Float(string='Acquisition Cost')
    insurance_expiry = fields.Date(string='Insurance Expiry', tracking=True)
    image = fields.Binary(string='Vehicle Image')
    document = fields.Binary(string='Vehicle Documents')
    status = fields.Selection([
        ('available', 'Available'),
        ('on_trip', 'On Trip'),
        ('in_shop', 'In Shop'),
        ('retired', 'Retired')
    ], string='Status', default='available', tracking=True, required=True, index=True)

    # Relationships
    trip_ids = fields.One2many('transit.trip', 'vehicle_id', string='Trips')
    fuel_ids = fields.One2many('transit.fuel.log', 'vehicle_id', string='Fuel Logs')
    maintenance_ids = fields.One2many('transit.maintenance', 'vehicle_id', string='Maintenance Logs')
    expense_ids = fields.One2many('transit.expense', 'vehicle_id', string='Expenses')

    # Smart Button Stats
    trip_count = fields.Integer(string='Trips Count', compute='_compute_stats')
    maintenance_count = fields.Integer(string='Maintenance Count', compute='_compute_stats')
    total_operational_cost = fields.Float(string='Total Operational Cost', compute='_compute_operational_cost', store=True)

    _sql_constraints = [
        ('unique_registration_no', 'unique(registration_no)', 'The registration number must be unique!')
    ]

    @api.depends('trip_ids', 'maintenance_ids')
    def _compute_stats(self):
        """Compute trip and maintenance counts. Using len() is efficient here as we already have the records."""
        for rec in self:
            rec.trip_count = len(rec.trip_ids)
            rec.maintenance_count = len(rec.maintenance_ids)

    @api.depends('expense_ids.amount')
    def _compute_operational_cost(self):
        """Compute total operational cost from expenses. Using mapped() is efficient for this aggregation."""
        for rec in self:
            rec.total_operational_cost = sum(rec.expense_ids.mapped('amount'))

    def action_view_trips(self):
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': 'Trips',
            'view_mode': 'tree,form',
            'res_model': 'transit.trip',
            'domain': [('vehicle_id', '=', self.id)],
            'context': {'default_vehicle_id': self.id},
        }

    def action_view_maintenance(self):
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': 'Maintenance Records',
            'view_mode': 'tree,form',
            'res_model': 'transit.maintenance',
            'domain': [('vehicle_id', '=', self.id)],
            'context': {'default_vehicle_id': self.id},
        }
