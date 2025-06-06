import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Api } from "../services/axios";
import { useState } from "react";
import { useUser } from "../hooks/user";

export default function CargarSaldoScreen() {
  const {user}= useUser()
  const [saldo, setSaldo] = useState('');

  const cargarSaldo = async () => {
    const valor = parseInt(saldo);
    if (!valor || valor <= 0) {
      Alert.alert('Monto inválido', 'Ingresa un valor mayor a 0');
      return;
    }
    if (!user?.user_id) {
      Alert.alert('Error', 'No se encontró el usuario');
      return;
    }
    try {
      const response = await Api.post('/api/usuarios/cargaSaldo', { 
        monto: valor,
        user_id: user.user_id,
      });

      if (response.status === 200) {
        Alert.alert('✅ Saldo cargado', `Nuevo saldo: ₲${response.data.response.saldo}`);
        setSaldo('');
      } else {
        Alert.alert('❌ Error', 'No se pudo cargar el saldo.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error de red', 'Verifica tu conexión o intenta de nuevo más tarde.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo} >Cargar Saldo</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese monto en ₲"
        keyboardType="numeric"
        value={saldo}
        onChangeText={setSaldo}
      />
      <TouchableOpacity style={styles.boton} onPress={cargarSaldo}>
        <Text style={styles.botonTexto}>Confirmar carga</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#f0f4f8' },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  boton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  botonTexto: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});