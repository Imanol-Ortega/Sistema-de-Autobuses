import React, { useState, useEffect } from 'react';
import { X, Bus, Save, AlertCircle, Check } from 'lucide-react';

const BusForm = ({ isOpen, onClose, bus = null, onSave, conductores = [] }) => {
  const [formData, setFormData] = useState({
    bus_id: '', plate: '', route_id: '', route_name: '', 
    route_color: '#3b82f6', capacity: 40, status: 'activo', driver_id: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (bus) {
      setFormData({
        bus_id: bus.bus_id || '', plate: bus.plate || '', route_id: bus.route_id || '',
        route_name: bus.route_name || '', route_color: bus.route_color || '#3b82f6',
        capacity: bus.capacity || 40, status: bus.status || 'activo', driver_id: bus.driver_id || ''
      });
    } else {
      setFormData({
        bus_id: '', plate: '', route_id: '', route_name: '', 
        route_color: '#3b82f6', capacity: 40, status: 'activo', driver_id: ''
      });
    }
    setErrors({});
    setSuccess(false);
  }, [bus, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.bus_id.trim()) newErrors.bus_id = 'ID del bus es obligatorio';
    if (!formData.plate.trim()) newErrors.plate = 'Placa es obligatoria';
    else if (!/^[A-Z]{3}-\d{3}$/.test(formData.plate)) newErrors.plate = 'Formato: ABC-123';
    if (!formData.route_name.trim()) newErrors.route_name = 'Nombre de ruta es obligatorio';
    if (formData.capacity < 10 || formData.capacity > 60) newErrors.capacity = 'Capacidad entre 10-60';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const busData = {
      ...formData,
      bus_id: formData.bus_id || `BUS_${Date.now()}`,
      created_at: bus ? bus.created_at : new Date().toISOString().split('T')[0],
      last_maintenance: bus ? bus.last_maintenance : new Date().toISOString().split('T')[0]
    };
    
    onSave(busData);
    setSuccess(true);
    
    setTimeout(() => {
      onClose();
      setSuccess(false);
    }, 1000);
    
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bus className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                {bus ? 'Editar Bus' : 'Nuevo Bus'}
              </h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <Check className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-700 font-medium">Bus guardado correctamente</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Información Básica
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID del Bus *</label>
                <input
                  type="text"
                  value={formData.bus_id}
                  onChange={(e) => setFormData({...formData, bus_id: e.target.value})}
                  placeholder="BUS_001"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.bus_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.bus_id && <p className="mt-1 text-sm text-red-600">{errors.bus_id}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Placa *</label>
                <input
                  type="text"
                  value={formData.plate}
                  onChange={(e) => setFormData({...formData, plate: e.target.value.toUpperCase()})}
                  placeholder="ABC-123"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.plate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.plate && <p className="mt-1 text-sm text-red-600">{errors.plate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID de Ruta</label>
                <input
                  type="text"
                  value={formData.route_id}
                  onChange={(e) => setFormData({...formData, route_id: e.target.value})}
                  placeholder="RUTA_A"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Ruta *</label>
                <input
                  type="text"
                  value={formData.route_name}
                  onChange={(e) => setFormData({...formData, route_name: e.target.value})}
                  placeholder="Centro - Terminal"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.route_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.route_name && <p className="mt-1 text-sm text-red-600">{errors.route_name}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Configuración
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color de Ruta</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={formData.route_color}
                    onChange={(e) => setFormData({...formData, route_color: e.target.value})}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.route_color}
                    onChange={(e) => setFormData({...formData, route_color: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad *</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
                  min="10"
                  max="60"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.capacity ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.capacity && <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="fuera_servicio">Fuera de Servicio</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conductor Asignado</label>
                <select
                  value={formData.driver_id}
                  onChange={(e) => setFormData({...formData, driver_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sin conductor asignado</option>
                  {conductores.filter(c => c.activo).map(conductor => (
                    <option key={conductor.driver_id} value={conductor.driver_id}>
                      {conductor.nombre} - {conductor.licencia}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
          <button onClick={onClose} className="btn-secondary" disabled={loading}>
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={loading || success} className="btn-primary">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {bus ? 'Actualizar' : 'Crear'} Bus
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusForm;