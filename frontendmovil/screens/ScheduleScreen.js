import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getHorarios } from '../services/api';

export default function ScheduleScreen() {
    const horarios = getHorarios(); // Datos simulados

return (
        <View style={styles.container}>
        <Text style={styles.title}>🚌 Horarios de Colectivos</Text>

        <FlatList
            data={horarios}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
            <View style={styles.item}>
                <Text style={styles.linea}>Línea {item.linea}</Text>
                <Text style={styles.horaDestino}>
                🕒 {item.hora} - {item.destino}
                </Text>
            </View>
            )}
        />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f7f9fc',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
        color: '#2e3a59',
    },
    item: {
        backgroundColor: '#ffffff',
        padding: 18,
        borderRadius: 12,
        marginVertical: 6,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
    },
    linea: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1976d2',
        marginBottom: 6,
    },
    horaDestino: {
        fontSize: 16,
        color: '#444',
    },
});
