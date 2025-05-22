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
            (-27.308563866712703, -55.88848221142081, "PARADA 1"), #0
            (-27.31348895559728, -55.87801972614911, "PARADA 2"),#01
            (-27.314702680319105, -55.87629596489677, "PARADA 3"),#02
            (-27.324272397850027, -55.87354156913617, "PARADA 4"),#03
            (-27.326901355070653, -55.87324384844059, "PARADA 5"),#04
            (-27.32646186778126, -55.8672731150721, "PARADA 6"),#05
            (-27.325814842500744, -55.85970944207628, "PARADA 7"),#06
            (-27.3349032591035, -55.85869406881804, "PARADA 8"),#07
            (-27.34322353331501, -55.857905328987734, "PARADA 9"),#08
            (-27.374179011163633, -55.813748405755405, "PARADA 10"),#09
            (-27.372536093194647, -55.819415938716325, "PARADA 11"),#010
            (-27.372221935642745, -55.824428789991465, "PARADA 12"),#011
            (-27.372655725229126, -55.83030895575187, "PARADA 13"),#012
            (-27.37313017992561, -55.83419148223118, ""),#013
            (-27.37193591771171, -55.83439341410517, ""),#014
            (-27.372052088180368, -55.83660827564349, ""),#015
            (-27.371691558739233, -55.8374021976334, ""),#016
            (-27.370173316327115, -55.83875547352241, "PARADA 18"),#017
            (-27.368715143033445, -55.84221534898674, ""),#018
            (-27.363379026425182, -55.84651425569864, "PARADA 20"),#019
            (-27.362169150392404, -55.845607560863996, ""),#020
            (-27.358511275195387, -55.84979635027353, "PARADA 22"),#021
            (-27.353394211426547, -55.8580622291968, "PARADA 23"),#022
            (-27.347915031671544, -55.85830324647903, "PARADA 24"),#023
            (-27.340449691756902, -55.857934641199684, "PARADA 25"),#024
            (-27.357164994822323, -55.76205879441728, "PARADA 26"),#025
            (-27.351141094798443, -55.76199810301605, ""),#026
            (-27.335518356112043, -55.77915959913317, "PARADA 27"),#027
            (-27.316417035018734, -55.80042566941425, "PARADA 28"),#028
            (-27.29409025492723, -55.825424588239265, "PARADA 29"),#029
           ( -27.30576604674869, -55.83785812661945, "PARADA 30"),#030
            (-27.30961599238335, -55.84156026045359, ""),#031
            (-27.31473025330807, -55.85153841484226, "PARADA 31"),#032
            (-27.32308963138208, -55.85714982829584, ""),#033
            (-27.357333096915525, -55.777735618922016, "PARADA 32"),#34
            (-27.358871547202746, -55.77820475456354, ""),#35
            (-27.357857585604975, -55.784349241228554, "PARADA 33"),#36
            (-27.35361836504811, -55.79546669449994, ""),#37
            (-27.351531664906346, -55.800145868638374, "PARADA 34"),#38
            (-27.352653512449937, -55.80483722505356, ""),#39
            (-27.35221063201592, -55.81017590831347, ""),#40
            (-27.34867891563418, -55.81717910207219, "PARADA 35"),#41
            (-27.344191296184636, -55.82515440840847, ""),#42
            (-27.34524910847937, -55.8310005607337, "PARADA 36"),#43
            (-27.342396197474837, -55.835872353934086, ""),#44
            (-27.344552664758332, -55.84079008067769, ""),#45
            (-27.342800581811726, -55.845068829103965, "PARADA 37"),#46
            (-27.342261473811227, -55.85189661816739, ""),#47
            (-27.343555328605856, -55.85280699004251, ""),#48
        ]

    def _generate_routes(self):
        route_definitions = [
            [0,1,2,3,4,5,6,8,7,8],
            [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
            [25,26,27,28,29,30,31,32,33,6],
            [34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,8]
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
