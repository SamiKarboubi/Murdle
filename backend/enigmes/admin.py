from django.contrib import admin

from .models import Enigme, Suspect, Location, Weapon, Motive

admin.site.register(Enigme)
admin.site.register(Suspect)
admin.site.register(Location)
admin.site.register(Weapon)
admin.site.register(Motive)

