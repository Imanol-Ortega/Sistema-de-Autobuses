import random
from geopy.distance import geodesic
from faker import Faker
from datetime import datetime, timedelta

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

        self._initialize_system()

    def _initialize_system(self):
        self._generate_landmarks()
        self._generate_routes()
        self._generate_buses()
        self._initialize_traffic_conditions()

    def _generate_landmarks(self):
        self.landmarks = [
            (-27.04142, -56.07334, "PARADA 1"),
            (-27.05484, -56.05832, "PARADA 2"),
            (-27.07709, -56.03314, "PARADA 3"),
            (-27.08514, -56.02415, "PARADA 4"),
            (-27.08832, -56.02058, "PARADA 5"),
            (-27.08292, -56.01461, "PARADA 6"),
            (-27.07549, -56.00626, "PARADA 7"),
            (-27.08632, -55.99414, "PARADA 8"),
            (-27.09900, -56.00866, "PARADA 9"),
            (-27.09140, -56.01900, "PARADA 10"),
            (-27.09397, -56.01701, "PARADA 11"),
            (-27.09687, -56.01830, "PARADA 12"),
            (-27.10016, -56.02201, "PARADA 13"),
            (-27.10135, -56.01126, "PARADA 14"),
            (-27.09177, -56.03135, "PARADA 15"),
            (-27.09834, -56.02389, "PARADA 16"),
            (-27.10565, -56.01589, "PARADA 17"),
            (-27.11800, -56.02958, "PARADA 18"),
            (-27.13800, -56.05136, "PARADA 19"),
            (-27.08760, -56.02667, "PARADA 20")
        ]

    def _generate_routes(self):
        route_definitions = [
            [0, 1, 2, 3],
            [3, 4, 5, 6, 7, 8],
            [4, 9, 10, 11, 12],
            [13, 17, 18],
            [14, 15, 16],
            [13, 19]
        ]
        for i, indices in enumerate(route_definitions, 1):
            stops = [self.landmarks[idx] for idx in indices]
            route = {
                "id": i,
                "name": f"Línea {i} - {self.fake.color_name()}",
                "stops": stops,
                "color": self._get_route_color(i)
            }
            self.routes.append(route)

    def _get_route_color(self, route_id):
        colors = ['#FF0000', '#0000FF', '#00FF00', '#800080', '#FFA500', '#00FFFF']
        return colors[(route_id - 1) % len(colors)]

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
