import axios from 'axios';

let store;

export const injectStore = s => {
  store = s;
};

export const Api = axios.create({
  baseURL: 'http://192.168.25.90:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

Api.interceptors.request.use(config => {
console.log("axios del serv", config.baseURL,config.url)
  return config;
});
