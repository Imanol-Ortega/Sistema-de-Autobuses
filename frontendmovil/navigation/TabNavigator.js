import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import ProfileScreen from '../screens/ProfileScreen';


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
            else iconName = 'person';

            return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#007bff',
            tabBarInactiveTintColor: 'gray',
            headerShown: true,
        })}
        >
        <Tab.Screen name="Mapa" component={MapScreen} />
        <Tab.Screen name="Horarios" component={ScheduleScreen} />
        <Tab.Screen name="Perfil" component={ProfileScreen}/>
        </Tab.Navigator>
    );
}
