import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

import busImg from '../assets/icons/movil.png';

// Icono genérico del colectivo
const busIcon = new L.Icon({
  iconUrl: busImg,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

export default function BusMap() {
  const navigate = useNavigate();
  const wsRef = useRef();

  const [routes, setRoutes]   = useState([]);   // rutas + paradas que llega en un único mensaje ROUTE
  const [buses,  setBuses]    = useState({});   // diccionario bus_id → obj posición

  // 1️⃣ Conectarse al WebSocket y escuchar
  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080/ws'); // ajusta host/puerto
    wsRef.current = socket;

    socket.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        if (msg.type === 'ROUTE') {
          // Mensaje de definición completa de rutas
          setRoutes(msg.routes);
        }
        if (msg.type === 'BUS') {
          // Mensaje de posición de un colectivo
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
    socket.onclose  = ()   => console.log('WS cerrado');

    return () => socket.close();
  }, []);

  /* helpers ------------------------------------------------------------ */
  const busesArray = Object.values(buses);

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
      {/* Botón volver */}
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

      <MapContainer
        center={[-27.33, -55.86]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Rutas */}
        {routes.map((rt) => (
          <Polyline
            key={`route-${rt.id}`}
            positions={rt.stops.map((s) => s.position)}
            color={rt.color}
            weight={4}
          />
        ))}

        {/* Paradas */}
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

        {/* Buses en vivo */}
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
