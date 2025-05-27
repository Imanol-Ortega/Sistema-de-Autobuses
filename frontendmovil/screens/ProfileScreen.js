import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../hooks/user';

export default function ProfileScreen({ navigation }) {
  const { user, logoutUser } = useUser();

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>👤 Perfil de Usuario</Text>
        <Text style={styles.valor}>No hay usuario conectado</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>👤 Perfil de Usuario</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Nombre</Text>
        <Text style={styles.valor}>{user.nombre}</Text>

        <Text style={styles.label}>Saldo</Text>
        <Text style={[styles.valor, { color: '#2e7d32' }]}>{user.saldo.toLocaleString()} ₲</Text>
      </View>

      <Text style={styles.subtitulo}>🚌 Viajes Realizados</Text>
      {/* <FlatList
        data={user.viajes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.viajeItem}>
            <Ionicons name="location-outline" size={20} color="#1976d2" />
            <Text style={styles.viajeTexto}>
              {item.destino} - {item.fecha}
            </Text>
          </View>
        )}
      /> */}

      <TouchableOpacity style={styles.botonCerrar} onPress={logoutUser}>
        <Ionicons name="log-out-outline" size={20} color="white" />
        <Text style={styles.botonTexto}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f0f4f8' },
  titulo: { fontSize: 26, fontWeight: 'bold', marginBottom: 20 },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  label: { fontSize: 14, color: '#777', marginTop: 10 },
  valor: { fontSize: 18, fontWeight: '600' },
  subtitulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  viajeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 8,
    padding: 10,
    borderRadius: 8,
    elevation: 1,
  },
  viajeTexto: { fontSize: 16, marginLeft: 8 },
  botonCerrar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d32f2f',
    padding: 12,
    borderRadius: 10,
    justifyContent: 'center',
    marginTop: 30,
  },
  botonTexto: {
    color: 'white',
    fontSize: 16,
    marginLeft: 6,
    fontWeight: 'bold',
  },
});
