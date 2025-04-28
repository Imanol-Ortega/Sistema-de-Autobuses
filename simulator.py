import osmnx as ox
import networkx as nx
import random

G_GLOBAL = None 

class BusSimulator:
    def __init__(self, bus_id, G, route, route_id, color):
        self.G = G
        self.bus_id = bus_id
        self.route = route
        self.route_id = route_id
        self.color = color
        self.current_index = 0
        self.step_counter = 0
        self.position = self._get_node_coords(route[0])

    def _get_node_coords(self, node):
        x = self.G.nodes[node]['x']
        y = self.G.nodes[node]['y']
        return (x, y)

    def update(self):
        self.step_counter += 1
        if self.step_counter % 5 == 0:
            self.current_index += 1
            if self.current_index >= len(self.route):
                self.current_index = 0
            node = self.route[self.current_index]
            self.position = self._get_node_coords(node)

    def get_bus_data(self):
        return [{
            'id': self.bus_id,
            'lat': self.position[1],
            'lon': self.position[0]
        }]

    def get_route_data(self):
        return [{
            'id': self.bus_id,
            'route_id': self.route_id,
            'color': self.color,  
            'route': [
                {'lat': self.G.nodes[n]['y'], 'lon': self.G.nodes[n]['x']}
                for n in self.route
            ]
        }]

def cargar_grafo_y_ruta():
    global G_GLOBAL
    if G_GLOBAL is None:
        print("Cargando red vial de Encarnación...")
        G_GLOBAL = ox.graph_from_place("Encarnación, Paraguay", network_type="drive")
        print("Red vial cargada.")

    G = G_GLOBAL
    nodes = list(G.nodes)
    origen = random.choice(nodes)
    destino = random.choice(nodes)
    while origen == destino:
        destino = random.choice(nodes)

    try:
        ruta = nx.shortest_path(G, origen, destino, weight='length')
        print(f"Ruta generada de {origen} a {destino}")
        return G, ruta
    except Exception as e:
        print("Error generando ruta:", e)
        return G, nodes[:5]  # fallback

