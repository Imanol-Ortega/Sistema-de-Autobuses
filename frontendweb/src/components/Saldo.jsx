
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  Modal,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const Saldo = () => {
  const { user } = useAuth();
  const [saldo, setSaldo] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [monto, setMonto] = useState('');
  const [errors, setErrors] = useState({ monto: '', general: '' });

  const fetchSaldo = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/get/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.user_id }),
      });

      if (!response.ok) throw new Error('No se pudo obtener el saldo');

      const data = await response.json();
      setSaldo(data.saldo);
    } catch (error) {
      console.error('Error al obtener el saldo:', error);
      Alert.alert('❌ Error', 'No se pudo obtener el saldo');
    }
  };

  const cargarSaldo = async () => {
    if (!monto || isNaN(monto) || parseFloat(monto) <= 0) {
      setErrors({ monto: 'Ingrese un monto válido', general: '' });
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/cargaSaldo/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monto: parseFloat(monto),
          user_id: user.id,
        }),
      });

      if (!response.ok) throw new Error('No se pudo cargar el saldo');

      const data = await response.json();
      Alert.alert('✅ Carga exitosa', `Nuevo saldo: ${data.saldo}`);
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
    <View style={styles.container}>
      <Text style={styles.saldo}>Saldo actual: ${saldo}</Text>
      <Button title="Cargar saldo" onPress={() => setModalVisible(true)} />

      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setErrors({ monto: '', general: '' });
          setMonto('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cargar Saldo</Text>

            <Text style={styles.label}>Monto a cargar</Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: errors.monto ? 'red' : '#ccc' },
              ]}
              placeholder="Ingrese el monto"
              value={monto}
              onChangeText={(text) => {
                setMonto(text);
                setErrors({ ...errors, monto: '' });
              }}
              keyboardType="numeric"
            />
            {errors.monto ? <Text style={styles.errorText}>{errors.monto}</Text> : null}
            {errors.general ? <Text style={styles.errorText}>{errors.general}</Text> : null}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#28a745' }]}
                onPress={cargarSaldo}
              >
                <Text style={styles.modalButtonText}>Cargar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#dc3545' }]}
                onPress={() => {
                  setModalVisible(false);
                  setErrors({ monto: '', general: '' });
                  setMonto('');
                }}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Saldo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  saldo: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  label: {
    marginTop: 10,
    marginBottom: 4,
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
    color: '#000',
    fontSize: 16,
  },
  errorText: {
    marginTop: 4,
    color: 'red',
    fontSize: 12,
    fontWeight: '500',
  },
  modalButtons: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});
