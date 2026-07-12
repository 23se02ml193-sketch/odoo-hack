# -*- coding: utf-8 -*-
from odoo import models, fields, api, _

class FuelLog(models.Model):
    _name = 'transit.fuel.log'
    _description = 'Fuel Log'
    _order = 'date desc, id desc'

    vehicle_id = fields.Many2one('transit.vehicle', string='Vehicle', required=True)
    fuel_type = fields.Selection([
        ('gasoline', 'Gasoline'),
        ('diesel', 'Diesel'),
        ('electric', 'Electric'),
        ('hybrid', 'Hybrid'),
        ('cng', 'CNG')
    ], string='Fuel Type', default='diesel', required=True)
    liters = fields.Float(string='Liters', required=True)
    price_per_liter = fields.Float(string='Price Per Liter ($)', required=True)
    total_cost = fields.Float(string='Total Cost ($)', compute='_compute_total_cost', store=True)
    station = fields.Char(string='Fuel Station')
    date = fields.Date(string='Date', default=fields.Date.context_today, required=True)
    odometer = fields.Float(string='Odometer (km)', required=True)
    
    # Computed metrics
    distance_since_last = fields.Float(string='Distance Since Last Fill (km)', compute='_compute_efficiency', store=True)
    fuel_efficiency = fields.Float(string='Fuel Efficiency (L/100km)', compute='_compute_efficiency', store=True)
    distance_per_liter = fields.Float(string='Distance per Liter (km/L)', compute='_compute_efficiency', store=True)

    @api.depends('liters', 'price_per_liter')
    def _compute_total_cost(self):
        for rec in self:
            rec.total_cost = rec.liters * rec.price_per_liter

    @api.depends('odometer', 'vehicle_id', 'liters')
    def _compute_efficiency(self):
        for rec in self:
            rec.distance_since_last = 0.0
            rec.fuel_efficiency = 0.0
            rec.distance_per_liter = 0.0
            if rec.vehicle_id and rec.odometer:
                # Find previous fuel log for this vehicle
                prev_log = self.search([
                    ('vehicle_id', '=', rec.vehicle_id.id),
                    ('date', '<=', rec.date),
                    ('id', '!=', rec.id or 0)
                ], order='date desc, id desc', limit=1)
                
                if prev_log and rec.odometer > prev_log.odometer:
                    dist = rec.odometer - prev_log.odometer
                    rec.distance_since_last = dist
                    if rec.liters > 0:
                        rec.fuel_efficiency = (rec.liters / dist) * 100
                        rec.distance_per_liter = dist / rec.liters

    @api.model_create_multi
    def create(self, vals_list):
        records = super(FuelLog, self).create(vals_list)
        for rec in records:
            # Sync odometer back to vehicle if it is greater than current
            if rec.odometer > (rec.vehicle_id.odometer or 0.0):
                rec.vehicle_id.odometer = rec.odometer
            
            # Auto-create Expense
            self.env['transit.expense'].create({
                'vehicle_id': rec.vehicle_id.id,
                'expense_type': 'fuel',
                'amount': rec.total_cost,
                'description': _('Fuel Station: %s, %s Liters @ $%s/L') % (rec.station or 'N/A', rec.liters, rec.price_per_liter),
                'expense_date': rec.date
            })
        return records
