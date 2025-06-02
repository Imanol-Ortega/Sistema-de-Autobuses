import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Saldo = () => {
  const { user } = useContext(AuthContext);
  const [saldo, setSaldo] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [monto, setMonto] = useState('');
  const [errors, setErrors] = useState({ monto: '', general: '' });

  const fetchSaldo = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/usuarios/get/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.user_id }),
      });

      if (!response.ok) throw new Error('No se pudo obtener el saldo');

      const data = await response.json();
      setSaldo(data.saldo);
    } catch (error) {
      console.error('Error al obtener el saldo:', error);
      alert('❌ No se pudo obtener el saldo');
    }
  };

  const cargarSaldo = async () => {
    if (!monto || isNaN(monto) || parseFloat(monto) <= 0) {
      setErrors({ monto: 'Ingrese un monto válido', general: '' });
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/usuarios/cargaSaldo/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monto: parseFloat(monto),
          user_id: user.id,
        }),
      });

      if (!response.ok) throw new Error('No se pudo cargar el saldo');

      const data = await response.json();
      alert(`✅ Carga exitosa. Nuevo saldo: ${data.saldo}`);
      setModalVisible(false);
      setMonto('');
      setErrors({ monto: '', general: '' });
      fetchSaldo();
    } catch (error) {
      console.error('Error al cargar saldo:', error);
      setErrors({ ...errors, general: 'No se pudo realizar la carga de saldo' });
    }
  };

  useEffect(() => {
    fetchSaldo();
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.saldo}>Saldo actual: ${saldo}</h2>
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
              onChange={(e) => {
                setMonto(e.target.value);
                setErrors({ ...errors, monto: '' });
              }}
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
  },
  modalContent: {
    backgroundColor: '#fff',
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
  },
  input: {
    width: '100%',
    padding: '10px',
    marginTop: 4,
    borderRadius: 6,
    border: '1px solid #ccc',
    fontSize: '16px',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    color: 'red',
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
