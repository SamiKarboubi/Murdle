from django.shortcuts import render
from rest_framework.views import APIView
from .models import Enigme
from rest_framework.response import Response
from rest_framework import status
from .serializers import EnigmeSerializer,EnigmeListSerializer
import random, string
from redis_client import redis_client
import json
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
        if not enigme_id:
            return Response({"error": "enigme_id required"}, status=400)
        code = generate_code()
        
        game_data = {
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
            "startTime" : None
        }

        pipe = redis_client.pipeline()

        pipe.set(
            f"game:{code}",
            json.dumps(game_data),
            ex=14400
        )

        pipe.set(
            f"game:{code}:players",
            0,
            ex=14400
        )

        pipe.execute()


        return Response({"code":code,"enigme_id" : enigme_id}, status=201)
    
    
        