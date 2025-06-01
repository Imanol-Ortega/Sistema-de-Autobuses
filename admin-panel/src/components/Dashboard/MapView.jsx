import React, { useEffect, useRef, useState } from 'react';
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
import { RefreshCw, Settings, Eye, EyeOff, Filter } from 'lucide-react';

// Fix para iconos de Leaflet en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Icono personalizado para buses
const busIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="8" width="24" height="16" rx="4" fill="#3B82F6"/>
      <rect x="6" y="10" width="6" height="4" rx="1" fill="white"/>
      <rect x="14" y="10" width="6" height="4" rx="1" fill="white"/>
      <rect x="22" y="10" width="6" height="4" rx="1" fill="white"/>
      <circle cx="10" cy="26" r="2" fill="#1F2937"/>
      <circle cx="22" cy="26" r="2" fill="#1F2937"/>
      <rect x="8" y="24" width="16" height="2" fill="#1F2937"/>
    </svg>
  `),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
});

const MapView = () => {
    const wsRef = useRef();
    const [routes, setRoutes] = useState([]);
    const [buses, setBuses] = useState({});
    const [connected, setConnected] = useState(false);
    const [showRoutes, setShowRoutes] = useState(true);
    const [showStops, setShowStops] = useState(true);
    const [selectedRoutes, setSelectedRoutes] = useState(new Set());

    // WebSocket connection
    useEffect(() => {
        const connectWebSocket = () => {
            const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8080/ws';
            const socket = new WebSocket(wsUrl);
            wsRef.current = socket;

            socket.onopen = () => {
                console.log('WebSocket conectado para mapa en tiempo real');
                setConnected(true);
            };

            socket.onmessage = (evt) => {
                try {
                    const msg = JSON.parse(evt.data);

                    if (msg.type === 'ROUTE') {
                        console.log('Rutas recibidas:', msg.routes);
                        setRoutes(msg.routes || []);
                        // Inicializar todas las rutas como seleccionadas
                        setSelectedRoutes(new Set((msg.routes || []).map(r => r.id)));
                    }

                    if (msg.type === 'BUS') {
                        setBuses((prev) => ({
                            ...prev,
                            [msg.bus_id]: {
                                id: msg.bus_id,
                                lat: msg.lat,
                                lon: msg.lon,
                                route_id: msg.route_id,
                                speed: msg.speed || 0,
                                timestamp: Date.now()
                            },
                        }));
                    }
                } catch (e) {
                    console.error('Error procesando mensaje WebSocket:', e);
                }
            };

            socket.onerror = (err) => {
                console.error('Error WebSocket:', err);
                setConnected(false);
            };

            socket.onclose = () => {
                console.log('WebSocket cerrado');
                setConnected(false);

                // Reconectar después de 5 segundos
                setTimeout(connectWebSocket, 5000);
            };
        };

        connectWebSocket();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    // Limpiar buses inactivos (no actualizados en 30 segundos)
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            setBuses(prev => {
                const updated = { ...prev };
                Object.keys(updated).forEach(busId => {
                    if (now - updated[busId].timestamp > 30000) {
                        delete updated[busId];
                    }
                });
                return updated;
            });
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const busesArray = Object.values(buses);
    const activeBusesCount = busesArray.length;
    const activeRoutesCount = new Set(busesArray.map(b => b.route_id)).size;

    const toggleRoute = (routeId) => {
        setSelectedRoutes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(routeId)) {
                newSet.delete(routeId);
            } else {
                newSet.add(routeId);
            }
            return newSet;
        });
    };

    const filteredRoutes = routes.filter(route => selectedRoutes.has(route.id));
    const filteredBuses = busesArray.filter(bus => selectedRoutes.has(bus.route_id));

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header del mapa */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Mapa en Tiempo Real - Encarnación
                        </h3>
                        <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-sm text-gray-600">
                                {connected ? 'Conectado' : 'Desconectado'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* Estadísticas */}
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mr-4">
                            <span>🚌 {activeBusesCount} buses activos</span>
                            <span>🛣️ {activeRoutesCount} rutas con servicio</span>
                        </div>

                        {/* Controles */}
                        <button
                            onClick={() => setShowRoutes(!showRoutes)}
                            className={`p-2 rounded-lg ${showRoutes ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                            title={showRoutes ? 'Ocultar rutas' : 'Mostrar rutas'}
                        >
                            {showRoutes ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>

                        <button
                            onClick={() => setShowStops(!showStops)}
                            className={`p-2 rounded-lg ${showStops ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
                            title={showStops ? 'Ocultar paradas' : 'Mostrar paradas'}
                        >
                            <Filter className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() => {
                                // Actualizar solo el mapa reconectando WebSocket
                                if (wsRef.current) {
                                    wsRef.current.close();
                                }
                                // La reconexión se hará automáticamente por el useEffect
                            }}
                            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
                            title="Actualizar mapa"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>

                    </div>
                </div>

                {/* Filtros de rutas */}
                {routes.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {routes.map((route) => (
                            <button
                                key={route.id}
                                onClick={() => toggleRoute(route.id)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedRoutes.has(route.id)
                                    ? 'text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                style={{
                                    backgroundColor: selectedRoutes.has(route.id) ? route.color : undefined
                                }}
                            >
                                {route.name || route.id}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Mapa centrado en Encarnación */}
            <div style={{ height: '500px' }}>
                <MapContainer
                    center={[-27.3389, -55.8675]} // Coordenadas del centro de Encarnación, Itapúa
                    zoom={14}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />

                    {/* Rutas */}
                    {showRoutes && filteredRoutes.map((route) => (
                        <Polyline
                            key={`route-${route.id}`}
                            positions={route.stops?.map((stop) => stop.position) || []}
                            color={route.color || '#3B82F6'}
                            weight={4}
                            opacity={0.7}
                        />
                    ))}

                    {/* Paradas */}
                    {showStops && filteredRoutes.flatMap((route) =>
                        (route.stops || []).map((stop, idx) => (
                            <CircleMarker
                                key={`stop-${route.id}-${idx}`}
                                center={stop.position}
                                radius={6}
                                pathOptions={{
                                    color: route.color || '#10B981',
                                    fillColor: route.color || '#10B981',
                                    fillOpacity: 0.7,
                                    weight: 2
                                }}
                            >
                                <Popup>
                                    <div className="text-sm">
                                        <strong>{stop.name || `Parada ${idx + 1}`}</strong><br />
                                        Ruta: {route.name || route.id}<br />
                                        {stop.description && <span>{stop.description}</span>}
                                    </div>
                                </Popup>
                            </CircleMarker>
                        ))
                    )}

                    {/* Buses en tiempo real */}
                    {filteredBuses.map((bus) => {
                        const route = routes.find(r => r.id === bus.route_id);
                        return (
                            <Marker
                                key={bus.id}
                                position={[bus.lat, bus.lon]}
                                icon={busIcon}
                            >
                                <Popup>
                                    <div className="text-sm">
                                        <strong>🚌 {bus.id}</strong><br />
                                        Ruta: {route?.name || bus.route_id}<br />
                                        Velocidad: {bus.speed} km/h<br />
                                        <span className="text-xs text-gray-500">
                                            Última actualización: {new Date(bus.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
            </div>

            {/* Footer con información */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                        {connected
                            ? `📡 Conectado - Última actualización: ${new Date().toLocaleTimeString()}`
                            : '🔴 Desconectado - Intentando reconectar...'
                        }
                    </span>
                    <span>
                        📍 {filteredBuses.length} buses monitoreados en {filteredRoutes.length} rutas • Encarnación, Itapúa
                    </span>
                </div>
            </div>
        </div>
    );
};

export default MapView;