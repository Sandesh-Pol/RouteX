from django.core.management.base import BaseCommand
from admin_dashboard.models import Driver
from authapp.models import User


class Command(BaseCommand):
    help = 'Link drivers in admin_drivers table to user accounts based on email match'

    def handle(self, *args, **options):
        self.stdout.write("=" * 60)
        self.stdout.write("LINKING DRIVERS TO USER ACCOUNTS")
        self.stdout.write("=" * 60)
        
        drivers = Driver.objects.all()
        self.stdout.write(f"\nFound {drivers.count()} drivers in admin_drivers table\n")
        
        linked_count = 0
        already_linked = 0
        not_found = 0
        
        for driver in drivers:
            self.stdout.write(f"\n📦 Driver: {driver.name}")
            self.stdout.write(f"   Email: {driver.email}")
            
            if driver.user:
                self.stdout.write(self.style.SUCCESS(f"   ✅ Already linked to user: {driver.user.email}"))
                already_linked += 1
                continue
            
            # Try to find matching user by email
            try:
                user = User.objects.get(email=driver.email, role='driver')
                driver.user = user
                driver.save(update_fields=['user'])
                self.stdout.write(self.style.SUCCESS(f"   ✅ LINKED to user: {user.email} (ID: {user.id})"))
                linked_count += 1
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"   ❌ No user account found with email {driver.email} and role='driver'"))
                not_found += 1
            except User.MultipleObjectsReturned:
                self.stdout.write(self.style.ERROR(f"   ❌ Multiple users found with email {driver.email}"))
                not_found += 1
        
        self.stdout.write("\n" + "=" * 60)
        self.stdout.write("SUMMARY")
        self.stdout.write("=" * 60)
        self.stdout.write(f"\n✅ Newly linked: {linked_count}")
        self.stdout.write(f"✅ Already linked: {already_linked}")
        self.stdout.write(f"❌ Not found: {not_found}")
        
        if not_found > 0:
            self.stdout.write(self.style.WARNING("\n⚠️  Some drivers need user accounts. Run these commands:\n"))
            for driver in Driver.objects.filter(user__isnull=True):
                self.stdout.write(f"python manage.py shell -c \"from authapp.models import User; User.objects.create_user(email='{driver.email}', full_name='{driver.name}', phone_number='{driver.phone_number}', password='password123', role='driver')\"")
