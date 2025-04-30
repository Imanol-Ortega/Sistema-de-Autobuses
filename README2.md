# Simulador de Autobuses
Este repositorio contiene el **Simulador de Autobuses**, un componente desarrollado para integrarse a un sistema más amplio de monitoreo de autobuses en tiempo real. El simulador reproduce el comportamiento de autobuses que siguen rutas predefinidas y se ven afectados por condiciones variables de tráfico.

**Nota importante**: Este segmento del proyecto **no incluye frontend**. El simulador es una parte aislada del sistema general, y fue desarrollado específicamente para ser integrado posteriormente al backend distribuido. El frontend fue desarrollado para fines demostrativos.

# Funcionalidades del simulador
- Genera paradas urbanas con coordenadas geográficas.
- Define rutas compuestas por secuencias de paradas.
- Crea autobuses con atributos aleatorios (matrícula, velocidad, capacidad, pasajeros).
- Asigna cada autobús a una ruta y simula su movimiento en tiempo real.
- Calcula distancias geográficas y ajusta velocidades según el tráfico.
- Simula condiciones de tráfico dinámicas por zona (light, moderate, heavy, congested).
- Gestiona subida y bajada de pasajeros en cada parada.
- Proporciona datos actualizados de autobuses (get_bus_data) y rutas (get_route_data).

## Resumen de simulator.py por chatgpt
## 🧱 Clase BusSimulator
Es la clase principal del simulador. Encapsula toda la lógica de los autobuses, rutas, paradas y tráfico.

## Método __init__
Crea los atributos básicos:
- num_buses: número de autobuses a simular.
- landmarks: paradas de autobús con coordenadas.
- routes: rutas posibles.
- buses: autobuses que recorrerán rutas.
- traffic_conditions: lista de estados de tráfico.
- traffic_multipliers: modificadores de velocidad según tráfico.
- current_traffic: almacena el estado de tráfico en cada zona.
- Llama a _initialize_system() para generar todos los componentes.

## 🔧 Métodos de inicialización
**self._initialize_system()**
Llama a funciones internas para generar:
- Paradas (_generate_landmarks)
- Rutas (_generate_routes)
- Autobuses (_generate_buses)
- Condiciones de tráfico (_initialize_traffic_conditions)

## 📍 Paradas: _generate_landmarks()
- Define una lista de 20 paradas con nombre y coordenadas (latitud, longitud).
- Se usa como base para construir rutas.

## 🛣️ Rutas: _generate_routes()
- Cada ruta es un conjunto de índices de paradas que forman el recorrido.
- Se asigna un color y nombre a cada ruta.
- Se almacenan como diccionarios con:
    * ID
    * Nombre
    * Lista de paradas
    * Color

## 🚌 Autobuses: _generate_buses()
- Crea autobuses con:
    * Posición inicial: la primera parada de su ruta.
    * Velocidad aleatoria.
    * Capacidad (30–50 pasajeros).
    * Cantidad aleatoria de pasajeros a bordo.
    * Asigna una próxima parada con _set_next_stop(bus).

**_set_next_stop(bus)**
- Busca la parada más cercana al bus.
- Le asigna la siguiente parada como su destino.

## 🚦 Tráfico
**_initialize_traffic_conditions()**
- Asigna al azar una condición de tráfico a cada parada y una zona por defecto.
**_update_traffic()**
- Con una probabilidad del 20%, cambia al azar la condición de tráfico de cada zona.

## 🔄 Actualización: update()
- Llama a _update_traffic().
- Mueve cada bus que está en operación con _move_bus(bus).

## ➡️ Movimiento de buses: _move_bus(bus)
- Calcula la dirección y distancia hasta la próxima parada.
- Usa la condición de tráfico local para ajustar la velocidad efectiva.
- Si puede llegar en 1 segundo (simulado), lo mueve directamente y llama a _handle_arrival(bus).
- Si no, avanza una fracción de la distancia.

**_get_zone_from_position(position)**
- Determina en qué zona (parada cercana) está el bus, para obtener el tráfico.

**_handle_arrival(bus)**
- Cambia la próxima parada.
- Simula el descenso o subida de pasajeros.
- Si vuelve a la parada inicial de la ruta, marca el bus como "at_terminal".

## 📤 Datos públicos
**get_bus_data()**
- Devuelve la información de todos los autobuses (posición, estado, ruta, etc.).

**get_route_data()**
- Devuelve los datos de las rutas (nombre, color, paradas).

## ✅ Resumen
Este simulador permite:
- Definir rutas reales con coordenadas.
- Asignar autobuses que se mueven de parada en parada.
- Modificar su comportamiento con tráfico aleatorio.
- Obtener datos en tiempo real, útiles para interfaces web o sistemas de monitoreo.



