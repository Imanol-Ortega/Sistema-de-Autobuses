import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../service/axios';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  CircleMarker,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import busImg from '../assets/icons/bus.png';

const busIcon = new L.Icon({
  iconUrl: busImg,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

export default function BusMap() {
  const navigate = useNavigate();
  const wsRef = useRef();

  // const { user } = useAuth();  
  const { user: rawUser } = useAuth();
  const user = typeof rawUser === 'string' ? JSON.parse(rawUser) : rawUser;
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState({});
  const [mostrarLista, setMostrarLista] = useState(false);

  // WebSocket
  useEffect(() => {
    const socket = new WebSocket('ws://192.168.1.100:8080/ws');
    wsRef.current = socket;

    socket.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        if (msg.type === 'ROUTE') setRoutes(msg.routes);
        if (msg.type === 'BUS') {
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
      } catch (e) {
        console.error('Mensaje WS malformado', e);
      }
    };

    socket.onerror = (err) => console.error('WS error', err);
    socket.onclose = () => console.log('WS cerrado');

    return () => socket.close();
  }, []);

  const busesArray = Object.values(buses);

  const handlePagar = async (bus) => {
    console.log("Ingreas handle");
    try {
      console.log("user.user_id: ",user.user_id);
      const response = await api.post('/usuarios/pagar', {
        bus_id: bus.id,
        user_id: user.user_id,
      });
      console.log("response pagar",response);
      alert(`✅ Pago exitoso.'}`); 
      return response.data;
    } catch (error) {
      console.error('Error al pagar pasaje:', error.response?.data || error.message);
      throw error;
    }
  };


  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
      <button
        onClick={() => navigate('/home')}
        style={{
          position: 'absolute',
          top: 20,
          left: 30,
          zIndex: 1000,
          background: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '8px 14px',
          cursor: 'pointer',
        }}
      >
        ← Volver
      </button>

      <button
        onClick={() => setMostrarLista(!mostrarLista)}
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          backgroundColor: '#28a745',
          color: '#fff',
          border: 'none',
          borderRadius: '24px',
          padding: '12px 20px',
          fontSize: '16px',
          fontWeight: 'bold',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
          cursor: 'pointer',
        }}
      >
        {mostrarLista ? 'Ocultar lista de buses' : 'Ver buses'}
      </button>

      {mostrarLista && (
        <div
          style={{
            position: 'absolute',
            bottom: '70px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 999,
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '10px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            maxHeight: '300px',
            overflowY: 'auto',
            width: '90%',
            maxWidth: '400px',
          }}
        >
          {busesArray.map((bus) => (
            <div
              key={bus.id}
              style={{
                borderBottom: '1px solid #ccc',
                padding: '8px 0',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <strong style={{ color: 'black' }}>Bus ID: {bus.id}</strong>
              <br />
              <span style={{ color: 'black' }}>Ruta: {bus.route_id}</span>
              <br />
              <span style={{ color: 'black' }}>Velocidad: {bus.speed} km/h</span>
              <button
                onClick={() => handlePagar(bus)}
                style={{
                  marginTop: '6px',
                  backgroundColor: '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  alignSelf: 'flex-start',
                }}
              >
                Pagar
              </button>
            </div>
          ))}
        </div>
      )}

      <MapContainer
        center={[-27.33, -55.86]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {routes.map((rt) => (
          <Polyline
            key={`route-${rt.id}`}
            positions={rt.stops.map((s) => s.position)}
            color={rt.color}
            weight={4}
          />
        ))}

        {routes.flatMap((rt) =>
          rt.stops.map((st, idx) => (
            <CircleMarker
              key={`stop-${rt.id}-${idx}`}
              center={st.position}
              radius={5}
              pathOptions={{ color: '#000' }}
            >
              {st.name && <Popup>{st.name}</Popup>}
            </CircleMarker>
          ))
        )}

        {busesArray.map((bus) => (
          <Marker
            key={bus.id}
            position={[bus.lat, bus.lon]}
            icon={busIcon}
          >
            <Popup>
              🚌 <b>{bus.id}</b><br />
              Ruta: {bus.route_id}<br />
              Vel: {bus.speed} km/h
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
    </div>
  );
}
