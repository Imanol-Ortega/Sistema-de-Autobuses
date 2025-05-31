import asyncio
import websockets
import logging

logging.basicConfig(level=logging.INFO)

connected_clients = set()

async def handler(websocket):  # solo websocket
    logging.info(f"✅ Cliente conectado: {websocket.remote_address}")
    connected_clients.add(websocket)
    try:
        while True:
            await asyncio.sleep(1)
    except websockets.exceptions.ConnectionClosed:
        logging.info("❌ Cliente desconectado.")
    finally:
        connected_clients.discard(websocket)

async def send_periodic_messages():
    while True:
        if connected_clients:
            message = f"🕒 Mensaje - Hora: {asyncio.get_event_loop().time()}"
            logging.info(f"📤 Enviando a {len(connected_clients)} cliente(s): {message}")
            to_remove = set()
            for client in connected_clients:
                try:
                    await client.send(message)
                except Exception as e:
                    logging.error(f"❌ Error al enviar: {e}")
                    to_remove.add(client)
            connected_clients.difference_update(to_remove)
        await asyncio.sleep(5)

async def main():
    server = await websockets.serve(handler, "0.0.0.0", 8765)
    logging.info("🚀 Servidor WebSocket corriendo en ws://localhost:8765")
    await asyncio.create_task(send_periodic_messages())
    await server.wait_closed()

if __name__ == "__main__":
    asyncio.run(main())
