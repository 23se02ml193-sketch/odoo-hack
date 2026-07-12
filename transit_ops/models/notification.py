# -*- coding: utf-8 -*-
from odoo import models, fields, api

class Notification(models.Model):
    _name = 'transit.notification'
    _description = 'Transit Notification'
    _order = 'create_date desc'

    title = fields.Char(string='Title', required=True)
    description = fields.Text(string='Description')
    user_id = fields.Many2one('res.users', string='Recipient User', required=True, default=lambda self: self.env.user)
    priority = fields.Selection([
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical')
    ], string='Priority', default='medium')
    read = fields.Boolean(string='Read', default=False)
    created_date = fields.Datetime(string='Created Date', default=fields.Datetime.now)

    def action_mark_as_read(self):
        for rec in self:
            rec.read = True
