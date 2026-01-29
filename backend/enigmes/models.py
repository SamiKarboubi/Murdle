from django.db import models

# Create your models here.

class Enigme(models.Model):
    title = models.CharField(max_length=200)
    story = models.TextField()
    
    suspects = models.JSONField()
    locations = models.JSONField()
    weapons = models.JSONField()
    motives = models.JSONField()
    
    clues_and_evidence = models.JSONField()
    statements = models.JSONField()
    
    solution = models.JSONField()
    
    def __str__(self):
        return self.title
    
    
class Suspect(models.Model):
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=200)
    description = models.TextField()
    
    height = models.CharField(max_length=50)
    handedness = models.CharField(max_length=50)
    eye_color = models.CharField(max_length=50)
    hair_color = models.CharField(max_length=50)
    
    sign = models.CharField(max_length=50)
    icon = models.ImageField(upload_to="suspects/")
    
    def __str__(self):
        return self.name
    
class Location(models.Model):
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=200)
    description = models.TextField()
    
    indoor = models.CharField(max_length=7)
    icon = models.ImageField(upload_to="locations/")
    
    def __str__(self):
        return self.name   
    
class Weapon(models.Model):
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=200)
    description = models.TextField()
    
    weight = models.CharField(max_length=50)
    material = models.CharField(max_length=50)
    
    icon = models.ImageField(upload_to="weapons/")
    
    def __str__(self):
        return self.name 
    
    
class Motive(models.Model):
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    icon = models.ImageField(upload_to="motives/")
   
    def __str__(self):
        return self.name 
