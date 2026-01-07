#!/usr/bin/env python
"""
Script to link drivers in admin_drivers table to user accounts in authapp_user table.
This ensures drivers can see their assignments in the driver app.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from admin_dashboard.models import Driver
from authapp.models import User

def link_drivers_to_users():
    """Link drivers to user accounts based on email match."""
    print("=" * 60)
    print("LINKING DRIVERS TO USER ACCOUNTS")
    print("=" * 60)
    
    drivers = Driver.objects.all()
    print(f"\nFound {drivers.count()} drivers in admin_drivers table")
    
    for driver in drivers:
        print(f"\n📦 Driver: {driver.name}")
        print(f"   Email: {driver.email}")
        print(f"   Current user link: {driver.user}")
        
        if driver.user:
            print(f"   ✅ Already linked to user: {driver.user.email}")
            continue
        
        # Try to find matching user by email
        try:
            user = User.objects.get(email=driver.email, role='driver')
            driver.user = user
            driver.save(update_fields=['user'])
            print(f"   ✅ LINKED to user: {user.email} (ID: {user.id})")
        except User.DoesNotExist:
            print(f"   ❌ ERROR: No user account found with email {driver.email} and role='driver'")
            print(f"      Create a user account for this driver or update the driver's email")
        except User.MultipleObjectsReturned:
            print(f"   ❌ ERROR: Multiple users found with email {driver.email}")
    
    print("\n" + "=" * 60)
    print("VERIFICATION")
    print("=" * 60)
    
    linked = Driver.objects.exclude(user__isnull=True).count()
    unlinked = Driver.objects.filter(user__isnull=True).count()
    
    print(f"\n✅ Linked drivers: {linked}")
    print(f"❌ Unlinked drivers: {unlinked}")
    
    if unlinked > 0:
        print("\n⚠️  Some drivers are not linked. Create user accounts for them:")
        for driver in Driver.objects.filter(user__isnull=True):
            print(f"   - {driver.name} ({driver.email})")
            print(f"     python manage.py shell -c \"from authapp.models import User; User.objects.create_user(email='{driver.email}', full_name='{driver.name}', phone_number='{driver.phone_number}', password='password123', role='driver')\"")

if __name__ == '__main__':
    link_drivers_to_users()
