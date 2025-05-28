import React, { useState, useEffect } from 'react';
import { X, Users, Save, Check, Eye, EyeOff } from 'lucide-react';

const UsuarioForm = ({ isOpen, onClose, usuario = null, onSave }) => {
  const [formData, setFormData] = useState({
    user_id: '', 
    nombre: '', 
    password: '',
    email: '', 
    telefono: '', 
    fecha_reg: new Date().toISOString().split('T')[0], 
    saldo: '0'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (usuario) {
      setFormData({
        user_id: usuario.user_id || '', 
        nombre: usuario.nombre || '', 
        password: '', // No mostrar password existente por seguridad
        email: usuario.email || '', 
        telefono: usuario.telefono || '',
        fecha_reg: usuario.fecha_reg ? new Date(usuario.fecha_reg).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        saldo: usuario.saldo || '0'
      });
    } else {
      setFormData({
        user_id: '', 
        nombre: '', 
        password: '',
        email: '', 
        telefono: '', 
        fecha_reg: new Date().toISOString().split('T')[0], 
        saldo: '0'
      });
    }
    setErrors({});
    setSuccess(false);
  }, [usuario, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'Nombre es obligatorio';
    if (!formData.email.trim()) newErrors.email = 'Email es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.telefono.trim()) newErrors.telefono = 'Teléfono es obligatorio';
    else if (!/^0\d{3}-\d{6}$/.test(formData.telefono)) newErrors.telefono = 'Formato: 0985-123456';
    
    // Validar password solo si es usuario nuevo o si se está cambiando
    if (!usuario || formData.password.trim()) {
      if (!formData.password.trim()) newErrors.password = 'Password es obligatorio';
      else if (formData.password.length < 6) newErrors.password = 'Password debe tener al menos 6 caracteres';
    }
    
    // Validar saldo
    if (formData.saldo && isNaN(parseFloat(formData.saldo))) {
      newErrors.saldo = 'Saldo debe ser un número válido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const usuarioData = {
      ...formData,
      user_id: formData.user_id || `${crypto.randomUUID()}`,
      saldo: formData.saldo.toString() // Asegurar que sea string como en Cassandra
    };
    
    // Si es edición y no se cambió el password, no enviarlo
    if (usuario && !formData.password.trim()) {
      delete usuarioData.password;
    }
    
    onSave(usuarioData);
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
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="w-6 h-6 text-purple-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                {usuario ? 'Editar Usuario' : 'Nuevo Usuario'}
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
              <span className="text-green-700 font-medium">Usuario guardado correctamente</span>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              Información del Usuario
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  placeholder="María Elena García"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    errors.nombre ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="usuario@email.com"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {usuario ? '(dejar vacío para mantener actual)' : '*'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder={usuario ? "Nueva contraseña (opcional)" : "Contraseña"}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                <input
                  type="text"
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  placeholder="0985-123456"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    errors.telefono ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.telefono && <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Registro *</label>
                <input
                  type="date"
                  value={formData.fecha_reg}
                  onChange={(e) => setFormData({...formData, fecha_reg: e.target.value})}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Saldo (Guaraníes)</label>
                <input
                  type="text"
                  value={formData.saldo}
                  onChange={(e) => setFormData({...formData, saldo: e.target.value})}
                  placeholder="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    errors.saldo ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.saldo && <p className="mt-1 text-sm text-red-600">{errors.saldo}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  Ejemplo: 50000 (para Gs. 50.000)
                </p>
              </div>
            </div>

            {/* Información sobre UUID (solo mostrar en modo edición) */}
            {usuario && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  <strong>ID del Usuario:</strong> {formData.user_id}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Este ID único se genera automáticamente y no puede ser modificado.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
          <button onClick={onClose} className="btn-secondary" disabled={loading}>
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={loading || success} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-all duration-200 flex items-center">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {usuario ? 'Actualizar' : 'Crear'} Usuario
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsuarioForm;