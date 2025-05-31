import random
import time
import json
from datetime import datetime
from kafka import KafkaProducer
from geopy.distance import geodesic
from faker import Faker

# -----------------------
# CONFIGURACIÓN KAFKA
# -----------------------
BOOTSTRAP_SERVERS = ["localhost:29092"]  # nombre del servicio kafka en docker-compose
TOPIC = "bus-updates"
SEND_INTERVAL = 5  # segundos

# -----------------------
# SIMULADOR DE BUSES
# -----------------------
class BusSimulator:
    def __init__(self, num_buses=6):
        self.fake = Faker()
        self.num_buses = num_buses
        self.buses = []
        self.routes = []
        self.landmarks = []
        self.traffic_conditions = ["light", "moderate", "heavy", "congested"]
        self.traffic_multipliers = {
            "light": 1.0, "moderate": 1.3, "heavy": 1.7, "congested": 2.5
        }
        self.current_traffic = {}
        self.DEFAULT_ZONE = "DEFAULT_ZONE"
        self.DEFAULT_TRAFFIC = "moderate"

        self._initialize_system()

    def _initialize_system(self):
        self._generate_landmarks()
        self._generate_routes()
        self._generate_buses()
        self._initialize_traffic_conditions()

    def _generate_landmarks(self):
        self.landmarks = [
            (-27.30856, -55.88848, "PARADA 1"),
            (-27.31348, -55.87802, "PARADA 2"),
            (-27.31470, -55.87630, "PARADA 3"),
            (-27.32427, -55.87354, "PARADA 4"),
            (-27.32690, -55.87324, "PARADA 5"),
            (-27.32646, -55.86727, "PARADA 6"),
            (-27.32581, -55.85971, "PARADA 7"),
            (-27.33490, -55.85869, "PARADA 8"),
        ]

    def _generate_routes(self):
        route_definitions = [[0, 1, 2, 3, 4, 5, 6, 7]]
        for i, indices in enumerate(route_definitions, 1):
            stops = [self.landmarks[idx] for idx in indices]
            route = {
                "id": i,
                "name": f"Línea {i} - {self.fake.color_name()}",
                "stops": stops,
                "color": "#FF0000"
            }
            self.routes.append(route)

    def _generate_buses(self):
        for bus_id in range(1, self.num_buses + 1):
            route = self.routes[(bus_id - 1) % len(self.routes)]
            start = route["stops"][0]
            bus = {
                "id": bus_id,
                "plate": self.fake.license_plate(),
                "route_id": route["id"],
                "route_name": route["name"],
                "route_color": route["color"],
                "current_position": [start[0], start[1]],
                "speed": random.uniform(50, 60),
                "capacity": random.choice([30, 40, 50]),
                "passengers": random.randint(5, 45),
                "status": "in_operation"
            }
            self._set_next_stop(bus)
            self.buses.append(bus)

    def _set_next_stop(self, bus):
        route = next(r for r in self.routes if r["id"] == bus["route_id"])
        current = bus["current_position"]
        closest = min(route["stops"], key=lambda s: geodesic(current, s[:2]).meters)
        idx = route["stops"].index(closest)
        next_idx = (idx + 1) % len(route["stops"])
        bus["next_stop"] = list(route["stops"][next_idx][:2])
        bus["next_stop_name"] = route["stops"][next_idx][2]

    def _initialize_traffic_conditions(self):
        for lm in self.landmarks:
            self.current_traffic[lm[2]] = random.choice(self.traffic_conditions)
        self.current_traffic[self.DEFAULT_ZONE] = self.DEFAULT_TRAFFIC

    def _update_traffic(self):
        for zone in self.current_traffic:
            if random.random() < 0.2:
                self.current_traffic[zone] = random.choice(self.traffic_conditions)

    def update(self):
        self._update_traffic()
        for bus in self.buses:
            if bus["status"] == "in_operation":
                self._move_bus(bus)

    def _get_zone_from_position(self, position):
        for landmark in self.landmarks:
            if geodesic(position, landmark[:2]).meters < 500:
                return landmark[2]
        return self.DEFAULT_ZONE

    def _move_bus(self, bus):
        pos = bus["current_position"]
        next_pos = bus["next_stop"]
        dist = geodesic(pos, next_pos).kilometers
        direction = [next_pos[0] - pos[0], next_pos[1] - pos[1]]

        zone = self._get_zone_from_position(pos)
        traffic = self.current_traffic.get(zone, self.DEFAULT_TRAFFIC)
        multiplier = self.traffic_multipliers.get(traffic, 1.3)

        effective_speed = bus["speed"] / multiplier
        t = 1 / 3600  # 1 segundo en horas
        d = effective_speed * t

        if d >= dist:
            bus["current_position"] = next_pos
            self._handle_arrival(bus)
        else:
            ratio = d / dist
            bus["current_position"][0] += direction[0] * ratio
            bus["current_position"][1] += direction[1] * ratio

    def _handle_arrival(self, bus):
        self._set_next_stop(bus)
        bus["passengers"] = max(0, min(bus["capacity"], bus["passengers"] + random.randint(-10, 15)))

    def get_bus_data(self):
        return [{
            "id": b["id"],
            "plate": b["plate"],
            "route_id": b["route_id"],
            "route_name": b["route_name"],
            "route_color": b["route_color"],
            "position": b["current_position"],
            "next_stop": b["next_stop_name"],
            "passengers": b["passengers"],
            "capacity": b["capacity"],
            "status": b["status"]
        } for b in self.buses]

# -----------------------
# ENVÍO A KAFKA
# -----------------------
if __name__ == "__main__":
    producer = KafkaProducer(
        bootstrap_servers=BOOTSTRAP_SERVERS,
        value_serializer=lambda v: json.dumps(v).encode('utf-8')
    )

    sim = BusSimulator()

    print("🚍 Iniciando simulación de buses en Kafka...")
    try:
        while True:
            sim.update()
            buses = sim.get_bus_data()
            for bus in buses:
                message = {
                    "bus_id": f"bus-{bus['id']}",
                    "route_id": str(bus["route_id"]),
                    "timestamp": int(time.time()),
                    "lat": bus["position"][0],
                    "lon": bus["position"][1],
                    "speed": 30.0
                }
                try:
                    producer.send(TOPIC, message)
                    producer.flush()
                    print("✅ Enviado:", message)
                except Exception as e:
                    print("❌ Error al enviar:", e)
            time.sleep(SEND_INTERVAL)
    except KeyboardInterrupt:
        print("🛑 Simulación detenida.")
