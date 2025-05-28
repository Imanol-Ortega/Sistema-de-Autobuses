import React, { useState, useEffect } from 'react';
import { X, UserCheck, Save, Check } from 'lucide-react';

const ConductorForm = ({ isOpen, onClose, conductor = null, onSave }) => {
  const [formData, setFormData] = useState({
    driver_id: '', 
    nombre: '', 
    licencia: '', 
    telefono: '', 
    fecha_ingreso: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (conductor) {
      setFormData({
        driver_id: conductor.driver_id || '', 
        nombre: conductor.nombre || '', 
        licencia: conductor.licencia || '', 
        telefono: conductor.telefono || '',
        fecha_ingreso: conductor.fecha_ingreso ? 
          new Date(conductor.fecha_ingreso).toISOString().split('T')[0] : 
          new Date().toISOString().split('T')[0]
      });
    } else {
      setFormData({
        driver_id: '', 
        nombre: '', 
        licencia: '', 
        telefono: '', 
        fecha_ingreso: new Date().toISOString().split('T')[0]
      });
    }
    setErrors({});
    setSuccess(false);
  }, [conductor, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'Nombre es obligatorio';
    if (!formData.licencia.trim()) newErrors.licencia = 'Licencia es obligatoria';
    if (!formData.telefono.trim()) newErrors.telefono = 'Teléfono es obligatorio';
    else if (!/^0\d{3}-\d{6}$/.test(formData.telefono)) newErrors.telefono = 'Formato: 0981-123456';
    if (!formData.fecha_ingreso) newErrors.fecha_ingreso = 'Fecha de ingreso es obligatoria';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const conductorData = {
      ...formData,
      driver_id: formData.driver_id || `${crypto.randomUUID()}`
    };
    
    onSave(conductorData);
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <UserCheck className="w-6 h-6 text-green-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                {conductor ? 'Editar Chofer' : 'Nuevo Chofer'}
              </h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Mensaje de éxito */}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <Check className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-700 font-medium">Chofer guardado correctamente</span>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              Información del Chofer
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  placeholder="Juan Carlos Pérez"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.nombre ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número de Licencia *</label>
                <input
                  type="text"
                  value={formData.licencia}
                  onChange={(e) => setFormData({...formData, licencia: e.target.value})}
                  placeholder="LIC-001234"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.licencia ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.licencia && <p className="mt-1 text-sm text-red-600">{errors.licencia}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                <input
                  type="text"
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  placeholder="0981-123456"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.telefono ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.telefono && <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Ingreso *</label>
                <input
                  type="date"
                  value={formData.fecha_ingreso}
                  onChange={(e) => setFormData({...formData, fecha_ingreso: e.target.value})}
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.fecha_ingreso ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.fecha_ingreso && <p className="mt-1 text-sm text-red-600">{errors.fecha_ingreso}</p>}
              </div>
            </div>

            {/* Información sobre UUID (solo mostrar en modo edición) */}
            {conductor && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  <strong>ID del Chofer:</strong> {formData.driver_id}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Este ID único se genera automáticamente y no puede ser modificado.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
          <button onClick={onClose} className="btn-secondary" disabled={loading}>
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={loading || success} className="btn-success">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {conductor ? 'Actualizar' : 'Crear'} Chofer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConductorForm;