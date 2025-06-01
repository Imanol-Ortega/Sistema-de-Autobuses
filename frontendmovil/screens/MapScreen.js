import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';

export default function MapScreen() {
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState({});
  const [loading, setLoading] = useState(true);
  const wsRef = useRef(null);

  useEffect(() => {
    const socket = new WebSocket('ws://172.20.10.9:8080/ws'); // Cambia por tu IP local

    wsRef.current = socket;

    socket.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        if (msg.type === 'ROUTE') {
          setRoutes(msg.routes);
          setLoading(false);
        } else if (msg.type === 'BUS') {
          setBuses((prev) => ({
            ...prev,
            [msg.bus_id]: {
              id: msg.bus_id,
              lat: msg.lat,
              lon: msg.lon,
              route_id: msg.route_id,
              speed: msg.speed,
            },
          }));
        }
      } catch (error) {
        console.error('❌ Error al procesar WS:', error);
      }
    };

    socket.onerror = (err) => console.error('❌ WS Error', err);
    socket.onclose = () => console.log('🔌 WS cerrado');

    return () => socket.close();
  }, []);

  const busesArray = Object.values(buses);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#1976d2" />
      ) : (
        <MapView
          style={StyleSheet.absoluteFill}
          initialRegion={{
            latitude: -27.33,
            longitude: -55.86,
            latitudeDelta: 0.06,
            longitudeDelta: 0.06,
          }}
        >
          <UrlTile
            urlTemplate="https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
          />

          {/* RUTAS */}
          {routes.map((route) => (
            <Polyline
              key={`route-${route.id}`}
              coordinates={route.stops.map((stop) => ({
                latitude: stop.position[0],
                longitude: stop.position[1],
              }))}
              strokeColor={route.color}
              strokeWidth={4}
            />
          ))}

          {/* PARADAS */}
          {routes.flatMap((route) =>
            route.stops.map((stop, idx) => (
              <Marker
                key={`stop-${route.id}-${idx}`}
                coordinate={{
                  latitude: stop.position[0],
                  longitude: stop.position[1],
                }}
                title={stop.name || `Parada ${idx + 1}`}
                pinColor="black"
              />
            ))
          )}

          {/* BUSES */}
          {busesArray.map((bus) => (
            <Marker
              key={bus.id}
              coordinate={{ latitude: bus.lat, longitude: bus.lon }}
              title={`🚌 ${bus.id}`}
              description={`Ruta: ${bus.route_id} | Vel: ${bus.speed} km/h`}
              pinColor="blue"
            />
          ))}
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
