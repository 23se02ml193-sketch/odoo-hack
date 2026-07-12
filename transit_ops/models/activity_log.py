# -*- coding: utf-8 -*-
from odoo import models, fields, api

class ActivityLog(models.Model):
    _name = 'transit.activity.log'
    _description = 'Transit Activity Log'
    _order = 'date desc'

    action = fields.Char(string='Action Done', required=True)
    user_id = fields.Many2one('res.users', string='Executed By', required=True, default=lambda self: self.env.user)
    date = fields.Datetime(string='Date', default=fields.Datetime.now, required=True)
    reference = fields.Char(string='Reference Document')


class TransitDashboard(models.TransientModel):
    _name = 'transit.dashboard'
    _description = 'TransitOps Dashboard'

    name = fields.Char(string="Dashboard", default="TransitOps Executive Dashboard")
    
    # KPIs
    active_vehicles = fields.Integer(compute='_compute_kpis')
    available_vehicles = fields.Integer(compute='_compute_kpis')
    drivers_available = fields.Integer(compute='_compute_kpis')
    drivers_on_trip = fields.Integer(compute='_compute_kpis')
    trips_today = fields.Integer(compute='_compute_kpis')
    maintenance_pending = fields.Integer(compute='_compute_kpis')
    fuel_cost = fields.Float(compute='_compute_kpis')
    operational_cost = fields.Float(compute='_compute_kpis')

    def _compute_kpis(self):
        for rec in self:
            rec.active_vehicles = self.env['transit.vehicle'].search_count([('status', '!=', 'retired')])
            rec.available_vehicles = self.env['transit.vehicle'].search_count([('status', '=', 'available')])
            rec.drivers_available = self.env['transit.driver'].search_count([('status', '=', 'available')])
            rec.drivers_on_trip = self.env['transit.driver'].search_count([('status', '=', 'on_trip')])
            rec.trips_today = self.env['transit.trip'].search_count([('dispatch_date', '>=', fields.Datetime.now().replace(hour=0, minute=0, second=0))])
            rec.maintenance_pending = self.env['transit.maintenance'].search_count([('status', '=', 'pending')])
            
            # Sum fuel logs costs
            fuel_logs = self.env['transit.fuel.log'].search([])
            rec.fuel_cost = sum(fuel_logs.mapped('total_cost'))
            
            # Sum operational cost (expenses)
            expenses = self.env['transit.expense'].search([])
            rec.operational_cost = sum(expenses.mapped('amount'))

    def action_open_vehicles(self):
        return self.env['ir.actions.act_window']._for_xml_id('transit_ops.action_transit_vehicle')

    def action_open_drivers(self):
        return self.env['ir.actions.act_window']._for_xml_id('transit_ops.action_transit_driver')

    def action_open_trips(self):
        return self.env['ir.actions.act_window']._for_xml_id('transit_ops.action_transit_trip')

    def action_open_maintenance(self):
        return self.env['ir.actions.act_window']._for_xml_id('transit_ops.action_transit_maintenance')

