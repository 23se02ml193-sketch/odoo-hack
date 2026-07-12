# -*- coding: utf-8 -*-
from odoo import models, fields, api

class Expense(models.Model):
    _name = 'transit.expense'
    _description = 'Vehicle Expense'
    _order = 'expense_date desc, id desc'

    vehicle_id = fields.Many2one('transit.vehicle', string='Vehicle', required=True, ondelete='cascade')
    expense_type = fields.Selection([
        ('fuel', 'Fuel'),
        ('maintenance', 'Maintenance'),
        ('insurance', 'Insurance'),
        ('parking', 'Parking'),
        ('repair', 'Repair'),
        ('other', 'Other')
    ], string='Expense Type', default='other', required=True)
    amount = fields.Float(string='Amount ($)', required=True)
    description = fields.Text(string='Description')
    expense_date = fields.Date(string='Expense Date', default=fields.Date.context_today, required=True)
