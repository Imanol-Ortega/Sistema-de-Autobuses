# 📱 Frontend Móvil - Sistema de Colectivos en Tiempo Real

Esta aplicación móvil, desarrollada con **React Native** y **Expo**, permite visualizar colectivos en tiempo real sobre un mapa, conectándose a un servidor mediante **WebSocket**.

---

## 🚀 Funcionalidades

- Mapa interactivo con OpenStreetMap.
- Visualización de colectivos en tiempo real con marcadores.
- Conexión WebSocket para recibir actualizaciones en vivo.

---

## 🛠️ Instalación

### 1. Instalación de dependencias

Desde la raíz del proyecto de frontend móvil:

```bash
npm install
```

### 2. Instalación de paquetes requeridos

```bash
npx expo install react-native-maps
npm install socket.io-client
```

### 3. Iniciar la aplicación

```bash
npx expo start
```

La app puede ejecutarse en:

- **Android**: con un emulador o dispositivo físico con Expo Go.
- **iOS**: con Expo Go o Xcode.
- **Web**: opcional (solo para vista previa básica).

---

## ⚙️ Configuración WebSocket

Editá el archivo `MapScreen.js` y cambiá la IP por la del servidor WebSocket:

```js
const socket = io("http://TU_IP_LOCAL:5000");
```

---

## 🧪 Formato de datos esperado desde el WebSocket

La app espera que el servidor emita eventos `bus-update` con el siguiente formato:

```json
{
  "bus_id": 1,
  "lat": -27.3311,
  "lon": -55.8662,
  "route_id": 5
}
```

---

## 🗺️ Mapas

La app utiliza OpenStreetMap como base:

- No requiere claves de API.
- Se renderiza mediante `react-native-maps` y `UrlTile`.

