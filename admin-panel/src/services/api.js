import axios from 'axios';

// Configuración base de la API para Cassandra en Docker
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.228.72:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000, 
});

api.interceptors.request.use(
  (config) => {
    // Aquí puedes agregar lógica antes de enviar la solicitud
    console.log('Enviando solicitud a:', config.baseURL,config.url);
    return config;
  }
)

// ========== BUSES API ==========
export const busesAPI = {
  getAll: async() => {
    const response = await api.get('/buses/get')
    return response;
  },
  
  getById: (id) => ()=>{},
  
  create: (busData) => {
    const payload = {
      bus_id: busData.bus_id || `bus_${Date.now()}`,
      plate: busData.plate,
      route_id: busData.route_id || null,
      route_name: busData.route_name,
      route_color: busData.route_color || '#3b82f6',
      capacity: parseInt(busData.capacity) || 40,
      status: busData.status || 'activo',
      driver_id: busData.driver_id || null,
      created_at: busData.created_at || new Date().toISOString(),
      last_maintenance: busData.last_maintenance || new Date().toISOString()
    };
    // return api.post('/buses', payload);
    return ()=>{}
  },
  
  // Actualizar bus
  update: (id, busData) => {
    const payload = {
      ...busData,
      capacity: parseInt(busData.capacity) || 40,
      updated_at: new Date().toISOString()
    };
    // return api.put(`/buses/${id}`, payload);
    return ()=>{}
  },
  
  // Eliminar bus (soft delete recomendado para Cassandra)
  // delete: (id) => api.delete(`/buses/${id}`),
  delete: (id)=>{},
  
  // Obtener buses por estado
  // getByStatus: (status) => api.get(`/buses`, { params: { status } }),
  getByStatus: (status) => {},

  // Obtener buses activos
  // getActive: () => api.get('/buses', { params: { status: 'activo' } }),
  getActive: () => {},
};

// ========== CONDUCTORES API ==========
export const conductoresAPI = {
  // Obtener todos los conductores
  getAll: () => api.get('/conductores'),
  
  // Obtener conductor por ID
  getById: (id) => api.get(`/conductores/${id}`),
  
  // Crear nuevo conductor
  create: (conductorData) => {
    const payload = {
      driver_id: conductorData.driver_id || `driver_${Date.now()}`,
      nombre: conductorData.nombre,
      licencia: conductorData.licencia,
      cedula: conductorData.cedula,
      telefono: conductorData.telefono,
      email: conductorData.email,
      fecha_ingreso: conductorData.fecha_ingreso || new Date().toISOString().split('T')[0],
      activo: conductorData.activo !== undefined ? conductorData.activo : true,
      created_at: new Date().toISOString()
    };
    return api.post('/conductores', payload);
  },
  
  // Actualizar conductor
  update: (id, conductorData) => {
    const payload = {
      ...conductorData,
      updated_at: new Date().toISOString()
    };
    return api.put(`/conductores/${id}`, payload);
  },
  
  // Eliminar conductor
  delete: (id) => api.delete(`/conductores/${id}`),
  
  // Obtener conductores activos
  getActive: () => api.get('/conductores', { params: { activo: true } }),
};

// ========== USUARIOS API ==========
export const usuariosAPI = {
  // Obtener todos los usuarios
  getAll: () => api.get('/usuarios'),
  
  // Obtener usuario por ID
  getById: (id) => api.get(`/usuarios/${id}`),
  
  // Crear nuevo usuario
  create: (usuarioData) => {
    const payload = {
      user_id: usuarioData.user_id || `user_${Date.now()}`,
      nombre: usuarioData.nombre,
      cedula: usuarioData.cedula,
      email: usuarioData.email,
      telefono: usuarioData.telefono,
      fecha_reg: usuarioData.fecha_reg || new Date().toISOString().split('T')[0],
      activo: usuarioData.activo !== undefined ? usuarioData.activo : true,
      total_viajes: usuarioData.total_viajes || 0,
      created_at: new Date().toISOString()
    };
    return api.post('/usuarios', payload);
  },
  
  // Actualizar usuario
  update: (id, usuarioData) => {
    const payload = {
      ...usuarioData,
      updated_at: new Date().toISOString()
    };
    return api.put(`/usuarios/${id}`, payload);
  },
  
  // Eliminar usuario
  delete: (id) => api.delete(`/usuarios/${id}`),
  
  // Obtener usuarios activos
  getActive: () => api.get('/usuarios', { params: { activo: true } }),
};

// ========== ESTADÍSTICAS API ==========
export const estadisticasAPI = {
  // Obtener estadísticas del dashboard
  getDashboard: () => api.get('/estadisticas/dashboard'),
  
  // Obtener estadísticas por fecha (usando formato ISO para Cassandra)
  getByDate: (fecha) => {
    const isoDate = fecha instanceof Date ? fecha.toISOString().split('T')[0] : fecha;
    return api.get(`/estadisticas/fecha/${isoDate}`);
  },
  
  // Obtener recaudación por rango de fechas
  getRecaudacion: (fechaInicio, fechaFin) => {
    const params = {
      inicio: fechaInicio instanceof Date ? fechaInicio.toISOString().split('T')[0] : fechaInicio,
      fin: fechaFin instanceof Date ? fechaFin.toISOString().split('T')[0] : fechaFin
    };
    return api.get('/estadisticas/recaudacion', { params });
  },
  
  // Obtener estadísticas en tiempo real
  getRealTime: () => api.get('/estadisticas/realtime'),
};

// ========== HISTORIAL API ==========
export const historialAPI = {
  // Obtener historial de recorridos con paginación para Cassandra
  getRecorridos: (params = {}) => {
    const queryParams = {
      page_size: params.pageSize || 100,
      page_state: params.pageState || null,
      fecha_inicio: params.fechaInicio || null,
      fecha_fin: params.fechaFin || null,
      bus_id: params.busId || null
    };
    
    // Limpiar parámetros nulos
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === null || queryParams[key] === undefined) {
        delete queryParams[key];
      }
    });
    
    return api.get('/historial/recorridos', { params: queryParams });
  },
  
  // Obtener historial de pagos
  getPagos: (params = {}) => {
    const queryParams = {
      page_size: params.pageSize || 100,
      page_state: params.pageState || null,
      fecha_inicio: params.fechaInicio || null,
      fecha_fin: params.fechaFin || null,
      user_id: params.userId || null
    };
    
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === null || queryParams[key] === undefined) {
        delete queryParams[key];
      }
    });
    
    return api.get('/historial/pagos', { params: queryParams });
  },
  
  // Obtener viajes por bus con rango de fechas
  getViajesByBus: (busId, fechaInicio, fechaFin) => {
    const params = {
      inicio: fechaInicio instanceof Date ? fechaInicio.toISOString().split('T')[0] : fechaInicio,
      fin: fechaFin instanceof Date ? fechaFin.toISOString().split('T')[0] : fechaFin
    };
    return api.get(`/historial/viajes/${busId}`, { params });
  },
};

// ========== PARADAS API ==========
export const paradasAPI = {
  // Obtener todas las paradas
  getAll: () => api.get('/paradas'),
  
  // Obtener parada por ID
  getById: (id) => api.get(`/paradas/${id}`),
  
  // Crear nueva parada
  create: (paradaData) => {
    const payload = {
      parada_id: paradaData.parada_id || `parada_${Date.now()}`,
      nombre: paradaData.nombre,
      latitud: parseFloat(paradaData.latitud) || 0,
      longitud: parseFloat(paradaData.longitud) || 0,
      activa: paradaData.activa !== undefined ? paradaData.activa : true,
      created_at: new Date().toISOString()
    };
    return api.post('/paradas', payload);
  },
  
  // Actualizar parada
  update: (id, paradaData) => {
    const payload = {
      ...paradaData,
      latitud: parseFloat(paradaData.latitud) || 0,
      longitud: parseFloat(paradaData.longitud) || 0,
      updated_at: new Date().toISOString()
    };
    return api.put(`/paradas/${id}`, payload);
  },
  
  // Eliminar parada
  delete: (id) => api.delete(`/paradas/${id}`),
  
  // Obtener paradas por ruta
  getByRoute: (routeId) => api.get(`/paradas`, { params: { route_id: routeId } }),
};

// ========== RUTAS API ==========
export const rutasAPI = {
  // Obtener todas las rutas
  getAll: () => api.get('/rutas'),
  
  // Obtener ruta por ID
  getById: (id) => api.get(`/rutas/${id}`),
  
  // Crear nueva ruta
  create: (rutaData) => {
    const payload = {
      route_id: rutaData.route_id || `route_${Date.now()}`,
      nombre: rutaData.nombre,
      color: rutaData.color || '#3b82f6',
      activa: rutaData.activa !== undefined ? rutaData.activa : true,
      created_at: new Date().toISOString()
    };
    return api.post('/rutas', payload);
  },
  
  // Actualizar ruta
  update: (id, rutaData) => {
    const payload = {
      ...rutaData,
      updated_at: new Date().toISOString()
    };
    return api.put(`/rutas/${id}`, payload);
  },
  
  // Eliminar ruta
  delete: (id) => api.delete(`/rutas/${id}`),
};

// ========== UTILIDADES PARA CASSANDRA ==========
export const handleApiError = (error) => {
  if (error.response) {
    // Error del servidor (4xx, 5xx)
    const message = error.response.data?.message || 
                   error.response.data?.error || 
                   `Error del servidor (${error.response.status})`;
    const status = error.response.status;
    
    // Errores específicos de Cassandra
    const cassandraErrors = {
      400: 'Datos inválidos para Cassandra',
      404: 'Registro no encontrado',
      409: 'Conflicto de datos (posible duplicado)',
      503: 'Servicio de Cassandra no disponible',
      timeout: 'Timeout de conexión con Cassandra'
    };
    
    const friendlyMessage = cassandraErrors[status] || message;
    
    console.error(`API Error ${status}:`, message);
    return { error: true, message: friendlyMessage, status, originalMessage: message };
  } else if (error.request) {
    // Error de red
    console.error('Network Error:', error.request);
    return { 
      error: true, 
      message: 'Error de conexión con el servidor', 
      status: 0,
      details: 'Verifique que el servidor de Cassandra esté ejecutándose'
    };
  } else {
    // Error de configuración
    console.error('Error:', error.message);
    return { error: true, message: error.message, status: -1 };
  }
};

/// Utilidad para manejar UUIDs de Cassandra
export const generateUUID = () => {
  // eslint-disable-next-line
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
};

// Utilidad para formatear fechas para Cassandra
export const formatDateForCassandra = (date) => {
  if (!date) return new Date().toISOString();
  if (date instanceof Date) return date.toISOString();
  return new Date(date).toISOString();
};

// Utilidad para parsear fechas de Cassandra
export const parseDateFromCassandra = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString);
};

export default api;