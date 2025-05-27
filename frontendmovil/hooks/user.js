import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUser as setUserRedux } from '../store/userSlice';
import { login, register } from '../services/api';
import { saveSession } from '../utils/sesionStorage';
import { useLoader } from './loader';

export const useUser = () => {
  const dispatch = useDispatch();
  const { endLoader, startLoader } = useLoader();
  const { user } = useSelector(state => state.user);
  const [error, setError] = React.useState(null);

  const createUser = async (nombre, email, password) => {
    startLoader();
    setError(null);
    try {
      const result = await register(nombre, email, password);
      if (result && result.response.user && result.response.token) {
        dispatch(setUserRedux({ user: result.response.user, token: result.response.token }));
        await saveSession(result.response.user, result.response.token);
      } else {
        setError(result.message);
      }
      return result;
    } catch (err) {
      setError('Error desconocido al crear usuario');
      return { success: false, message: 'Error desconocido' };
    } finally {
      endLoader();
    }
  };

  const loginUser = async (email, password) => {
    startLoader();
    setError(null);
    try {
      const result = await login(email, password);
      console.log('Resultado del login:', result);
      if (result.success && result.response.user && result.response.token) {
        dispatch(setUserRedux({ user: result.response.user, token: result.response.token }));
        await saveSession(result.response.user, result.response.token);
      } else {
        setError(result.message);
      }
      return result;
    } catch (err) {
      setError('Error desconocido al iniciar sesión');
      return { success: false, message: 'Error desconocido' };
    } finally {
      endLoader();
    }
  };

  const logoutUser = async () => {
    try {
      dispatch(setUserRedux({ user: null, token: null }));
      await saveSession(null, null);
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  return { user, createUser, loginUser, logoutUser };
};
