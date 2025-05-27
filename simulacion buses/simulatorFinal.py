import random
from geopy.distance import geodesic
from faker import Faker
from datetime import datetime, timedelta
from cassandra.cluster import Cluster
from cassandra.auth import PlainTextAuthProvider
import uuid

class BusSimulator:
    def __init__(self, num_buses=6):
        self.fake = Faker()
        self.num_buses = num_buses
        self.buses = []
        self.routes = []
        self.landmarks = []
        self.traffic_conditions = ["light", "moderate", "heavy", "congested"]
        self.traffic_multipliers = {
            "light": 1.0,
            "moderate": 1.3,
            "heavy": 1.7,
            "congested": 2.5
        }
        self.current_traffic = {}
        self.DEFAULT_ZONE = "DEFAULT_ZONE"
        self.DEFAULT_TRAFFIC = "moderate"
        self.cluster = Cluster(['127.0.0.1'])  # Cambiar por tu IP de Cassandra
        self.session = self.cluster.connect('transit')
        self._initialize_system()

    def _initialize_system(self):
        self._load_landmarks_and_routes()
        self._generate_buses()
        self._initialize_traffic_conditions()


    def _load_landmarks_and_routes(self):
        self.routes = []
        self.landmarks = []

        rutas_rows = self.session.execute("SELECT id, nombre, color FROM rutas")

        for ruta_row in rutas_rows:
            ruta_id = ruta_row.id
            ruta_nombre = ruta_row.nombre
            ruta_color = ruta_row.color

            orden_paradas = self.session.execute("""
                SELECT o.orden, p.id, p.latitud, p.longitud, p.nombre 
                FROM orden_paradas o
                JOIN paradas p ON o.parada_id = p.id
                WHERE o.ruta_id = %s
                ORDER BY o.orden ASC
            """, (ruta_id,))

            stops = []
            for row in orden_paradas:
                stops.append((row.latitud, row.longitud, row.nombre))
                self.landmarks.append((row.latitud, row.longitud, row.nombre))

            self.routes.append({
                "id": ruta_id,
                "name": ruta_nombre,
                "color": ruta_color,
                "stops": stops
            })


    def _get_route_color(self, route_id):
        colors = ['#FF0000', '#0000FF', '#00FF00', '#800080', '#FFA500', '#00FFFF']
        return colors[(route_id - 1) % len(colors)]

    def _generate_buses(self):
        insert_query = """
            INSERT INTO buses (
                bus_id, plate, route_id, 
                route_name, route_color, 
                capacity, status, driver_id
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        for bus_id in range(1, self.num_buses + 1):
            route = self.routes[(bus_id - 1) % len(self.routes)]
            start = route["stops"][0]
            
            # Generar datos para Cassandra
            bus_data = {
                "id": f"BUS-{bus_id:03d}",  # ID en formato texto
                "plate": self.fake.license_plate(),
                "route_id": str(route["id"]),
                "route_name": route["name"],
                "route_color": route["color"],
                "capacity": random.choice([30, 40, 50]),
                "status": "in_operation",
                "driver_id": uuid.uuid4()
            }
            
            # Insertar en Cassandra
            self.session.execute(insert_query, (
                bus_data["id"],
                bus_data["plate"],
                bus_data["route_id"],
                bus_data["route_name"],
                bus_data["route_color"],
                bus_data["capacity"],
                bus_data["status"],
                bus_data["driver_id"]
            ))
            
            # Configurar datos de simulación
            bus = {
                **bus_data,
                "current_position": [start[0], start[1]],
                "speed": random.uniform(50, 60),
                "passengers": random.randint(5, 45),
                "next_stop": None,
                "next_stop_name": None
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

            position = tuple(bus["current_position"])
            in_stop = None
            for lat, lon, name in self.landmarks:
                if geodesic(position, (lat, lon)).meters < 20:  # margen para detectar llegada exacta a parada
                    in_stop = name
                    break

            print(f"Bus {bus['id']} ({bus['plate']}) en posición {position}")
            if in_stop:
                print(f"  ➤ Está en la parada: {in_stop}")
            else:
                print(f"  ➤ No está en una parada")


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
        t = 1 / 3600
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
        route = next(r for r in self.routes if r["id"] == bus["route_id"])
        if bus["next_stop_name"] == route["stops"][0][2]:
            bus["status"] = "at_terminal"

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

    def get_route_data(self):
        return [{
            "id": r["id"],
            "name": r["name"],
            "color": r["color"],
            "stops": [{"position": [s[0], s[1]], "name": s[2]} for s in r["stops"]]
        } for r in self.routes]

    def __del__(self):
        """Cierra la conexión con Cassandra"""
        self.cluster.shutdown()
