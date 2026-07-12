# -*- coding: utf-8 -*-
from odoo.tests import common
from odoo.exceptions import ValidationError
from datetime import date, timedelta

class TestTransitOps(common.TransactionCase):

    def setUp(self):
        super(TestTransitOps, self).setUp()
        
        # Create a test vehicle
        self.vehicle = self.env['transit.vehicle'].create({
            'name': 'Test Truck',
            'registration_no': 'TEST-123-ABC',
            'model': 'Volvo 2024',
            'type': 'truck',
            'max_capacity': 10000.0,
            'odometer': 5000.0,
        })
        
        # Create a test driver
        self.driver = self.env['transit.driver'].create({
            'name': 'Test Driver',
            'email': 'driver@test.com',
            'license_no': 'LIC-999-XYZ',
            'license_category': 'Class A',
            'license_expiry': date.today() + timedelta(days=100),
            'status': 'available',
        })

    def test_01_vehicle_registration_uniqueness(self):
        """Test that vehicle registration numbers must be unique."""
        with self.assertRaises(Exception):  # Unique constraint check
            self.env['transit.vehicle'].create({
                'name': 'Duplicate Truck',
                'registration_no': 'TEST-123-ABC',
                'model': 'Scania 2024',
                'max_capacity': 12000.0,
            })

    def test_02_cargo_weight_limit(self):
        """Test cargo weight limit constraint."""
        # This should fail as cargo weight exceeds capacity (10000.0)
        with self.assertRaises(ValidationError):
            self.env['transit.trip'].create({
                'source': 'Point A',
                'destination': 'Point B',
                'vehicle_id': self.vehicle.id,
                'driver_id': self.driver.id,
                'cargo_weight': 15000.0,
            })

    def test_03_driver_suspended_dispatch(self):
        """Test dispatching with a suspended driver."""
        self.driver.status = 'suspended'
        trip = self.env['transit.trip'].create({
            'source': 'Point A',
            'destination': 'Point B',
            'vehicle_id': self.vehicle.id,
            'driver_id': self.driver.id,
            'cargo_weight': 5000.0,
        })
        with self.assertRaises(ValidationError):
            trip.action_dispatch()

    def test_04_driver_expired_license_dispatch(self):
        """Test dispatching with an expired license."""
        self.driver.license_expiry = date.today() - timedelta(days=1)
        trip = self.env['transit.trip'].create({
            'source': 'Point A',
            'destination': 'Point B',
            'vehicle_id': self.vehicle.id,
            'driver_id': self.driver.id,
            'cargo_weight': 5000.0,
        })
        with self.assertRaises(ValidationError):
            trip.action_dispatch()

    def test_05_trip_workflow_success(self):
        """Test successful trip dispatch and completion lifecycle."""
        trip = self.env['transit.trip'].create({
            'source': 'Point A',
            'destination': 'Point B',
            'vehicle_id': self.vehicle.id,
            'driver_id': self.driver.id,
            'cargo_weight': 5000.0,
            'actual_distance': 150.0,
        })
        
        # Verify initial states
        self.assertEqual(trip.status, 'draft')
        self.assertEqual(self.vehicle.status, 'available')
        self.assertEqual(self.driver.status, 'available')
        
        # Dispatch
        trip.action_dispatch()
        self.assertEqual(trip.status, 'dispatched')
        self.assertEqual(self.vehicle.status, 'on_trip')
        self.assertEqual(self.driver.status, 'on_trip')
        
        # Complete
        trip.action_complete()
        self.assertEqual(trip.status, 'completed')
        self.assertEqual(self.vehicle.status, 'available')
        self.assertEqual(self.driver.status, 'available')
        self.assertEqual(self.vehicle.odometer, 5150.0)  # Odometer updated

    def test_06_maintenance_workflow(self):
        """Test maintenance workflow and vehicle shop transition."""
        maintenance = self.env['transit.maintenance'].create({
            'vehicle_id': self.vehicle.id,
            'issue': 'Brake replacement',
            'priority': 'high',
            'estimated_cost': 300.0,
            'actual_cost': 280.0,
        })
        
        self.assertEqual(maintenance.status, 'pending')
        
        # Approve and check vehicle in shop
        maintenance.action_approve()
        self.assertEqual(maintenance.status, 'approved')
        self.assertEqual(self.vehicle.status, 'in_shop')
        
        # Start work
        maintenance.action_start()
        self.assertEqual(maintenance.status, 'in_progress')
        
        # Complete and verify auto-generated expense
        maintenance.action_complete()
        self.assertEqual(maintenance.status, 'completed')
        self.assertEqual(self.vehicle.status, 'available')
        
        # Verify expense creation
        expense = self.env['transit.expense'].search([('vehicle_id', '=', self.vehicle.id), ('expense_type', '=', 'maintenance')])
        self.assertTrue(expense)
        self.assertEqual(expense.amount, 280.0)

    def test_07_fuel_efficiency_calc(self):
        """Test fuel efficiency calculations."""
        # First log to set base odometer
        self.env['transit.fuel.log'].create({
            'vehicle_id': self.vehicle.id,
            'fuel_type': 'diesel',
            'liters': 50.0,
            'price_per_liter': 1.50,
            'odometer': 5000.0,
            'date': date.today() - timedelta(days=2),
        })
        
        # Second log with higher odometer
        log2 = self.env['transit.fuel.log'].create({
            'vehicle_id': self.vehicle.id,
            'fuel_type': 'diesel',
            'liters': 60.0,
            'price_per_liter': 1.60,
            'odometer': 5500.0,
            'date': date.today(),
        })
        
        # Distance = 500km, Liters = 60L. Efficiency = (60 / 500) * 100 = 12 L/100km
        self.assertEqual(log2.distance_since_last, 500.0)
        self.assertEqual(log2.fuel_efficiency, 12.0)
        self.assertEqual(log2.distance_per_liter, 500.0 / 60.0)
        self.assertEqual(self.vehicle.odometer, 5500.0)
