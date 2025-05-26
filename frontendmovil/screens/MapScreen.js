import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import io from 'socket.io-client';

export default function MapScreen() {
    const [buses, setBuses] = useState({});
    const [loading, setLoading] = useState(true);
    const socketRef = useRef(null);

    // Al iniciar, conectarse a WebSocket y escuchar los datos
    useEffect(() => {
        socketRef.current = io("http://192.168.1.100:5000"); // tu IP

        socketRef.current.on("connect", () => {
        console.log("✅ Conectado al WebSocket");
        });

        socketRef.current.on("bus-update", (data) => {
        console.log("🚌 Bus actualizado:", data);
        setBuses(prev => ({
            ...prev,
            [data.bus_id]: data
        }));
        setLoading(false);
        });

        socketRef.current.on("disconnect", () => {
        console.log("🔌 WebSocket desconectado");
        });

        return () => {
        socketRef.current.disconnect();
        };
    }, []);

return (
        <View style={styles.container}>
        {loading ? (
            <ActivityIndicator size="large" color="#1976d2" />
        ) : (
            <MapView
            style={StyleSheet.absoluteFill}
            initialRegion={{
                latitude: -27.3311,
                longitude: -55.8662,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }}
            >
            <UrlTile
                urlTemplate="http://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maximumZ={19}
                flipY={false}
            />

            {Object.values(buses).map((bus) => (
                <Marker
                        key={bus.bus_id}
                        coordinate={{ latitude: bus.lat, longitude: bus.lon }}
                        title={`Bus ${bus.bus_id}`}                // <-- corregido con backticks
                        description={`Ruta ${bus.route_id}`}       // <-- corregido con backticks
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
    justifyContent: 'center',
    alignItems: 'center',
  },
});