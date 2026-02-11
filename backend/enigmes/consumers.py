import json
from channels.generic.websocket import AsyncWebsocketConsumer
import time
from redis_client import redis_client

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.code = self.scope["url_route"]["kwargs"]["code"]
        
        game_json = redis_client.get(f"game:{self.code}")

        if not game_json:
            await self.close()
            return
        game_data = json.loads(game_json)
        self.room = f"game_{self.code}"
        
        await self.channel_layer.group_add(self.room, self.channel_name)
        await self.accept()
        players = redis_client.incr(f"game:{self.code}:players")

        if players == 1:
            game_data["startTime"] = time.time()
            redis_client.set(
                f"game:{self.code}",
                json.dumps(game_data)
            )
        else:
            # reload to get correct startTime
            game_json = redis_client.get(f"game:{self.code}")
            game_data = json.loads(game_json)
        
        await self.send(json.dumps({
            "type":"init",
            "state":game_data["state"],
            "chat":game_data["chat"],
            "startTime":game_data["startTime"]
            }))
        
    async def disconnect(self,close_code):

        if redis_client.exists(f"game:{self.code}:players"):
            players = redis_client.decr(f"game:{self.code}:players")
        
            if players <= 0:
                redis_client.delete(f"game:{self.code}")
                redis_client.delete(f"game:{self.code}:players")
        


    async def receive(self, text_data):
        data = json.loads(text_data)

        game_json = redis_client.get(f"game:{self.code}")

        if not game_json:
            return
        game_data = json.loads(game_json)
        if data["type"] == "state":
            
            game_data["state"] = data["state"]

            await self.channel_layer.group_send(
            self.room,
            {
                "type":"broadcast_state",
                "state":data["state"]
            }
        )

        elif data["type"] == "chat":
            message = data["chat"]
            game_data["chat"].append(message)

            if len(game_data["chat"]) > 20:
                game_data["chat"].pop(0)

            await self.channel_layer.group_send(
            self.room,
            {
                "type":"broadcast_chat",
                "message":message
            }
        )
        redis_client.set(
            f"game:{self.code}",
            json.dumps(game_data)
        )




    async def broadcast_state(self, event):
        await self.send(json.dumps({
            "type":"state",
            "state":event["state"]
        }))  


    async def broadcast_chat(self, event):
        await self.send(json.dumps({
            "type":"message",
            "message":event["message"]
        }))   