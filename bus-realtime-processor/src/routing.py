import networkx as nx
def load_graph(path="graphs/route_graph.gpickle"):
    return nx.read_gpickle(path)

def find_shortest_path(G, src, dst):
    return nx.dijkstra_path(G, src, dst, weight="weight")
