import asyncio
import websockets
import logging

logging.basicConfig(level=logging.INFO)

async def listen_to_server():
    uri = "ws://localhost:8080/ws"  # ADAPTADO al servidor Go

    while True:
        try:
            async with websockets.connect(uri) as websocket:
                logging.info("🔗 Conectado al servidor Go.")
                async for message in websocket:
                    logging.info(f"📥 Recibido: {message}")
        except (ConnectionRefusedError, websockets.exceptions.ConnectionClosedError) as e:
            logging.warning(f"⚠️ Error de conexión: {e}. Reintentando en 5 segundos...")
            await asyncio.sleep(5)
        except Exception as e:
            logging.error(f"❌ Error inesperado: {e}")
            await asyncio.sleep(5)

if __name__ == "__main__":
    asyncio.run(listen_to_server())
