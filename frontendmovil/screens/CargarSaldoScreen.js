import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function CargarSaldoScreen() {
    const [monto, setMonto] = useState('');

    const cargarSaldo = () => {
        const valor = parseInt(monto);
        if (!valor || valor <= 0) {
        Alert.alert('Monto inválido', 'Ingresa un valor mayor a 0');
        return;
        }

        // Lógica de carga de saldo aquí: API, actualización de contexto, etc.
        Alert.alert('✅ Saldo cargado', `Se ha cargado ₲${valor}`);
        setMonto('');
    };

return (
        <View style={styles.container}>
        <Text style={styles.titulo}>Cargar Saldo</Text>
        <TextInput
            style={styles.input}
            placeholder="Ingrese monto en ₲"
            keyboardType="numeric"
            value={monto}
            onChangeText={setMonto}
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
