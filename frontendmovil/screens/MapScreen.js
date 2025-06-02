import React, { useEffect, useRef, useState } from 'react';
import {View,StyleSheet,ActivityIndicator,Modal,Text,FlatList,TouchableOpacity} from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import { getBuses } from '../services/api';

export default function MapScreen() {
  const [busesApi, setBusesApi] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    const socket = new WebSocket('ws://172.25.192.1:8080/ws'); // Cambia por tu IP local
    wsRef.current = socket;

    getBuses()
    .then((data) => {
      setBusesApi(data.response); 

      setLoading(false); 
    })
    .catch((error) => {
      console.error("❌ Error al cargar buses desde la API", error);
      setLoading(false);
    });
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
        <>
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

          {/* Botón para mostrar el modal */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
              <Text style={styles.buttonText}>Comprar pasaje</Text>
            </TouchableOpacity>
          </View>

          {/* Modal */}
          <Modal
            visible={modalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalBackground}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Lista de Colectivos</Text>
                <FlatList
                  data={busesApi}
                  keyExtractor={(item) => item.bus_id}
                  renderItem={({ item }) => (
                    <View style={styles.item}>
                      <View>
                        <Text>🚌 Numero de bus: {item.bus_id}</Text>
                        <Text>📋 Placa: {item.plate}</Text>
                        <Text>🎨 Color: {item.route_color}</Text>
                      </View>
                      <TouchableOpacity style={styles.buyButton}>
                        <Text style={styles.buyButtonText}>Pagar</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                />

                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    zIndex: 999,
    elevation: 10,
  },
  button: {
    backgroundColor: '#1976d2',
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 24,
    elevation: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },

  item: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },

  buyButton: {
    backgroundColor: '#1976d2',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#1976d2',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

});
