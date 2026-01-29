from django.urls import path
from .views import EnigmeDetailAPIView,EnigmeListAPIView,CreateGameAPIView

urlpatterns = [
    path("<int:pk>/", EnigmeDetailAPIView.as_view(), name="enigme-detail"),
    path("",EnigmeListAPIView.as_view(),name="enigme-list"),
    path("games/create/",CreateGameAPIView.as_view(),name="create-game"),
]