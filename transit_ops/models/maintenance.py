# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError

class Maintenance(models.Model):
    _name = 'transit.maintenance'
    _description = 'Maintenance Task'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char(string='Maintenance Number', required=True, copy=False, readonly=True, default=lambda self: _('New'))
    vehicle_id = fields.Many2one('transit.vehicle', string='Vehicle', required=True, tracking=True)
    issue = fields.Char(string='Issue', required=True, tracking=True)
    priority = fields.Selection([
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical')
    ], string='Priority', default='medium', required=True, tracking=True)
    description = fields.Text(string='Description')
    technician = fields.Char(string='Technician')
    estimated_cost = fields.Float(string='Estimated Cost ($)')
    actual_cost = fields.Float(string='Actual Cost ($)', tracking=True)
    start_date = fields.Date(string='Start Date')
    end_date = fields.Date(string='End Date')
    status = fields.Selection([
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed')
    ], string='Status', default='pending', tracking=True, required=True)

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('name', _('New')) == _('New'):
                vals['name'] = self.env['ir.sequence'].next_by_code('transit.maintenance') or _('New')
        return super(Maintenance, self).create(vals_list)

    def action_approve(self):
        for rec in self:
            if rec.status != 'pending':
                raise ValidationError(_("Only pending maintenance can be approved."))
            if rec.vehicle_id.status == 'on_trip':
                raise ValidationError(_("Vehicle is currently on a trip and cannot be placed in shop maintenance."))
            rec.status = 'approved'
            rec.vehicle_id.status = 'in_shop'

    def action_reject(self):
        for rec in self:
            if rec.status != 'pending':
                raise ValidationError(_("Only pending maintenance can be rejected."))
            rec.status = 'rejected'

    def action_start(self):
        for rec in self:
            if rec.status not in ('approved', 'pending'):
                raise ValidationError(_("Maintenance can only start if approved or pending."))
            if rec.vehicle_id.status == 'on_trip':
                raise ValidationError(_("Vehicle is currently on a trip and cannot be placed in shop maintenance."))
            rec.status = 'in_progress'
            rec.vehicle_id.status = 'in_shop'
            if not rec.start_date:
                rec.start_date = fields.Date.today()

    def action_complete(self):
        for rec in self:
            if rec.status != 'in_progress':
                raise ValidationError(_("Only in progress maintenance can be completed."))
            rec.status = 'completed'
            rec.vehicle_id.status = 'available'
            if not rec.end_date:
                rec.end_date = fields.Date.today()
            
            # Generate vehicle expense for maintenance automatically
            self.env['transit.expense'].create({
                'vehicle_id': rec.vehicle_id.id,
                'expense_type': 'maintenance',
                'amount': rec.actual_cost or rec.estimated_cost or 0.0,
                'description': _('Auto-generated from Maintenance Task: %s - %s') % (rec.name, rec.issue),
                'expense_date': fields.Date.today()
            })
            
            # Log Activity
            self.env['transit.activity.log'].create({
                'action': _('Maintenance %s completed for %s. Cost: $%s') % (rec.name, rec.vehicle_id.name, rec.actual_cost),
                'user_id': self.env.user.id,
                'reference': 'transit.maintenance,%s' % rec.id
            })
