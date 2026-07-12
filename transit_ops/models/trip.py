# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError
from datetime import date

class Trip(models.Model):
    _name = 'transit.trip'
    _description = 'Trip Record'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char(string='Trip Number', required=True, copy=False, readonly=True, default=lambda self: _('New'))
    source = fields.Char(string='Source', required=True, tracking=True)
    destination = fields.Char(string='Destination', required=True, tracking=True)
    vehicle_id = fields.Many2one('transit.vehicle', string='Vehicle', required=True, tracking=True)
    driver_id = fields.Many2one('transit.driver', string='Driver', required=True, tracking=True)
    cargo_weight = fields.Float(string='Cargo Weight (kg)', required=True, tracking=True)
    planned_distance = fields.Float(string='Planned Distance (km)')
    actual_distance = fields.Float(string='Actual Distance (km)', tracking=True)
    dispatch_date = fields.Datetime(string='Dispatch Date', tracking=True)
    completion_date = fields.Datetime(string='Completion Date', tracking=True)
    fuel_consumed = fields.Float(string='Fuel Consumed (Liters)', tracking=True)
    revenue = fields.Float(string='Revenue ($)', tracking=True)
    status = fields.Selection([
        ('draft', 'Draft'),
        ('dispatched', 'Dispatched'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled')
    ], string='Status', default='draft', tracking=True, required=True)

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('name', _('New')) == _('New'):
                vals['name'] = self.env['ir.sequence'].next_by_code('transit.trip') or _('New')
        return super(Trip, self).create(vals_list)

    @api.constrains('cargo_weight', 'vehicle_id')
    def _check_cargo_weight(self):
        for rec in self:
            if rec.vehicle_id and rec.cargo_weight > rec.vehicle_id.max_capacity:
                raise ValidationError(_("Cargo weight (%s kg) cannot exceed vehicle maximum capacity (%s kg) for vehicle %s.") % (
                    rec.cargo_weight, rec.vehicle_id.max_capacity, rec.vehicle_id.name
                ))

    @api.constrains('driver_id')
    def _check_driver_license(self):
        for rec in self:
            if rec.driver_id:
                if rec.driver_id.status == 'suspended':
                    raise ValidationError(_("Driver %s is suspended and cannot be assigned to any trip.") % rec.driver_id.name)
                if rec.driver_id.license_expiry and rec.driver_id.license_expiry < date.today():
                    raise ValidationError(_("Driver %s has an expired license (Expired: %s) and cannot be assigned to any trip.") % (
                        rec.driver_id.name, rec.driver_id.license_expiry
                    ))

    def action_dispatch(self):
        for rec in self:
            if rec.status != 'draft':
                raise ValidationError(_("Only draft trips can be dispatched."))
            
            # Check Vehicle availability
            if rec.vehicle_id.status in ('retired', 'in_shop', 'on_trip'):
                raise ValidationError(_("Vehicle %s is currently %s and cannot be dispatched.") % (rec.vehicle_id.name, rec.vehicle_id.status))
            
            # Check Driver availability
            if rec.driver_id.status in ('suspended', 'off_duty', 'on_trip'):
                raise ValidationError(_("Driver %s is currently %s and cannot be dispatched.") % (rec.driver_id.name, rec.driver_id.status))
            
            # Double check license
            if rec.driver_id.license_expiry and rec.driver_id.license_expiry < date.today():
                raise ValidationError(_("Driver %s license has expired.") % rec.driver_id.name)

            rec.vehicle_id.status = 'on_trip'
            rec.driver_id.status = 'on_trip'
            rec.status = 'dispatched'
            if not rec.dispatch_date:
                rec.dispatch_date = fields.Datetime.now()
            
            # Log Activity
            self.env['transit.activity.log'].create({
                'action': _('Trip %s dispatched from %s to %s') % (rec.name, rec.source, rec.destination),
                'user_id': self.env.user.id,
                'reference': 'transit.trip,%s' % rec.id
            })

    def action_complete(self):
        for rec in self:
            if rec.status != 'dispatched':
                raise ValidationError(_("Only dispatched trips can be completed."))
            
            rec.vehicle_id.status = 'available'
            rec.driver_id.status = 'available'
            
            # Update Odometer on vehicle if trip has actual distance
            if rec.actual_distance > 0:
                rec.vehicle_id.odometer = (rec.vehicle_id.odometer or 0.0) + rec.actual_distance

            # Post expense for fuel consumed during trip if applicable
            if rec.fuel_consumed > 0:
                # Find fuel logs or register fuel cost
                pass

            rec.status = 'completed'
            rec.completion_date = fields.Datetime.now()
            
            # Log Activity
            self.env['transit.activity.log'].create({
                'action': _('Trip %s completed. Actual Distance: %s km') % (rec.name, rec.actual_distance),
                'user_id': self.env.user.id,
                'reference': 'transit.trip,%s' % rec.id
            })

    def action_cancel(self):
        for rec in self:
            if rec.status not in ('draft', 'dispatched'):
                raise ValidationError(_("Only draft or dispatched trips can be cancelled."))
            
            # If it was dispatched, restore vehicle and driver status
            if rec.status == 'dispatched':
                rec.vehicle_id.status = 'available'
                rec.driver_id.status = 'available'
            
            rec.status = 'cancelled'
            
            # Log Activity
            self.env['transit.activity.log'].create({
                'action': _('Trip %s cancelled') % rec.name,
                'user_id': self.env.user.id,
                'reference': 'transit.trip,%s' % rec.id
            })

    def action_draft(self):
        for rec in self:
            if rec.status != 'cancelled':
                raise ValidationError(_("Only cancelled trips can be reset to draft."))
            rec.status = 'draft'
