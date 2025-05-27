import { Api } from './axios';

const USER_SERVER = '/api/usuarios';

export const createUser = async (nombre, password, email) => {
  return Api.post(`${USER_SERVER}/create`, {
    nombre,
    password,
    email,
  }).then(d => d.data);
};

export const loginUser = async (email, password) => {
  return Api.post(`${USER_SERVER}/login`, {
    email,
    password,
  }).then(d => {
    return d.data.response;
  });
};
