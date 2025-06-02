import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../service/axios';
import { useNavigate } from 'react-router-dom';

const Saldo = () => {
  const navigate = useNavigate();
  const { user: rawUser } = useAuth();
  const user = typeof rawUser === 'string' ? JSON.parse(rawUser) : rawUser;

  const [saldo, setSaldo] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [monto, setMonto] = useState('');
  const [errors, setErrors] = useState({ monto: '', general: '' });

  const fetchSaldo = async () => {
    try {
      const response = await api.get('usuarios/get');
      const users = response.data.response;
      const userData = users.find(u => u.user_id === user.user_id);

      console.log('userData:', userData);
      setSaldo(userData?.saldo || 0);

      if (!users) {
        throw new Error(response.data.error || 'Error al obtener saldo');
      }
    } catch (error) {
      console.error('Error al obtener saldo:', error);
      setErrors(prev => ({ ...prev, general: '❌ No se pudo obtener el saldo' }));
    }
  };

  const cargarSaldo = async () => {
    setErrors({ monto: '', general: '' });

    if (!monto || isNaN(monto) || parseFloat(monto) <= 0) {
      setErrors({ monto: 'Ingrese un monto válido', general: '' });
      return;
    }

    try {
      const response = await api.post('usuarios/cargaSaldo', {
        user_id: user.user_id,
        monto: parseFloat(monto),
      });

      if (!response.data.response) {
        throw new Error(response.data.error || 'Error al cargar saldo');
      }

      alert(✅ Carga exitosa. Nuevo saldo: ${response.data.response.saldo});
      setModalVisible(false);
      setMonto('');
      fetchSaldo();
    } catch (error) {
      console.error('Error al cargar saldo:', error);
      setErrors(prev => ({ ...prev, general: '❌ No se pudo cargar el saldo' }));
    }
  };

  useEffect(() => {
    fetchSaldo();
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.saldo}>Saldo actual: ${saldo}</h2>
      <div style={{ position: 'center', top: 20, left: 30, zIndex: 3000 }}>
        <button
          onClick={() => navigate('/home')}
          style={{
            background: 'gray',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 14px',
            cursor: 'pointer',
          }}
        >
          ← Volver
        </button>
      </div>

      <button onClick={() => setModalVisible(true)} style={styles.button}>Cargar saldo</button>

      {modalVisible && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>Cargar Saldo</h3>

            <label style={styles.label}>Monto a cargar</label>
            <input
              type="number"
              placeholder="Ingrese el monto"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              style={{
                ...styles.input,
                borderColor: errors.monto ? 'red' : '#ccc',
              }}
            />
            {errors.monto && <p style={styles.errorText}>{errors.monto}</p>}
            {errors.general && <p style={styles.errorText}>{errors.general}</p>}

            <div style={styles.modalButtons}>
              <button
                onClick={cargarSaldo}
                style={{ ...styles.modalButton, backgroundColor: '#28a745' }}
              >
                Cargar
              </button>
              <button
                onClick={() => {
                  setModalVisible(false);
                  setMonto('');
                  setErrors({ monto: '', general: '' });
                }}
                style={{ ...styles.modalButton, backgroundColor: '#dc3545' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Saldo;

const styles = {
  container: {
    maxWidth: 500,
    margin: 'auto',
    padding: 20,
    textAlign: 'center',
    position: 'relative',
  },
  saldo: {
    fontSize: '24px',
    marginBottom: '20px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  modalContent: {
    backgroundColor: '#1e1e2f', 
    color: '#ffffff', 
    padding: 20,
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    marginBottom: 10,
    fontSize: '18px',
  },
  label: {
    display: 'block',
    textAlign: 'left',
    marginTop: 10,
    fontWeight: 'bold',
    color: '#ffffff', 
  },
  input: {
    width: '100%',
    padding: '10px',
    marginTop: 4,
    borderRadius: 6,
    border: '1px solid #555',
    fontSize: '16px',
    backgroundColor: '#2c2c3e', 
    color: '#fff', 
  },
  errorText: {
    color: '#ff4d4d', 
    fontSize: '14px',
    marginTop: 4,
    textAlign: 'left',
  },
  modalButtons: {
    marginTop: 20,
    display: 'flex',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: '10px 20px',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
  },
};