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
        self._generate_landmarks()
        self._generate_routes()
        self._generate_buses()
        self._initialize_traffic_conditions()

    def _generate_landmarks(self):
        self.landmarks = [
            #RUTA 1
            (-27.308563866712703, -55.88848221142081, "PARADA 1"), #0
            (-27.31348895559728, -55.87801972614911, "PARADA 2"),#01
            (-27.314702680319105, -55.87629596489677, "PARADA 3"),#02
            (-27.324272397850027, -55.87354156913617, "PARADA 4"),#03
            (-27.326901355070653, -55.87324384844059, "PARADA 5"),#04
            (-27.32646186778126, -55.8672731150721, "PARADA 6"),#05
            (-27.325814842500744, -55.85970944207628, "PARADA 7"),#06
            (-27.3349032591035, -55.85869406881804, "PARADA 8"),#07
            (-27.34322353331501, -55.857905328987734, "PARADA 9"),#08
            

            #RUTA 2
            (-27.32683851449322, -55.871565729114664, "PARADA 10"), #9
            (-27.330927231533675, -55.871168844087556, "PARADA 11"),#10
            (-27.339953721583584, -55.870212562301006, "PARADA 12"),#11
            (-27.339520196502786, -55.864730386934056, "PARADA 13"),#12
            (-27.33918897383208, -55.86101833136877, "PARADA 14"),#13
            (-27.343096765088706, -55.86064720699943, "PARADA 15"),#14
            (-27.34368754354476, -55.85922170063559, "PARADA 16"),#15
            (-27.34113705162994, -55.85776047697891, "PARADA 17"),#16
            (-27.337672800452978, -55.858106956661764, "PARADA 18"),#17
            (-27.331831991921682, -55.8587563222678, "PARADA 19"),#18
            (-27.325610074527333, -55.85948780740727, "PARADA 20"),#19
            (-27.326112577978336, -55.865460233528786, "PARADA 21"),#20

            #RUTA 3
            (-27.34808524848464, -55.858586653256225, "PARADA 22"),#21
            (-27.343102201764115, -55.869777253299624, "PARADA 23"),#22
            (-27.34075780235603, -55.86860813047761, "PARADA 24"),#23
            (-27.333193822841796, -55.8694554446563, "PARADA 25"),#24
            (-27.328064034007415, -55.87000645522405, "PARADA 26"),#25
            (-27.326480750202652, -55.87013897230574, "PARADA 27"),#26
            (-27.326789333813316, -55.87311178483958, "PARADA 28"),#27
            (-27.32200080618517, -55.87368086751254, "PARADA 29"),#28
            (-27.314193006427057, -55.87625344156901, "PARADA 30"),#29
            (-27.311166769200366, -55.884233462905925, "PARADA 31"),#30
            

            #RUTA 4
            (-27.323652939263933, -55.86108769738821, "PARADA 32"),#31
            (-27.32404352633265, -55.86557007454054, "PARADA 33"),#32
            (-27.326121855257142, -55.86533848825795, "PARADA 34"),#33
            (-27.328922694879434, -55.86507935783572, "PARADA 35"),#34
            (-27.332199142731014, -55.864667492641416, "PARADA 36"),#35
            (-27.33944430237637, -55.863919593059755, "PARADA 36"),#36
            (-27.340903549768417, -55.863710149385845, "PARADA 37"),#37
            (-27.343846482481627, -55.865333080091176, "PARADA 38"),#38
            (-27.345893698538198, -55.86074690664742, "PARADA 39"),#39
            (-27.350159511836953, -55.86314397337465, "PARADA 40"),#40
            (-27.353127173361603, -55.86473459977626, "PARADA 41"),#41
            (-27.355912304776318, -55.858730230505834, "PARADA 42"),#42
            (-27.355692585987995, -55.85843882871855, "PARADA 43"),#43
            (-27.35771186683585, -55.8537236405417, "PARADA 44"),#44
            (-27.359045783463102, -55.85223327566109, "PARADA 45"),#45
            (-27.35959330131495, -55.85093397044629, "PARADA 46"),#46
            (-27.358376926863155, -55.85003408730849, "PARADA 47"),#47
            (-27.356284389431536, -55.852605184748285, "PARADA 48"),#48
            (-27.355728900584598, -55.855052908733484, "PARADA 49"),#49
            (-27.3531870519083, -55.858417922767714, "PARADA 50"),#50
            (-27.348181544330053, -55.858411633015265, "PARADA 51"),#51
            (-27.34423718188366, -55.8577330478969, "PARADA 52"),#52
            (-27.32602002886355, -55.863874895447545, "PARADA 53"),#53
            (-27.324944176803484, -55.863943436825444, "PARADA 54"),#54
            (-27.32460144171978, -55.85997604021646, "PARADA 55"),#55
        ]

    def _generate_routes(self):
        route_definitions = [
            [0,30,1,2,3,4,5,6,7,8],
            [4,9,10,11,12,13,14,15,16,17,18,19,20,4],
            [8,21,22,23,24,25,26,27,28,29,30,0],
            [31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,16,17,18,19,53,54,55]
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
