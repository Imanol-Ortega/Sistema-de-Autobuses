import { useState, useEffect, useCallback, useRef } from 'react';
import dataService from '../services/dataService';

// Hook genérico para operaciones CRUD con Cassandra
const useApiResource = (resourceService, options = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  
  const abortControllerRef = useRef(null);
  
  const {
    autoFetch = true,
    refreshInterval = null,
    retryAttempts = 3,
    retryDelay = 1000
  } = options;

  // Función para cancelar requests en curso
  const cancelPendingRequests = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
  }, []);

  // Función para reintentar operaciones
  const withRetry = useCallback(async (operation, attempts = retryAttempts) => {
    for (let i = 0; i < attempts; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === attempts - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)));
      }
    }
  }, [retryAttempts, retryDelay]);

  // Fetch inicial de datos
  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    
    try {
      cancelPendingRequests();
      
      const result = await withRetry(() => resourceService.getAll());
      
      if (result.success) {
        setData(result.data || []);
      } else {
        setError(result.error);
        console.error('Error fetching data:', result.error);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        const errorInfo = { message: err.message, status: -1 };
        setError(errorInfo);
        console.error('Fetch error:', err);
      }
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [resourceService, withRetry, cancelPendingRequests]);

  // Crear nuevo elemento
  const create = useCallback(async (itemData) => {
    setError(null);
    
    try {
      const result = await withRetry(() => resourceService.create(itemData));
      
      if (result.success) {
        // Actualizar datos locales
        setData(prevData => [...prevData, result.data]);
        return result;
      } else {
        setError(result.error);
        return result;
      }
    } catch (err) {
      const errorInfo = { message: err.message, status: -1 };
      setError(errorInfo);
      return { success: false, error: errorInfo };
    }
  }, [resourceService, withRetry]);

  // Actualizar elemento existente
  const update = useCallback(async (id, itemData) => {
    setError(null);
    
    try {
      const result = await withRetry(() => resourceService.update(id, itemData));
      
      if (result.success) {
        // Actualizar datos locales
        setData(prevData => 
          prevData.map(item => {
            // Buscar por diferentes campos ID dependiendo del tipo
            const itemId = item.bus_id || item.driver_id || item.user_id || item.id;
            return itemId === id ? { ...item, ...result.data } : item;
          })
        );
        return result;
      } else {
        setError(result.error);
        return result;
      }
    } catch (err) {
      const errorInfo = { message: err.message, status: -1 };
      setError(errorInfo);
      return { success: false, error: errorInfo };
    }
  }, [resourceService, withRetry]);

  // Eliminar elemento
  const remove = useCallback(async (id) => {
    setError(null);
    
    try {
      const result = await withRetry(() => resourceService.delete(id));
      
      if (result.success) {
        // Remover de datos locales
        setData(prevData => 
          prevData.filter(item => {
            const itemId = item.bus_id || item.driver_id || item.user_id || item.id;
            return itemId !== id;
          })
        );
        return result;
      } else {
        setError(result.error);
        return result;
      }
    } catch (err) {
      const errorInfo = { message: err.message, status: -1 };
      setError(errorInfo);
      return { success: false, error: errorInfo };
    }
  }, [resourceService, withRetry]);

  // Refetch manual
  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // Refetch silencioso (sin loading)
  const silentRefetch = useCallback(() => {
    return fetchData(false);
  }, [fetchData]);

  // Effect para fetch inicial
  useEffect(() => {
    if (autoFetch && !initialized) {
      fetchData();
    }
    
    return () => {
      cancelPendingRequests();
    };
  }, [autoFetch, initialized, fetchData, cancelPendingRequests]);

  // Effect para refresh automático
  useEffect(() => {
    if (refreshInterval && initialized) {
      const interval = setInterval(() => {
        silentRefetch();
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [refreshInterval, initialized, silentRefetch]);

  return {
    data,
    loading,
    error,
    initialized,
    create,
    update,
    remove,
    refetch,
    silentRefetch
  };
};

// Hook específico para Buses
export const useBuses = (options = {}) => {
  return useApiResource(dataService.bus, {
    refreshInterval: 30000, // Refresh cada 30 segundos
    ...options
  });
};

// Hook específico para Conductores
export const useConductores = (options = {}) => {
  return useApiResource(dataService.conductor, {
    refreshInterval: 60000, // Refresh cada minuto
    ...options
  });
};

// Hook específico para Usuarios
export const useUsuarios = (options = {}) => {
  return useApiResource(dataService.usuario, {
    refreshInterval: 120000, // Refresh cada 2 minutos
    ...options
  });
};

// Hook para Estadísticas con refresh frecuente
export const useEstadisticas = (options = {}) => {
  const [stats, setStats] = useState({
    totalBuses: 0,
    busesActivos: 0,
    totalConductores: 0,
    conductoresActivos: 0,
    totalUsuarios: 0,
    viajesHoy: 0,
    recaudacionHoy: 0,
    promedioPasajeros: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  
  const abortControllerRef = useRef(null);
  const {
    autoFetch = true,
    refreshInterval = 15000 // Refresh cada 15 segundos
  } = options;

  const fetchStats = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      
      const result = await dataService.estadisticas.getDashboard();
      
      if (result.success) {
        setStats(result.data);
      } else {
        setError(result.error);
        // Mantener datos anteriores en caso de error
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        const errorInfo = { message: err.message, status: -1 };
        setError(errorInfo);
      }
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, []);

  const refetch = useCallback(() => {
    return fetchStats(true);
  }, [fetchStats]);

  useEffect(() => {
    if (autoFetch && !initialized) {
      fetchStats();
    }
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [autoFetch, initialized, fetchStats]);

  useEffect(() => {
    if (refreshInterval && initialized) {
      const interval = setInterval(() => {
        fetchStats(false);
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [refreshInterval, initialized, fetchStats]);

  return {
    stats,
    loading,
    error,
    initialized,
    refetch
  };
};

// Hook para Historial con paginación de Cassandra
export const useHistorial = (type = 'recorridos', options = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pageState, setPageState] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [initialized, setInitialized] = useState(false);
  
  const {
    pageSize = 50,
    filters = {},
    autoFetch = true
  } = options;

  const fetchData = useCallback(async (params = {}, append = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = {
        pageSize,
        pageState: append ? pageState : null,
        ...filters,
        ...params
      };
      
      let result;
      if (type === 'recorridos') {
        result = await dataService.historial.getRecorridos(queryParams);
      } else if (type === 'pagos') {
        result = await dataService.historial.getPagos(queryParams);
      }
      
      if (result.success) {
        if (append) {
          setData(prevData => [...prevData, ...result.data]);
        } else {
          setData(result.data);
        }
        setPageState(result.pageState);
        setHasMore(result.hasMore);
      } else {
        setError(result.error);
      }
    } catch (err) {
      const errorInfo = { message: err.message, status: -1 };
      setError(errorInfo);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [type, pageSize, filters, pageState]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchData({}, true);
    }
  }, [fetchData, hasMore, loading]);

  const refetch = useCallback((newFilters = {}) => {
    setPageState(null);
    return fetchData(newFilters, false);
  }, [fetchData]);

  useEffect(() => {
    if (autoFetch && !initialized) {
      fetchData();
    }
  }, [autoFetch, initialized, fetchData]);

  return {
    data,
    loading,
    error,
    initialized,
    hasMore,
    loadMore,
    refetch
  };
};

// Hook para Paradas
export const useParadas = (options = {}) => {
  return useApiResource(dataService.parada, {
    refreshInterval: 300000, // Refresh cada 5 minutos
    ...options
  });
};

// Hook para Rutas
export const useRutas = (options = {}) => {
  return useApiResource(dataService.ruta, {
    refreshInterval: 300000, // Refresh cada 5 minutos
    ...options
  });
};

// Hook para test de conexión
export const useConnectionTest = () => {
  const [isConnected, setIsConnected] = useState(null);
  const [testing, setTesting] = useState(false);
  const [lastTest, setLastTest] = useState(null);

  const testConnection = useCallback(async () => {
    setTesting(true);
    
    try {
      const result = await dataService.utils.testConnection();
      setIsConnected(result.success);
      setLastTest(new Date());
      return result;
    } catch (err) {
      setIsConnected(false);
      setLastTest(new Date());
      return { success: false, error: err.message };
    } finally {
      setTesting(false);
    }
  }, []);

  useEffect(() => {
    // Test inicial
    testConnection();
    
    // Test periódico cada 5 minutos
    const interval = setInterval(testConnection, 300000);
    
    return () => clearInterval(interval);
  }, [testConnection]);

  return {
    isConnected,
    testing,
    lastTest,
    testConnection
  };
};

// Hook para manejo de errores global
export const useErrorHandler = () => {
  const [errors, setErrors] = useState([]);

  const addError = useCallback((error) => {
    const errorId = Date.now();
    const errorObj = {
      id: errorId,
      ...error,
      timestamp: new Date()
    };
    
    setErrors(prev => [...prev, errorObj]);
    
    // Auto-remover después de 10 segundos
    setTimeout(() => {
      setErrors(prev => prev.filter(e => e.id !== errorId));
    }, 10000);
  }, []);

  const removeError = useCallback((errorId) => {
    setErrors(prev => prev.filter(e => e.id !== errorId));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return {
    errors,
    addError,
    removeError,
    clearErrors
  };
};

// Exportar hooks principales
const apiHooks = {
  useBuses,
  useConductores,
  useUsuarios,
  useEstadisticas,
  useHistorial,
  useParadas,
  useRutas,
  useConnectionTest,
  useErrorHandler
};

export default apiHooks;