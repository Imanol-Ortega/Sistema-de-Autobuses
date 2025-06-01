#!/usr/bin/env python3
# simulador_kafka_v2.py
import json, random, time
from datetime import datetime
from kafka import KafkaProducer
from geopy.distance import geodesic
from faker import Faker

BOOTSTRAP_SERVERS = ["localhost:29092"]
TOPIC             = "bus-updates"
TICK_SEC          = 3          # intervalo de simulación
REBROADCAST_SEC   = 300        # re-emitir rutas

faker = Faker()

# ─── PARADAS ─────────────────────────────────────────────
landmarks = [
    (-27.3085638667,-55.8884822114,"PARADA 1"),  # 0
    (-27.3134889556,-55.8780197261,"PARADA 2"),  # 1
    (-27.3147026803,-55.8762959649,"PARADA 3"),  # 2
    (-27.3242723978,-55.8735415691,"PARADA 4"),  # 3
    (-27.3269013551,-55.8732438484,"PARADA 5"),  # 4
    (-27.3264618678,-55.8672731150,"PARADA 6"),  # 5
    (-27.3258148425,-55.8597094420,"PARADA 7"),  # 6
    (-27.3349032591,-55.8586940688,"PARADA 8"),  # 7
    (-27.3432235333,-55.8579053290,"PARADA 9"),  # 8
    (-27.3741790112,-55.8137484058,"PARADA 10"), # 9
    (-27.3725360932,-55.8194159387,"PARADA 11"), #10
    (-27.3722219356,-55.8244287899,"PARADA 12"), #11
    (-27.3726557252,-55.8303089557,"PARADA 13"), #12
    (-27.3701733163,-55.8387554735,"PARADA 18"), #13
    (-27.3633790264,-55.8465142557,"PARADA 20"), #14
    (-27.3585112752,-55.8497963503,"PARADA 22"), #15
    (-27.3533942114,-55.8580622292,"PARADA 23"), #16
    (-27.3479150316,-55.8583032464,"PARADA 24"), #17
    (-27.3404496917,-55.8579346412,"PARADA 25"), #18
    (-27.3571649948,-55.7620587944,"PARADA 26"), #19
    (-27.3355183561,-55.7791595991,"PARADA 27"), #20
    (-27.3164170350,-55.8004256694,"PARADA 28"), #21
    (-27.2940902549,-55.8254245882,"PARADA 29"), #22
    (-27.3057660467,-55.8378581266,"PARADA 30"), #23
    (-27.3147302533,-55.8515384148,"PARADA 31"), #24
    (-27.3230896314,-55.8571498283,""),          #25
    (-27.3573330969,-55.7777356189,"PARADA 32"), #26
    (-27.3578575856,-55.7843492412,"PARADA 33"), #27
    (-27.3515316649,-55.8001458686,"PARADA 34"), #28
    (-27.3486789156,-55.8171791021,"PARADA 35"), #29
    (-27.3452491085,-55.8310005607,"PARADA 36"), #30
]

# ─── RUTAS ───────────────────────────────────────────────
route_indices = [
    [0,1,2,3,4,5,6,8,7],            # Roja
    [9,10,11,12,13,14,15,16,17,18], # Azul
    [19,20,21,22,23,24,25],         # Verde
    [26,27,28,29,30,6,7],           # Morada
]
route_colors = ['#FF0000','#0000FF','#00FF00','#800080']

routes = [{
    "id": i+1,
    "name": f"Línea {i+1}",
    "color": route_colors[i],
    "stops":[{"name":landmarks[idx][2],"position":[landmarks[idx][0],landmarks[idx][1]]} for idx in idxs]
} for i,idxs in enumerate(route_indices)]

# ─── BUSES ───────────────────────────────────────────────
NUM_BUSES = 6
buses = []
for b_id in range(1, NUM_BUSES+1):
    r = routes[(b_id-1)%len(routes)]
    buses.append({
        "id":        b_id,
        "route_id":  r["id"],
        "speed":     random.uniform(45,60),   # km/h
        "idx_next":  1,                       # va a parada 1
        "pos":       r["stops"][0]["position"][:]
    })

# ─── Kafka helpers ───────────────────────────────────────
producer = KafkaProducer(
    bootstrap_servers=BOOTSTRAP_SERVERS,
    value_serializer=lambda v: json.dumps(v).encode()
)
def send(msg): producer.send(TOPIC, msg)
def broadcast_routes(): send({"type":"ROUTE","timestamp":int(time.time()),"routes":routes})

# ─── Inicio ──────────────────────────────────────────────
print("🚍  Simulador V2 en marcha")
broadcast_routes()
last_routes = time.time()

try:
    while True:
        for bus in buses:
            r = routes[bus["route_id"]-1]
            dest = r["stops"][bus["idx_next"]]["position"]
            dist = geodesic(bus["pos"], dest).kilometers
            step = bus["speed"]/3600 * TICK_SEC
            if dist <= step or dist < 0.02:            # llegó (o casi)
                bus["pos"] = dest[:]
                bus["idx_next"] = (bus["idx_next"]+1) % len(r["stops"])
            else:                                      # avanzar hacia dest
                ratio = step/dist
                bus["pos"][0] += (dest[0]-bus["pos"][0])*ratio
                bus["pos"][1] += (dest[1]-bus["pos"][1])*ratio

            send({
                "type":      "BUS",
                "timestamp": int(time.time()),
                "bus_id":    f"bus-{bus['id']}",
                "route_id":  bus["route_id"],
                "lat":       bus["pos"][0],
                "lon":       bus["pos"][1],
                "speed":     round(bus["speed"],1)
            })

        # re-emitir rutas periódicamente
        if time.time()-last_routes > REBROADCAST_SEC:
            broadcast_routes()
            last_routes = time.time()

        producer.flush()
        time.sleep(TICK_SEC)

except KeyboardInterrupt:
    print("🛑  Simulador detenido")
