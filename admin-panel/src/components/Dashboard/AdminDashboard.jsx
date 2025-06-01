import React, { useState } from 'react';
import {
  Users,
  Bus,
  UserCheck,
  MapPin,
  Activity,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  AlertCircle as AlertIcon
} from 'lucide-react';

// Importar componentes
import StatsCard from './StatsCard';
import DataTable from './DataTable';
import BusForm from '../Forms/BusForm';
import ConductorForm from '../Forms/ConductorForm';
import UsuarioForm from '../Forms/UsuarioForm';

// Importar hooks personalizados
import { useBuses, useConductores, useUsuarios, useEstadisticas } from '../../hooks/useApi';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Estados para formularios modales
  const [busFormOpen, setBusFormOpen] = useState(false);
  const [conductorFormOpen, setConductorFormOpen] = useState(false);
  const [usuarioFormOpen, setUsuarioFormOpen] = useState(false);

  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedConductor, setSelectedConductor] = useState(null);
  const [selectedUsuario, setSelectedUsuario] = useState(null);

  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  // Hooks para datos de la API
  const {
    buses,
    loading: busesLoading,
    error: busesError,
    refetch: refetchBuses,
    create: createBus,
    update: updateBus,
    remove: removeBus
  } = useBuses();

  const {
    conductores,
    loading: conductoresLoading,
    error: conductoresError,
    refetch: refetchConductores,
    create: createConductor,
    update: updateConductor,
    remove: removeConductor
  } = useConductores();

  const {
    usuarios,
    loading: usuariosLoading,
    error: usuariosError,
    refetch: refetchUsuarios,
    create: createUsuario,
    update: updateUsuario,
    remove: removeUsuario
  } = useUsuarios();

  const {
    stats,
    loading: statsLoading,
    error: statsError,
    refetch: refetchStats
  } = useEstadisticas();

  // Componente para mostrar errores
  const ErrorMessage = ({ error, onRetry }) => {
    if (!error) return null;

    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex items-center">
          <AlertIcon className="w-5 h-5 text-red-600 mr-2" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">Error al cargar datos</h3>
            <p className="text-sm text-red-700 mt-1">{error.message}</p>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Reintentar
            </button>
          )}
        </div>
      </div>
    );
  };

  // Renderizar estado de bus
  const renderEstadoBus = (estado) => {
    const estados = {
      activo: { className: 'status-active', icon: CheckCircle, text: 'Activo' },
      inactivo: { className: 'status-inactive', icon: XCircle, text: 'Inactivo' },
      mantenimiento: { className: 'status-maintenance', icon: AlertTriangle, text: 'Mantenimiento' },
      fuera_servicio: { className: 'status-inactive', icon: XCircle, text: 'Fuera de Servicio' }
    };
    const config = estados[estado] || estados.inactivo;
    const Icon = config.icon;

    return (
      <span className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  // Formatear saldo en guaraníes
  const formatSaldo = (saldo) => {
    if (!saldo || saldo === '0') return 'Gs. 0';
    const numero = parseFloat(saldo);
    return `Gs. ${new Intl.NumberFormat('es-PY').format(numero)}`;
  };

  // Definición de columnas para las tablas (ADAPTADAS A TU ESQUEMA)
  const busColumns = [
    { key: 'bus_id', header: 'ID Bus' },
    { key: 'plate', header: 'Placa' },
    { key: 'route_name', header: 'Ruta' },
    { key: 'capacity', header: 'Capacidad' },
    { key: 'status', header: 'Estado', render: (status) => renderEstadoBus(status) },
    {
      key: 'route_color', header: 'Color', render: (color) => (
        <div className="flex items-center">
          <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: color }}></div>
          {color}
        </div>
      )
    }
  ];

  // COLUMNAS ADAPTADAS: Solo campos que existen en tu esquema Cassandra
  const conductorColumns = [
    { key: 'nombre', header: 'Nombre' },
    { key: 'licencia', header: 'Licencia' },
    { key: 'telefono', header: 'Teléfono' },
    { key: 'fecha_ingreso', header: 'F. Ingreso', render: (fecha) => fecha ? new Date(fecha).toLocaleDateString() : 'N/A' },
    { key: 'driver_id', header: 'ID', render: (id) => id ? id.substr(0, 8) + '...' : 'N/A' }
  ];

  // COLUMNAS ADAPTADAS: Solo campos que existen en tu esquema Cassandra
  const usuarioColumns = [
    { key: 'nombre', header: 'Nombre' },
    { key: 'email', header: 'Email' },
    { key: 'telefono', header: 'Teléfono' },
    { key: 'saldo', header: 'Saldo', render: (saldo) => formatSaldo(saldo) },
    { key: 'fecha_reg', header: 'F. Registro', render: (fecha) => fecha ? new Date(fecha).toLocaleDateString() : 'N/A' },
    { key: 'user_id', header: 'ID', render: (id) => id ? id.substr(0, 8) + '...' : 'N/A' }
  ];

  // Handlers para las acciones
  const handleAdd = (type) => {
    if (type === 'bus') {
      setSelectedBus(null);
      setBusFormOpen(true);
    } else if (type === 'conductor') {
      setSelectedConductor(null);
      setConductorFormOpen(true);
    } else if (type === 'usuario') {
      setSelectedUsuario(null);
      setUsuarioFormOpen(true);
    }
  };

  const handleEdit = (type, item) => {
    if (type === 'bus') {
      setSelectedBus(item);
      setBusFormOpen(true);
    } else if (type === 'conductor') {
      setSelectedConductor(item);
      setConductorFormOpen(true);
    } else if (type === 'usuario') {
      setSelectedUsuario(item);
      setUsuarioFormOpen(true);
    }
  };

  const handleDelete = async (type, item) => {
    const itemName = item.nombre || item.bus_id || item.route_name;
    if (window.confirm(`¿Estás seguro de eliminar este ${type}: ${itemName}?`)) {
      let result;

      if (type === 'bus') {
        result = await removeBus(item.bus_id);
      } else if (type === 'conductor') {
        result = await removeConductor(item.driver_id);
      } else if (type === 'usuario') {
        result = await removeUsuario(item.user_id);
      }

      if (result.success) {
        alert(`${type} eliminado correctamente`);
        // Refetch data
        if (type === 'bus') refetchBuses();
        else if (type === 'conductor') refetchConductores();
        else if (type === 'usuario') refetchUsuarios();
        refetchStats();
      } else {
        alert(`Error al eliminar ${type}: ${result.error.message}`);
      }
    }
  };

  const handleView = (type, item) => {
    const details = Object.entries(item)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    alert(`Detalles del ${type}:\n\n${details}`);
  };

  const handleSaveBus = async (busData) => {
    let result;

    if (selectedBus) {
      result = await updateBus(selectedBus.bus_id, busData);
    } else {
      result = await createBus(busData);
    }

    if (result.success) {
      setBusFormOpen(false);
      setSelectedBus(null);
      refetchBuses();
      refetchStats();
    } else {
      // El error se mostrará en el formulario
      console.error('Error al guardar bus:', result.error);
    }
  };

  const handleSaveConductor = async (conductorData) => {
    let result;

    if (selectedConductor) {
      result = await updateConductor(selectedConductor.driver_id, conductorData);
    } else {
      result = await createConductor(conductorData);
    }

    if (result.success) {
      setConductorFormOpen(false);
      setSelectedConductor(null);
      refetchConductores();
      refetchStats();
    } else {
      console.error('Error al guardar conductor:', result.error);
    }
  };

  const handleSaveUsuario = async (usuarioData) => {
    let result;

    if (selectedUsuario) {
      result = await updateUsuario(selectedUsuario.user_id, usuarioData);
    } else {
      result = await createUsuario(usuarioData);
    }

    if (result.success) {
      setUsuarioFormOpen(false);
      setSelectedUsuario(null);
      refetchUsuarios();
      refetchStats();
    } else {
      console.error('Error al guardar usuario:', result.error);
    }
  };

  const handleRefreshAll = () => {
    refetchBuses();
    refetchConductores();
    refetchUsuarios();
    refetchStats();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div>
            <ErrorMessage error={statsError} onRetry={refetchStats} />

            {/* Estadísticas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <StatsCard
                title="Total Buses"
                value={stats.totalBuses}
                subtitle={`${stats.busesActivos} activos`}
                icon={Bus}
                color="blue"
                loading={statsLoading}
              />
              <StatsCard
                title="Choferes"
                value={stats.totalConductores}
                subtitle="Registrados"
                icon={UserCheck}
                color="green"
                loading={statsLoading}
              />
              <StatsCard
                title="Usuarios"
                value={stats.totalUsuarios}
                subtitle="Con cuenta"
                icon={Users}
                color="purple"
                loading={statsLoading}
              />
              <StatsCard
                title="Viajes Hoy"
                value={stats.viajesHoy}
                subtitle="En progreso"
                icon={Activity}
                color="orange"
                loading={statsLoading}
              />
            </div>

            {/* Estadísticas adicionales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <StatsCard
                title="Recaudación Hoy"
                value={stats.recaudacionHoy}
                subtitle="Ingresos del día"
                icon={TrendingUp}
                color="green"
                prefix="Gs. "
                loading={statsLoading}
              />
              <StatsCard
                title="Promedio Pasajeros"
                value={stats.promedioPasajeros}
                subtitle="Por viaje"
                icon={Users}
                color="blue"
                loading={statsLoading}
              />
            </div>

            {/* Resumen de buses activos */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Buses Activos en Tiempo Real</h3>

              <ErrorMessage error={busesError} onRetry={refetchBuses} />

              {busesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Cargando buses...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(buses || []).filter(bus => bus.status === 'activo').map(bus => {
                    const conductor = (conductores || []).find(c => c.driver_id === bus.driver_id);
                    return (
                      <div key={bus.bus_id} className="p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-gray-900">{bus.bus_id}</span>
                          <span className="status-active">Activo</span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>🚌 {bus.route_name}</p>
                          <p>🔢 Placa: {bus.plate}</p>
                          <p>👥 Capacidad: {bus.capacity} pasajeros</p>
                          <p>👨‍💼 Chofer: {conductor ? conductor.nombre : 'Sin asignar'}</p>
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded mr-2" style={{ backgroundColor: bus.route_color }}></div>
                            <span>Color: {bus.route_color}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {(buses || []).filter(bus => bus.status === 'activo').length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      No hay buses activos en este momento
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 'buses':
        return (
          <div>
            <ErrorMessage error={busesError} onRetry={refetchBuses} />
            <DataTable
              title="Gestión de Buses"
              data={buses || []}
              columns={busColumns}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onAdd={() => handleAdd('bus')}
              onEdit={(item) => handleEdit('bus', item)}
              onDelete={(item) => handleDelete('bus', item)}
              onView={(item) => handleView('bus', item)}
              loading={busesLoading}
            />
          </div>
        );

      case 'conductores':
        return (
          <div>
            <ErrorMessage error={conductoresError} onRetry={refetchConductores} />
            <DataTable
              title="Gestión de Choferes"
              data={conductores || []}
              columns={conductorColumns}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onAdd={() => handleAdd('conductor')}
              onEdit={(item) => handleEdit('conductor', item)}
              onDelete={(item) => handleDelete('conductor', item)}
              onView={(item) => handleView('conductor', item)}
              loading={conductoresLoading}
            />
          </div>
        );

      case 'usuarios':
        return (
          <div>
            <ErrorMessage error={usuariosError} onRetry={refetchUsuarios} />
            <DataTable
              title="Gestión de Usuarios"
              data={usuarios || []}
              columns={usuarioColumns}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onAdd={() => handleAdd('usuario')}
              onEdit={(item) => handleEdit('usuario', item)}
              onDelete={(item) => handleDelete('usuario', item)}
              onView={(item) => handleView('usuario', item)}
              loading={usuariosLoading}
            />
          </div>
        );

      case 'mapa':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Mapa en Tiempo Real</h3>
              <div className="flex items-center space-x-2">
                <button className="btn-secondary">
                  <Settings className="w-4 h-4 mr-1" />
                  Configurar
                </button>
                <button className="btn-primary" onClick={handleRefreshAll}>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Actualizar
                </button>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg h-96 flex items-center justify-center flex-col border-2 border-dashed border-blue-200">
              <MapPin className="w-16 h-16 text-blue-400 mb-4" />
              <p className="text-xl text-blue-600 mb-2 font-semibold">Mapa Interactivo</p>
              <p className="text-sm text-blue-500 mb-4">Listo para integración con API de ubicaciones</p>
              <div className="flex space-x-2">
                <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-xs">GPS en tiempo real</span>
                <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-xs">Rutas dinámicas</span>
                <span className="px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-xs">Paradas activas</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: Activity },
    { id: 'buses', label: 'Buses', icon: Bus },
    { id: 'conductores', label: 'Choferes', icon: UserCheck },
    { id: 'usuarios', label: 'Usuarios', icon: Users },
    { id: 'mapa', label: 'Mapa', icon: MapPin }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Bus className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Sistema de Autobuses</h1>
              <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                Panel Administrativo
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{new Date().toLocaleString('es-PY')}</span>
              </div>
              <button
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={handleRefreshAll}
                title="Actualizar todos los datos"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-1 bg-white rounded-lg shadow-sm border border-gray-200 p-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        {renderContent()}
      </div>

      {/* Modales de formularios */}
      <BusForm
        isOpen={busFormOpen}
        onClose={() => {
          setBusFormOpen(false);
          setSelectedBus(null);
        }}
        bus={selectedBus}
        onSave={handleSaveBus}
        conductores={conductores || []}
      />

      <ConductorForm
        isOpen={conductorFormOpen}
        onClose={() => {
          setConductorFormOpen(false);
          setSelectedConductor(null);
        }}
        conductor={selectedConductor}
        onSave={handleSaveConductor}
      />

      <UsuarioForm
        isOpen={usuarioFormOpen}
        onClose={() => {
          setUsuarioFormOpen(false);
          setSelectedUsuario(null);
        }}
        usuario={selectedUsuario}
        onSave={handleSaveUsuario}
      />
    </div>
  );
};

export default AdminDashboard;