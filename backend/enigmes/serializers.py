from rest_framework import serializers
from .models import Enigme,Suspect,Location,Weapon,Motive

class SuspectSerializer(serializers.ModelSerializer):
    icon = serializers.ImageField(read_only=True)
    class Meta:
        model = Suspect
        fields = ["slug", "name", "description", "height", "handedness", "eye_color", "hair_color", "sign", "icon"]
    
    

class LocationSerializer(serializers.ModelSerializer):
    icon = serializers.ImageField(read_only=True)
    class Meta:
        model = Location
        fields = ["slug", "name", "description", "indoor", "icon"]
    
    

class WeaponSerializer(serializers.ModelSerializer):
    icon = serializers.ImageField(read_only=True)
    class Meta:
        model = Weapon
        fields = ["slug", "name", "description", "weight", "material", "icon"]
    
    

class MotiveSerializer(serializers.ModelSerializer):
    icon = serializers.ImageField(read_only=True)
    class Meta:
        model = Motive
        fields = ["slug", "name", "description", "icon"]
    

        
class EnigmeSerializer(serializers.ModelSerializer):
    
    suspects = serializers.SerializerMethodField()
    locations = serializers.SerializerMethodField()
    weapons = serializers.SerializerMethodField()
    motives = serializers.SerializerMethodField()

    class Meta:
        model = Enigme
        fields = ["id", "title", "story", "clues_and_evidence", "statements", "solution",
                  "suspects", "locations", "weapons", "motives"]

    
    def get_suspects(self, obj):
        order = obj.suspects
        qs = Suspect.objects.filter(slug__in=order)
        qs = sorted(qs, key=lambda s: order.index(s.slug))
        return SuspectSerializer(qs, many=True, context=self.context).data


    def get_locations(self, obj):
        order = obj.locations
        qs = Location.objects.filter(slug__in=order)
        qs = sorted(qs, key=lambda l: order.index(l.slug))
        return LocationSerializer(qs, many=True, context=self.context).data

    def get_weapons(self, obj):
        order = obj.weapons
        qs = Weapon.objects.filter(slug__in=order)
        qs = sorted(qs, key=lambda w: order.index(w.slug))
        return WeaponSerializer(qs, many=True, context=self.context).data

    def get_motives(self, obj):
        order = obj.motives
        qs = Motive.objects.filter(slug__in=order)
        qs = sorted(qs, key=lambda m: order.index(m.slug))
        return MotiveSerializer(qs, many=True, context=self.context).data

    
class EnigmeListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enigme
        fields = ["id","title"]