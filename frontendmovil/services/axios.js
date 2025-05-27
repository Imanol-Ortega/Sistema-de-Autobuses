import axios from 'axios';

let store;

export const injectStore = s => {
  store = s;
};

export const Api = axios.create({
  baseURL: 'http://192.168.100.5:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

Api.interceptors.request.use(config => {
  const state = store.getState();
  if (state.user.token && config.headers) {
    config.headers.Authorization = `Bearer ${state.auth.accessToken}`;
  }
  return config;
});
