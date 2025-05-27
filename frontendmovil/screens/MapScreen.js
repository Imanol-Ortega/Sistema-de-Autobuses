import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { getBuses } from '../services/api';

export default function MapScreen() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const data = await getBuses();
        setBuses(data);
      } catch (error) {
        console.error('Error cargando buses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBuses();

    const interval = setInterval(fetchBuses, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#1976d2" />
      ) : (
        <MapView
          style={StyleSheet.absoluteFill}
          initialRegion={{
            latitude: -27.05,
            longitude: -56.07,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
        >
          <UrlTile
            urlTemplate="http://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
            flipY={false}
          />
          {buses.map(bus => (
            <Marker
              key={bus.id}
              coordinate={{
                latitude: bus.position[0],
                longitude: bus.position[1],
              }}
              title={`Bus ${bus.plate}`}
              description={`${bus.route_name} - Pasajeros: ${bus.passengers}`}
              pinColor={bus.route_color}
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
