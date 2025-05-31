import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import busImg from '../assets/icons/bus.png';
import 'leaflet/dist/leaflet.css';

const busIcon = new L.Icon({
  iconUrl: busImg,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function generarBusesIniciales() {
  const baseLat = -27.3315;
  const baseLng = -55.8664;
  return Array.from({ length: 5 }).map((_, i) => ({
    id: i + 1,
    lat: baseLat + (Math.random() - 0.5) * 0.02,
    lng: baseLng + (Math.random() - 0.5) * 0.02,
    direction: 'Norte',
  }));
}

export default function BusMap() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [buses, setBuses] = useState(generarBusesIniciales());

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    const interval = setInterval(() => {
      setBuses((prevBuses) =>
        prevBuses.map((bus) => ({
          ...bus,
          lat: bus.lat + (Math.random() - 0.5) * 0.001,
          lng: bus.lng + (Math.random() - 0.5) * 0.001,
          direction: ['Norte', 'Sur', 'Este', 'Oeste'][Math.floor(Math.random() * 4)],
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [token, navigate]);

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
      {/* Botón para volver a /home */}
      <button
        onClick={() => navigate('/home')}
        style={{
          position: 'absolute',
          top: '20px',
          left: '50px',
          zIndex: 1000,
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          padding: '10px 16px',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        ← Volver
      </button>

      <MapContainer center={[-27.3315, -55.8664]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {buses.map((bus) => (
          <Marker key={bus.id} position={[bus.lat, bus.lng]} icon={busIcon}>
            <Popup>
              Bus #{bus.id} <br />
              Dirección: {bus.direction}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
