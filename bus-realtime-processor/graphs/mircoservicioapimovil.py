from flask import Flask, jsonify
from kafka import KafkaConsumer
import threading
import json
import logging

# ----------------------------
# CONFIGURACIÓN
# ----------------------------
KAFKA_SERVER = "192.168.1.100:29092"  # ⚠️ CAMBIÁ por la IP de tu servidor Kafka
TOPIC = "bus-updates"
MAX_MESSAGES = 10
PORT = 5000

# ----------------------------
# APP & VARIABLES
# ----------------------------
app = Flask(__name__)
latest_buses = []  # Lista circular en memoria

# Configurar logs
logging.basicConfig(level=logging.INFO)
log = logging.getLogger("bus-api")

# ----------------------------
# CONSUMIDOR EN SEGUNDO PLANO
# ----------------------------
def kafka_listener():
    try:
        consumer = KafkaConsumer(
            TOPIC,
            bootstrap_servers=[KAFKA_SERVER],
            auto_offset_reset='latest',
            value_deserializer=lambda m: json.loads(m.decode('utf-8')),
            group_id="react-native-api"
        )
        log.info("✅ Conectado a Kafka. Escuchando mensajes en segundo plano...")

        for msg in consumer:
            data = msg.value
            latest_buses.append(data)
            if len(latest_buses) > MAX_MESSAGES:
                latest_buses.pop(0)
            log.debug(f"🚌 Mensaje recibido: {data}")
    except Exception as e:
        log.error("❌ Error al conectarse a Kafka:")
        log.exception(e)

# ----------------------------
# ENDPOINTS
# ----------------------------

@app.route('/')
def index():
    return jsonify({
        "status": "OK",
        "routes": ["/last-bus", "/last-buses"]
    })

@app.route('/last-bus')
def last_bus():
    if not latest_buses:
        return jsonify({"status": "no-data", "msg": "Aún no se recibieron datos"}), 204
    return jsonify(latest_buses[-1])

@app.route('/last-buses')
def last_buses():
    if not latest_buses:
        return jsonify({"status": "no-data", "msg": "Aún no se recibieron datos"}), 204
    return jsonify(latest_buses[-5:])

# ----------------------------
# INICIO
# ----------------------------

if __name__ == '__main__':
    threading.Thread(target=kafka_listener, daemon=True).start()
    log.info(f"🌐 Microservicio iniciado en http://0.0.0.0:{PORT}")
    app.run(host="0.0.0.0", port=PORT)
