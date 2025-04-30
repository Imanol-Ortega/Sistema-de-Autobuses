from flask import Flask, jsonify, render_template
from simulator import BusSimulator
import threading
import time

app = Flask(__name__)
simulator = BusSimulator()

# Función que actualiza la simulación cada 3 segundos en segundo plano
def simulation_loop():
    while True:
        simulator.update()
        time.sleep(3)

# Iniciar el hilo de simulación
threading.Thread(target=simulation_loop, daemon=True).start()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/buses")
def get_buses():
    return jsonify(simulator.get_bus_data())

@app.route("/api/routes")
def get_routes():
    return jsonify(simulator.get_route_data())

if __name__ == "__main__":
    app.run(debug=True)
