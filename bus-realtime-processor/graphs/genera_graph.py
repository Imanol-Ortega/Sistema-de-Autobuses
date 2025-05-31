# genera_graph.py

import networkx as nx
import os

# Asegúrate de que exista la carpeta graphs/
os.makedirs("graphs", exist_ok=True)

# 1) Crea un grafo de prueba
G = nx.Graph()
G.add_node("A")
G.add_node("B")
G.add_edge("A", "B", length_km=1.2, weight=1.2)

# 2) Serialízalo en graphs/route_graph.gpickle
nx.write_gpickle(G, "graphs/route_graph.gpickle")
print("✔ route_graph.gpickle creado en ./graphs/")
