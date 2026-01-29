from django.shortcuts import render
from rest_framework.views import APIView
from .models import Enigme
from rest_framework.response import Response
from rest_framework import status
from .serializers import EnigmeSerializer,EnigmeListSerializer
import random, string
from .game_state import games
# Create your views here.


class EnigmeDetailAPIView(APIView):
    def get(self,request,pk):
        try:
            enigme = Enigme.objects.get(pk=pk)
        except Enigme.DoesNotExist:
            return Response({"error": "Enigme not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = EnigmeSerializer(enigme,context={"request":request})
        return Response(serializer.data)
    
class EnigmeListAPIView(APIView):
    def get(self,request):
        
        enigme = Enigme.objects.all()
        
        serializer = EnigmeListSerializer(enigme,many=True)
        return Response(serializer.data)
    
def generate_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))

class CreateGameAPIView(APIView):
    def post(self,request):
        enigme_id = request.data["enigme_id"]
        code = generate_code()
        
        games[code] = {
            "enigme_id" : enigme_id,
            "state" : {
                "grid": None,
                "savedGrid": None,
                "accusation": {},
                "crossed": {},
                "checkedTruth": {},
                "result": None,
                "solutionTime": None
            },
            "chat":[],
            "players":0,
            "startTime" : None
        }
        return Response({"code":code,"enigme_id" : enigme_id}, status=201)
    
    
        