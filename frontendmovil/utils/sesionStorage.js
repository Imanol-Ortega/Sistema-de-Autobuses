import AsyncStorage from '@react-native-async-storage/async-storage';
import { setUser as setUserRedux } from '../store/userSlice';

export const USER_KEY = 'SESSION_USER';
export const TOKEN_KEY = 'SESSION_TOKEN';

export const saveSession = async (user, token) => {
  try {
    if (!user || !token) {
      const response = await AsyncStorage.multiRemove([USER_KEY, TOKEN_KEY]);
      return;
    }
    await AsyncStorage.multiSet([
      [USER_KEY, JSON.stringify(user)],
      [TOKEN_KEY, token],
    ]);
  } catch (err) {
    console.log('Error al guardar sesión:', err);
  }
};

export const loadSession = async () => {
  try {
    const values = await AsyncStorage.multiGet([USER_KEY, TOKEN_KEY]);
    const user = values[0][1] ? JSON.parse(values[0][1]) : null;
    const token = values[1][1] || null;
    if (user && token) return { user, token };
  } catch (err) {
    console.log('Error al cargar sesión:', err);
  }
  return null;
};

export const clearSession = async () => {
  try {
    await AsyncStorage.multiRemove([USER_KEY, TOKEN_KEY]);
  } catch (err) {
    console.log('Error al limpiar sesión:', err);
  }
};

export const rehydrateSession = async dispatch => {
  const session = await loadSession();
  if (session?.user && session?.token) {
    dispatch(setUserRedux(session));
  }
};
