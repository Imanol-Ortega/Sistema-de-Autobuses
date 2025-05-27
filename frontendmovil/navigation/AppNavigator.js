import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { navigationRef } from './navigationRef';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import TabNavigator from './TabNavigator';
import { useUser } from '../hooks/user';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user } = useUser();
  useEffect(() => {
    if (!user && navigationRef.isReady()) {
      navigationRef.navigate('Login');
    }

    if (user && navigationRef.isReady()) {
      navigationRef.navigate('Inicio');
    }
  }, [user]);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName={user ? 'Inicio' : 'Login'}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Inicio" component={TabNavigator} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
