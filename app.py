from flask import Flask, render_template, jsonify
from simulator import BusSimulator, cargar_grafo_y_ruta
import threading
import time
from datetime import datetime

app = Flask(__name__)

simulators = []
NUM_BUSES = 5

G, _ = cargar_grafo_y_ruta()

colors = [
    "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF",
    "#FFA500", "#800080", "#008000", "#FFC0CB", "#00CED1", "#FF1493",
    "#ADFF2F", "#4B0082", "#FF6347"
]


for i in range(NUM_BUSES):
    _, ruta = cargar_grafo_y_ruta()
    color = colors[i % len(colors)] 
    bus = BusSimulator(
        bus_id=f"Bus{i+1:02}",
        G=G,
        route=ruta,
        route_id=f"Route{i+1}",
        color=color
    )
    simulators.append(bus)

def run_simulation():
    while True:
        for sim in simulators:
            sim.update()
        time.sleep(1)

sim_thread = threading.Thread(target=run_simulation)
sim_thread.daemon = True
sim_thread.start()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/buses')
def get_buses():
    return jsonify({
        'buses': [bus.get_bus_data()[0] for bus in simulators],
        'routes': [bus.get_route_data()[0] for bus in simulators],
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
