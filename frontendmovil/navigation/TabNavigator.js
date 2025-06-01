import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import ProfileScreen from '../screens/ProfileScreen';
import CargarSaldoScreen from '../screens/CargarSaldoScreen';

import MapScreen from '../screens/MapScreen';
import ScheduleScreen from '../screens/ScheduleScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
    return (
        <Tab.Navigator
            initialRouteName="Mapa"
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                let iconName;
                if (route.name === 'Mapa') iconName = 'map';
                else if (route.name === 'Horarios') iconName = 'time';
                else if (route.name === 'Perfil') iconName = 'person';
                else if (route.name === 'Cargar Saldo') iconName = 'wallet';

                return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#007bff',
                tabBarInactiveTintColor: 'gray',
                headerShown: true,
            })}
            >
            <Tab.Screen name="Mapa" component={MapScreen} />
            <Tab.Screen name="Horarios" component={ScheduleScreen} />
            <Tab.Screen name="Cargar Saldo" component={CargarSaldoScreen} />
            <Tab.Screen name="Perfil" component={ProfileScreen} />
        </Tab.Navigator>

    );
}
