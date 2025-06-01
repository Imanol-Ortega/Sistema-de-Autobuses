#!/usr/bin/env python3
# simulador_kafka_v2.py
import json, random, time
from datetime import datetime
from kafka import KafkaProducer
from geopy.distance import geodesic
from faker import Faker
import pandas as pd

import gpxpy
import json


BOOTSTRAP_SERVERS = ["localhost:29092"]
TOPIC             = "bus-updates"
TICK_SEC          = 3          # intervalo de simulación
REBROADCAST_SEC   = 300        # re-emitir rutas

faker = Faker()




gpx_files = {
    "Roja": "C:/Users/Alan Duarte/Documents/2025-primer-semestre/sistemas/Sistema-de-Autobuses/bus-realtime-processor/src/ruta_roja.gpx",
    "Azul": "C:/Users/Alan Duarte/Documents/2025-primer-semestre/sistemas/Sistema-de-Autobuses/bus-realtime-processor/src/ruta_azul.gpx",
    "Verde": "C:/Users/Alan Duarte/Documents/2025-primer-semestre/sistemas/Sistema-de-Autobuses/bus-realtime-processor/src/ruta_verde.gpx",
    "Lila": "C:/Users/Alan Duarte/Documents/2025-primer-semestre/sistemas/Sistema-de-Autobuses/bus-realtime-processor/src/ruta_lila.gpx"

}

route_colors = {
    "Roja": "#FF0000",
    "Azul": "#0000FF",
    "Verde": "#00FF00",
    "Lila": "#800080"
}

routes = []

for idx, (name, path) in enumerate(gpx_files.items(), 1):
    with open(path, "r", encoding="utf-8") as gpx_file:
        gpx = gpxpy.parse(gpx_file)
        stops = []
        for track in gpx.tracks:
            for segment in track.segments:
                points = segment.points
                total = len(points)
                sampled_stops = []
                for i, point in enumerate(points):
                    # Tomar el primer, el último y cada 5 puntos intermedios
                    if i == 0 or i == total - 1 or i % 5 == 0:
                        sampled_stops.append({
                            "position": [point.latitude, point.longitude],
                            "name": ""
                        })
                if sampled_stops:
                    sampled_stops[0]["name"] = "Inicio"
                    sampled_stops[-1]["name"] = "Fin"
                routes.append({
                    "id": idx,
                    "name": f"Línea {idx} - {name}",
                    "color": route_colors[name],
                    "stops": sampled_stops
                })



# with open("rutas_generadas.json", "w", encoding="utf-8") as f:
#     json.dump({"routes": routes}, f, indent=2, ensure_ascii=False)


# # ─── PARADAS ─────────────────────────────────────────────
# landmarks = [
#             (-27.308563866712703, -55.88848221142081, "PARADA 1"),
#             (-27.31348895559728, -55.87801972614911, "PARADA 2"),
#             (-27.314702680319105, -55.87629596489677, "PARADA 3"),
#             (-27.324272397850027, -55.87354156913617, "PARADA 4"),
#             (-27.326901355070653, -55.87324384844059, "PARADA 5"),
#             (-27.32646186778126, -55.8672731150721, "PARADA 6"),
#             (-27.325814842500744, -55.85970944207628, "PARADA 7"),
#             (-27.3349032591035, -55.85869406881804, "PARADA 8"),
#             (-27.34322353331501, -55.857905328987734, "PARADA 9"),
#             (-27.374179011163633, -55.813748405755405, "PARADA 10"),
#             (-27.372536093194647, -55.819415938716325, "PARADA 11"),
#             (-27.372221935642745, -55.824428789991465, "PARADA 12"),
#             (-27.372655725229126, -55.83030895575187, "PARADA 13"),
#             (-27.37313017992561, -55.83419148223118, ""),
#             (-27.37193591771171, -55.83439341410517, ""),
#             (-27.372052088180368, -55.83660827564349, ""),
#             (-27.371691558739233, -55.8374021976334, ""),
#             (-27.370173316327115, -55.83875547352241, "PARADA 18"),
#             (-27.368715143033445, -55.84221534898674, ""),
#             (-27.363379026425182, -55.84651425569864, "PARADA 20"),
#             (-27.362169150392404, -55.845607560863996, ""),
#             (-27.358511275195387, -55.84979635027353, "PARADA 22"),
#             (-27.353394211426547, -55.8580622291968, "PARADA 23"),
#             (-27.347915031671544, -55.85830324647903, "PARADA 24"),
#             (-27.340449691756902, -55.857934641199684, "PARADA 25"),
#             (-27.357164994822323, -55.76205879441728, "PARADA 26"),
#             (-27.351141094798443, -55.76199810301605, ""),
#             (-27.335518356112043, -55.77915959913317, "PARADA 27"),
#             (-27.316417035018734, -55.80042566941425, "PARADA 28"),
#             (-27.29409025492723, -55.825424588239265, "PARADA 29"),
#             (-27.30576604674869, -55.83785812661945, "PARADA 30"),
#             (-27.30961599238335, -55.84156026045359, ""),
#             (-27.31473025330807, -55.85153841484226, "PARADA 31"),
#             (-27.32308963138208, -55.85714982829584, ""),
#             (-27.357333096915525, -55.777735618922016, "PARADA 32"),
#             (-27.358871547202746, -55.77820475456354, ""),
#             (-27.357857585604975, -55.784349241228554, "PARADA 33"),
#             (-27.35361836504811, -55.79546669449994, ""),
#             (-27.351531664906346, -55.800145868638374, "PARADA 34"),
#             (-27.352653512449937, -55.80483722505356, ""),
#             (-27.35221063201592, -55.81017590831347, ""),
#             (-27.34867891563418, -55.81717910207219, "PARADA 35"),
#             (-27.344191296184636, -55.82515440840847, ""),
#             (-27.34524910847937, -55.8310005607337, "PARADA 36"),
#             (-27.342396197474837, -55.835872353934086, ""),
#             (-27.344552664758332, -55.84079008067769, ""),
#             (-27.342800581811726, -55.845068829103965, "PARADA 37"),
#             (-27.342261473811227, -55.85189661816739, ""),
#             (-27.343555328605856, -55.85280699004251, ""),
# ]

# # ─── RUTAS ───────────────────────────────────────────────
# route_indices = [
#     [0,1,2,3,4,5,6,8,7],            # Roja
#     [9,10,11,12,13,14,15,16,17,18], # Azul
#     [19,20,21,22,23,24,25],         # Verde
#     [26,27,28,29,30,6,7],           # Morada
# ]
# route_colors = ['#FF0000','#0000FF','#00FF00','#800080']

# routes = [{
#     "id": i+1,
#     "name": f"Línea {i+1}",
#     "color": route_colors[i],
#     "stops":[{"name":landmarks[idx][2],"position":[landmarks[idx][0],landmarks[idx][1]]} for idx in idxs]
# } for i,idxs in enumerate(route_indices)]



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
