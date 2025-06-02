import { createUser, loginUser } from './_requests';
import { Api } from './axios';

export const login = async (email, password) => {
  try {
    console.log('Intentando iniciar sesión con:', email);
    const response = await loginUser(email, password);
    if (response) {
      return { success: true, message: 'Inicio de sesión exitoso', response };
    } else {
      return { success: false, message: 'Credenciales incorrectas' };
    }
  } catch (error) {
    console.log(JSON.stringify(error, null, 2));

    return { success: false, message: 'Credenciales incorrectas' };
  }
};

export const register = async (nombre, email, password) => {
  try {
    const response = await createUser(nombre, password, email);
    if (response) {
      return { success: true, message: 'Usuario creado exitosamente', response };
    }
  } catch (error) {
    return { success: false, message: 'Credenciales incorrectas' };
  }
};

//export const getBuses = async () => {
//  try {
//    const response = await fetch('http://192.168.0.58:5000/api/buses');
//    const data = await response.json();
//    return data;
//  } catch (error) {
//    console.error('Error al obtener buses:', error);
//    return [];
//  }
//};
export const getBuses = async () => {
  try {
    const response = await Api.get('api/buses/get');
    console.log("data", response.data);
    return response.data; 
  } catch (error) {
    console.error("Error al obtener los buses:", error);
    throw error;
  }
};

export function getHorarios() {
  return [
    { id: 1, linea: '1A', hora: '06:30', destino: 'Terminal' },
    { id: 2, linea: '2B', hora: '07:15', destino: 'San Pedro' },
    { id: 3, linea: '3C', hora: '08:45', destino: 'Cambyretá' },
  ];
};
const cargarSaldo = async (monto, email) => {
  const valor = parseInt(monto);
 
  try {
    const response = await Api.post('/api/usuarios/CargaSaldo', {
      monto: valor,
      email: email, 
    });

    if (response.status === 200) {
      const { nuevoSaldo } = response.data;
      Alert.alert('✅ Saldo cargado', `Nuevo saldo: ₲${nuevoSaldo}`);
      setMonto('');
    } else {
      Alert.alert('❌ Error', 'No se pudo cargar el saldo.');
    }
  } catch (error) {
    console.error(error);
    Alert.alert('❌ Error de red', 'Verifica tu conexión o intenta de nuevo más tarde.');
  }
};

// export const pagarPasaje = async (userId, busId) => {
//   try {
//     const response = await Api.post('/api/usuarios/restaSaldo', {
//       user_id: userId,
//       monto: monto,
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Error al pagar pasaje:', error);
//     throw error;
//   }
// };
export const pagarPasaje = async (userId, busId) => {
  try {
    console.log("trae del front",userId,busId);
    const response = await Api.post('/api/usuarios/pagar', {
      user_id: userId,
      bus_id: busId
      // monto: 5000 // Si decides permitir que el cliente lo envíe
    });
    console.log("response pagar",response);
    return response.data;
  } catch (error) {
    console.error('Error al pagar pasaje:', error.response?.data || error.message);
    throw error;
  }
};

