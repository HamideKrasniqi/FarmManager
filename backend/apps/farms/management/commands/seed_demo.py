"""
Management command: seed demo data for thesis presentations.

Usage
-----
python manage.py seed_demo

Creates:
  - SuperAdmin: superadmin / SuperAdmin123!
  - Green Valley Farm + Owner / Manager / Worker
  - Sample animals, crops, transactions, tasks
"""

from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.crops.models import Crop
from apps.farms.models import Farm
from apps.finances.models import Transaction
from apps.hr.models import Salary, VacationRequest
from apps.livestock.models import Animal
from apps.tasks.models import Task

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed demo SuperAdmin, farm, users, and sample domain data.'

    @transaction.atomic
    def handle(self, *args, **options):
        superadmin, created = User.objects.get_or_create(
            username='superadmin',
            defaults={
                'email': 'superadmin@platform.local',
                'role': User.Role.SUPERADMIN,
                'is_staff': True,
                'is_superuser': True,
            },
        )
        if created:
            superadmin.set_password('SuperAdmin123!')
            superadmin.save()
            self.stdout.write(self.style.SUCCESS('Created SuperAdmin'))
        else:
            self.stdout.write('SuperAdmin already exists')

        farm, farm_created = Farm.objects.get_or_create(
            name='Green Valley Farm',
            defaults={'status': Farm.Status.ACTIVE},
        )
        if farm_created:
            self.stdout.write(self.style.SUCCESS(f'Created farm: {farm.name}'))

        def ensure_user(username, email, role, password, **extra):
            user, was_created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': email,
                    'role': role,
                    'farm': farm,
                    'first_name': extra.get('first_name', ''),
                    'last_name': extra.get('last_name', ''),
                },
            )
            if was_created:
                user.set_password(password)
                user.save()
                self.stdout.write(self.style.SUCCESS(f'Created {role}: {username}'))
            return user

        owner = ensure_user(
            'owner',
            'owner@greenvalley.local',
            User.Role.OWNER,
            'Owner123!',
            first_name='Alice',
            last_name='Owner',
        )
        manager = ensure_user(
            'manager',
            'manager@greenvalley.local',
            User.Role.MANAGER,
            'Manager123!',
            first_name='Bob',
            last_name='Manager',
        )
        worker = ensure_user(
            'worker',
            'worker@greenvalley.local',
            User.Role.WORKER,
            'Worker123!',
            first_name='Carol',
            last_name='Worker',
        )

        if not Animal.objects.filter(farm=farm).exists():
            Animal.objects.bulk_create(
                [
                    Animal(
                        farm=farm,
                        tag_number='COW-001',
                        species='Cattle',
                        breed='Holstein',
                        birth_date=date(2022, 3, 15),
                        health_status=Animal.HealthStatus.HEALTHY,
                    ),
                    Animal(
                        farm=farm,
                        tag_number='SHP-014',
                        species='Sheep',
                        breed='Merino',
                        birth_date=date(2023, 6, 1),
                        health_status=Animal.HealthStatus.HEALTHY,
                    ),
                    Animal(
                        farm=farm,
                        tag_number='GOAT-003',
                        species='Goat',
                        breed='Alpine',
                        birth_date=date(2024, 1, 20),
                        health_status=Animal.HealthStatus.SICK,
                        notes='Under observation for mild fever.',
                    ),
                ]
            )
            self.stdout.write(self.style.SUCCESS('Seeded animals'))

        if not Crop.objects.filter(farm=farm).exists():
            Crop.objects.bulk_create(
                [
                    Crop(
                        farm=farm,
                        field_name='North Field',
                        crop_type='Wheat',
                        area_hectares=Decimal('12.50'),
                        planting_date=date(2026, 3, 1),
                        expected_harvest=date(2026, 8, 15),
                        status='GROWING',
                    ),
                    Crop(
                        farm=farm,
                        field_name='South Orchard',
                        crop_type='Apple',
                        area_hectares=Decimal('4.00'),
                        planting_date=date(2021, 4, 10),
                        status='GROWING',
                    ),
                ]
            )
            self.stdout.write(self.style.SUCCESS('Seeded crops'))

        if not Transaction.objects.filter(farm=farm).exists():
            Transaction.objects.bulk_create(
                [
                    Transaction(
                        farm=farm,
                        type=Transaction.Type.INCOME,
                        amount=Decimal('3500.00'),
                        description='Milk sales — March',
                        category='Livestock',
                        date=date(2026, 3, 28),
                        created_by=owner,
                    ),
                    Transaction(
                        farm=farm,
                        type=Transaction.Type.EXPENSE,
                        amount=Decimal('820.00'),
                        description='Feed purchase',
                        category='Supplies',
                        date=date(2026, 3, 10),
                        created_by=owner,
                    ),
                    Transaction(
                        farm=farm,
                        type=Transaction.Type.EXPENSE,
                        amount=Decimal('150.00'),
                        description='Veterinary visit',
                        category='Health',
                        date=date(2026, 3, 18),
                        created_by=owner,
                    ),
                ]
            )
            self.stdout.write(self.style.SUCCESS('Seeded transactions'))

        if not Task.objects.filter(farm=farm).exists():
            today = date.today()
            Task.objects.bulk_create(
                [
                    Task(
                        farm=farm,
                        title='Feed cattle — morning round',
                        description='Distribute feed in Barn A.',
                        assigned_to=worker,
                        created_by=manager,
                        status=Task.Status.PENDING,
                        due_date=today,
                    ),
                    Task(
                        farm=farm,
                        title='Inspect North Field irrigation',
                        description='Check pumps and drip lines.',
                        assigned_to=worker,
                        created_by=owner,
                        status=Task.Status.IN_PROGRESS,
                        due_date=today + timedelta(days=1),
                        worker_notes='Started checking pump #2.',
                    ),
                    Task(
                        farm=farm,
                        title='Vaccinate sheep flock',
                        description='Administer scheduled vaccines.',
                        assigned_to=worker,
                        created_by=manager,
                        status=Task.Status.COMPLETED,
                        due_date=today - timedelta(days=1),
                        worker_notes='All 14 sheep vaccinated.',
                    ),
                ]
            )
            self.stdout.write(self.style.SUCCESS('Seeded tasks'))

        if not Salary.objects.filter(farm=farm).exists():
            Salary.objects.bulk_create(
                [
                    Salary(
                        farm=farm,
                        employee=worker,
                        amount=Decimal('900.00'),
                        currency='EUR',
                        effective_from=date(2026, 1, 1),
                        notes='Base monthly wage',
                        created_by=owner,
                    ),
                    Salary(
                        farm=farm,
                        employee=manager,
                        amount=Decimal('1400.00'),
                        currency='EUR',
                        effective_from=date(2026, 1, 1),
                        notes='Manager monthly wage',
                        created_by=owner,
                    ),
                ]
            )
            self.stdout.write(self.style.SUCCESS('Seeded salaries'))

        if not VacationRequest.objects.filter(farm=farm).exists():
            from django.utils import timezone as dj_tz

            today = date.today()
            VacationRequest.objects.create(
                farm=farm,
                employee=worker,
                leave_type=VacationRequest.LeaveType.ANNUAL,
                start_date=today + timedelta(days=14),
                end_date=today + timedelta(days=18),
                reason='Family visit',
                status=VacationRequest.Status.PENDING,
            )
            VacationRequest.objects.create(
                farm=farm,
                employee=worker,
                leave_type=VacationRequest.LeaveType.PERSONAL,
                start_date=today - timedelta(days=30),
                end_date=today - timedelta(days=28),
                reason='Personal leave',
                status=VacationRequest.Status.APPROVED,
                reviewed_by=owner,
                review_feedback='Approved.',
                reviewed_at=dj_tz.now(),
            )
            self.stdout.write(self.style.SUCCESS('Seeded vacation requests'))

        self.stdout.write(self.style.SUCCESS('\nDemo credentials:'))
        self.stdout.write('  superadmin / SuperAdmin123!')
        self.stdout.write('  owner      / Owner123!')
        self.stdout.write('  manager    / Manager123!')
        self.stdout.write('  worker     / Worker123!')
