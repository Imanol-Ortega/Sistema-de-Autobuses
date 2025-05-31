#!/usr/bin/env python3
import os
import threading
import time
import json
import tkinter as tk
from PIL import Image, ImageTk
from kafka import KafkaProducer

# -------------------------
#  CONFIGURACIÓN
# -------------------------
MAP_IMG = "graphs\encarnacion_map.png"
# Límites geográficos de la imagen (latitud y longitud)
# Ajusta estos valores a los de tu mapa estático:
LAT_MIN, LAT_MAX = -25.2920, -25.2410
LON_MIN, LON_MAX = -57.6000, -57.5280

# Rutas de ejemplo (solo dos puntos: puedes añadir más para un trazado real)
ROUTES = {
    "R1": [(-25.2617, -57.5810), (-25.2650, -57.5750)],
    "R2": [(-25.2700, -57.5800), (-25.2740, -57.5700)],
}

# Kafka
TOPIC = "bus-updates"
BOOTSTRAP_SERVERS = "localhost:9092"  # ó "kafka:9092" si corres dentro de Docker

# -------------------------
#  UTILIDADES
# -------------------------
def geo_to_xy(lat, lon, width, height):
    """Convierte lat/lon a coordenadas x,y en píxeles del canvas."""
    x = (lon - LON_MIN) / (LON_MAX - LON_MIN) * width
    y = (LAT_MAX - lat) / (LAT_MAX - LAT_MIN) * height
    return x, y

def interpolate(path, steps=100):
    """Dada una lista de puntos (lat,lon), devuelve una lista interpolada."""
    pts = []
    for (lat1, lon1), (lat2, lon2) in zip(path, path[1:]):
        for t in [i/steps for i in range(steps)]:
            pts.append((lat1 + (lat2-lat1)*t, lon1 + (lon2-lon1)*t))
    return pts

# -------------------------
#  VENTANA TKINTER
# -------------------------
class BusMapApp:
    def __init__(self, root):
        self.root = root
        root.title("Mapa de colectivos — Encarnación")

        # Carga imagen
        if not os.path.exists(MAP_IMG):
            raise FileNotFoundError(f"No encontré '{MAP_IMG}' en el directorio actual.")
        pil_img = Image.open(MAP_IMG)
        self.img_w, self.img_h = pil_img.size
        self.photo = ImageTk.PhotoImage(pil_img)

        # Canvas
        self.canvas = tk.Canvas(root,
                                width=self.img_w,
                                height=self.img_h)
        self.canvas.pack()
        self.canvas_bg = self.canvas.create_image(0, 0,
                                                  image=self.photo,
                                                  anchor=tk.NW)

        # Marcadores de buses
        self.bus_items = {}  # bus_id -> canvas item

        # Arranca la simulación
        self.start_simulation()

    def update_bus(self, bus_id, lat, lon):
        x, y = geo_to_xy(lat, lon, self.img_w, self.img_h)
        if bus_id not in self.bus_items:
            # crea un círculo nuevo
            r = 6
            item = self.canvas.create_oval(x-r, y-r, x+r, y+r,
                                           fill="red", outline="")
            self.bus_items[bus_id] = item
        else:
            # mueve el existente
            item = self.bus_items[bus_id]
            r = 6
            self.canvas.coords(item, x-r, y-r, x+r, y+r)

    def start_simulation(self):
        # Precompone listas de puntos interpolados
        routes_pts = {
            rid: interpolate(path, steps=200)
            for rid, path in ROUTES.items()
        }
        # Lanza un hilo por bus
        for idx, rid in enumerate(ROUTES, start=1):
            bus_id = f"{rid}-{idx}"
            pts = routes_pts[rid]
            t = threading.Thread(target=self.simulate_bus,
                                 args=(bus_id, rid, pts),
                                 daemon=True)
            t.start()

    def simulate_bus(self, bus_id, route_id, pts):
        # Configura Kafka
        producer = KafkaProducer(
            # bootstrap_servers=['localhost:9092'],
            bootstrap_servers=['localhost:29092'],  # <-- puerto externo
            value_serializer=lambda v: json.dumps(v).encode()
        )
        i, direction = 0, 1
        n = len(pts)
        while True:
            lat, lon = pts[i]
            msg = {
                "bus_id": bus_id,
                "route_id": route_id,
                "timestamp": int(time.time()),
                "lat": lat,
                "lon": lon,
                "speed": 30.0  # simulo siempre 30 km/h
            }
            try:
                producer.send(TOPIC, msg)
            except Exception as e:
                print("ERROR al enviar a Kafka:", e)
            # Actualiza UI en el hilo principal
            self.root.after(0, lambda b=bus_id, la=lat, lo=lon: 
                                 self.update_bus(b, la, lo))
            time.sleep(0.5)
            # avanza/retrasa
            i += direction
            if i >= n:
                direction = -1
                i = n-1
            elif i < 0:
                direction = 1
                i = 0


# -------------------------
#  MAIN
# -------------------------
if __name__ == "__main__":
    root = tk.Tk()
    app = BusMapApp(root)
    root.mainloop()
