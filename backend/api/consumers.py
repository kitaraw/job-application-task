# # api/consumers.py

import asyncio
import subprocess
import json
import time
from channels.generic.websocket import AsyncWebsocketConsumer


class CommandConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        self.process = None
        self.running = False

    async def disconnect(self, code):
        if self.process and self.process.returncode is None:
            self.process.terminate()
            await self.process.wait()

    async def receive(self, text_data=None, bytes_data=None):
        if not text_data:
            return

        data = json.loads(text_data)
        action = data.get("action")

        if action == "start_command":
            command_name = data.get("command")
            await self.start_command(command_name)

        elif action == "cancel_command":
            await self.cancel_command()

    async def start_command(self, command_name):
        if self.running:
            await self.send(
                text_data=json.dumps(
                    {
                        "type": "stdout",
                        "message": "Another command is already running. Cancel it first.\n",
                    }
                )
            )
            return

        # Формируем команду
        cmd_list = ["python", "manage.py"] + command_name.split()

        # Запускаем процесс
        self.process = await asyncio.create_subprocess_exec(
            *cmd_list,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.STDOUT,
        )
        self.running = True

        # Читаем поток stdout
        asyncio.create_task(self.stream_output(self.process))

    async def cancel_command(self):

        if self.process and self.running and self.process.returncode is None:

            self.process.terminate()
            await self.process.wait()
            self.running = False
            await self.send(
                text_data=json.dumps(
                    {
                        "type": "stdout",
                        "message": "\n=== Command cancelled by user ===\n",
                    }
                )
            )

    async def stream_output(self, process):
        try:
            while True:
                line = await process.stdout.readline()
                if not line:
                    break
                await self.send(
                    text_data=json.dumps(
                        {
                            "type": "stdout",
                            "message": line.decode(),
                        }
                    )
                )
                await asyncio.sleep(0.1)
        finally:
            return_code = await process.wait()
            self.running = False
            await self.send(
                text_data=json.dumps(
                    {
                        "type": "finished",
                        "return_code": return_code,
                    }
                )
            )


