import eventlet
eventlet.monkey_patch()

import json
import time
import logging
from flask import Flask
from flask_socketio import SocketIO
from kafka import KafkaConsumer
from threading import Thread

# ----------------------------
# CONFIGURACIÓN
# ----------------------------
KAFKA_SERVER = "192.168.1.100:29092"
TOPIC = "bus-updates"
PORT = 5000

# ----------------------------
# LOGGING
# ----------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("bus-ws")

# ----------------------------
# APP + SOCKETIO
# ----------------------------
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")  # CORS habilitado

@app.route("/")
def index():
    return "🔵 Microservicio WebSocket para buses activo. Conéctate por ws://<IP>:5000"

@socketio.on("connect")
def on_connect():
    logger.info("✅ Cliente conectado")
    socketio.emit("connected", {"status": "ok", "message": "WebSocket activo"})

@socketio.on("disconnect")
def on_disconnect():
    logger.info("🔌 Cliente desconectado")

# ----------------------------
# CONSUMIDOR DE KAFKA EN HILO CON CACHE TEMPORAL
# ----------------------------
from collections import deque

ultimo_envio = time.time()
buffer_datos = deque(maxlen=20)

def kafka_listener():
    global ultimo_envio
    while True:
        try:
            logger.info(f"🎧 Conectando a Kafka en {KAFKA_SERVER}...")
            consumer = KafkaConsumer(
                TOPIC,
                bootstrap_servers=[KAFKA_SERVER],
                auto_offset_reset='latest',
                value_deserializer=lambda m: json.loads(m.decode('utf-8')),
                group_id="bus-ws-consumer",
                consumer_timeout_ms=1000
            )
            logger.info("✅ Conectado a Kafka")

            for message in consumer:
                data = message.value
                buffer_datos.append(data)
                ahora = time.time()
                if ahora - ultimo_envio >= 5:  # solo cada 5 segundos
                    datos_emitir = list(buffer_datos)
                    buffer_datos.clear()
                    socketio.emit("bus-update", datos_emitir)
                    logger.info(f"📤 Emitidos {len(datos_emitir)} datos a WebSocket")
                    ultimo_envio = ahora

        except Exception as e:
            logger.error(f"❌ Error Kafka: {e}")
            logger.info("🔁 Reintentando en 5s...")
            time.sleep(5)

# ----------------------------
# MAIN
# ----------------------------
if __name__ == "__main__":
    Thread(target=kafka_listener, daemon=True).start()
    logger.info(f"🚀 Microservicio activo en http://0.0.0.0:{PORT}")
    socketio.run(app, host="0.0.0.0", port=PORT)