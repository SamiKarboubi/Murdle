import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .game_state import games
import time

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.code = self.scope["url_route"]["kwargs"]["code"]
        print("CONNECT CODE:", self.code)
        print("GAMES:", games)
        if self.code not in games:
            await self.close()
            return
        
        self.room = f"game_{self.code}"
        print("CONNECT CODE:", self.code)
        print("AVAILABLE GAMES:", games.keys())
        await self.channel_layer.group_add(self.room, self.channel_name)
        await self.accept()
        
        if games[self.code]["players"] == 0:
            games[self.code]["startTime"] = time.time()

        games[self.code]["players"] += 1
        await self.send(json.dumps({
            "type":"init",
            "state":games[self.code]["state"],
            "chat":games[self.code]["chat"],
            "startTime":games[self.code]["startTime"]
            }))
        
    async def disconnect(self,close_code):
        if self.code not in games:
            return

        games[self.code]["players"] -= 1

        if games[self.code]["players"] <= 0:
            del games[self.code]


    async def receive(self, text_data):
        data = json.loads(text_data)
        
        if data["type"] == "state":
            games[self.code]["state"] = data["state"]

            await self.channel_layer.group_send(
            self.room,
            {
                "type":"broadcast_state",
                "state":data["state"]
            }
        )

        elif data["type"] == "chat":
            message = data["chat"]
            games[self.code]["chat"].append(message)

            if len(games[self.code]["chat"]) > 20:
                games[self.code]["chat"].pop(0)

            await self.channel_layer.group_send(
            self.room,
            {
                "type":"broadcast_chat",
                "message":message
            }
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