#!/usr/bin/env python3
import time
import json
import threading
from kafka import KafkaProducer

# -------------------------
#  CONFIGURACIÓN
# -------------------------
BOOTSTRAP_SERVERS = ["localhost:29092"]  # o ["kafka:9092"] en Docker
TOPIC             = "bus-updates"
SEND_INTERVAL     = 5  # segundos entre mensajes

# Define un par de rutas de ejemplo (puedes ampliarlas)
ROUTES = {
    "R1-1": [(-25.2617, -57.5810), (-25.2650, -57.5750)],
    "R1-2": [(-25.2650, -57.5750), (-25.2617, -57.5810)],
    "R2-1": [(-25.2700, -57.5800), (-25.2740, -57.5700)],
    "R2-2": [(-25.2740, -57.5700), (-25.2700, -57.5800)],
}

def interpolate(path, steps=100):
    """Dada una lista de (lat,lon), devuelve una lista interpolada."""
    pts = []
    for (lat1, lon1), (lat2, lon2) in zip(path, path[1:]):
        for t in [i/steps for i in range(steps)]:
            pts.append((
                lat1 + (lat2 - lat1) * t,
                lon1 + (lon2 - lon1) * t
            ))
    return pts

def simulate_bus(bus_id, route_points):
    """Hilo que envía periódicamente la posición al topic."""
    producer = KafkaProducer(
        bootstrap_servers=BOOTSTRAP_SERVERS,
        value_serializer=lambda v: json.dumps(v).encode()
    )
    pts = interpolate(route_points, steps=200)
    idx, direction = 0, 1
    n = len(pts)
    while True:
        lat, lon = pts[idx]
        msg = {
            "bus_id": bus_id,
            "route_id": bus_id.split("-")[0],
            "timestamp": int(time.time()),
            "lat": lat,
            "lon": lon,
            "speed": 30.0
        }
        try:
            producer.send(TOPIC, msg)
        except Exception as e:
            print(f"[{bus_id}] ERROR enviando a Kafka:", e)
        time.sleep(SEND_INTERVAL)
        idx += direction
        if idx >= n:
            direction = -1; idx = n-1
        elif idx < 0:
            direction = 1;  idx = 0

def main():
    threads = []
    for bus_id, path in ROUTES.items():
        t = threading.Thread(
            target=simulate_bus,
            args=(bus_id, path),
            daemon=True
        )
        threads.append(t)
        t.start()
    print("Simulador Kafka lanzado. Enviando datos cada", SEND_INTERVAL, "segundos.")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("Terminando simulador...")

if __name__ == "__main__":
    main()
