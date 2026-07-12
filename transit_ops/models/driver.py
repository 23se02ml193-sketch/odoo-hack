# -*- coding: utf-8 -*-
from odoo import models, fields, api
from odoo.exceptions import ValidationError

class Driver(models.Model):
    _name = 'transit.driver'
    _description = 'Driver Profile'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char(string='Employee Name', required=True, tracking=True)
    email = fields.Char(string='Email')
    phone = fields.Char(string='Phone')
    license_no = fields.Char(string='License Number', required=True, tracking=True)
    license_category = fields.Char(string='License Category')
    license_expiry = fields.Date(string='License Expiry', tracking=True)
    safety_score = fields.Float(string='Safety Score', default=100.0, tracking=True)
    status = fields.Selection([
        ('available', 'Available'),
        ('on_trip', 'On Trip'),
        ('off_duty', 'Off Duty'),
        ('suspended', 'Suspended')
    ], string='Status', default='available', tracking=True, required=True)
    photo = fields.Binary(string='Profile Photo')
    address = fields.Text(string='Address')
    emergency_contact = fields.Char(string='Emergency Contact')

    # Relationships
    trip_ids = fields.One2many('transit.trip', 'driver_id', string='Trips')

    trip_count = fields.Integer(string='Trips Count', compute='_compute_trip_count')

    @api.depends('trip_ids')
    def _compute_trip_count(self):
        for rec in self:
            rec.trip_count = len(rec.trip_ids)

    def action_view_trips(self):
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': 'Trips',
            'view_mode': 'tree,form',
            'res_model': 'transit.trip',
            'domain': [('driver_id', '=', self.id)],
            'context': {'default_driver_id': self.id},
        }
