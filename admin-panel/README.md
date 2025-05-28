# 🚌 Sistema de Gestión de Autobuses - Panel Administrativo

Panel de administración web desarrollado en React para la gestión integral de un sistema de transporte público. Diseñado para trabajar con una base de datos Cassandra y optimizado para el manejo de grandes volúmenes de datos en tiempo real.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [API Endpoints](#-api-endpoints)
- [Estructura de Datos](#-estructura-de-datos)
- [Desarrollo](#-desarrollo)
- [Despliegue](#-despliegue)

## ✨ Características

### 🎯 Funcionalidades Principales

- **Dashboard en Tiempo Real**: Estadísticas y métricas actualizadas automáticamente
- **Gestión de Buses**: CRUD completo con información de rutas, capacidad y estado
- **Gestión de Choferes**: Administración de conductores con licencias y datos de contacto
- **Gestión de Usuarios**: Control de usuarios del sistema con autenticación y saldos
- **Visualización de Mapas**: Interfaz preparada para integración GPS en tiempo real
- **Exportación de Datos**: Funcionalidad para generar reportes y exportar información

### 🚀 Características Técnicas

- **Optimizado para Cassandra**: Paginación, timeouts y manejo específico de NoSQL
- **Responsive Design**: Totalmente adaptable a dispositivos móviles y desktop
- **Tiempo Real**: Actualización automática de datos con intervalos configurables
- **Manejo de Errores**: Sistema robusto de recuperación ante fallos
- **Validaciones**: Validación completa de formularios y datos
- **Performance**: Carga lazy, paginación y optimizaciones de rendimiento

## 🛠 Tecnologías

### Frontend

- **React 19.1.0** - Framework principal
- **Tailwind CSS 3.3.5** - Framework de estilos
- **Lucide React 0.511.0** - Biblioteca de iconos
- **Axios 1.9.0** - Cliente HTTP para APIs
- **Recharts 2.15.3** - Gráficos y visualizaciones

### Herramientas de Desarrollo

- **React Scripts 5.0.1** - Herramientas de build
- **ESLint** - Linting y calidad de código
- **PostCSS & Autoprefixer** - Procesamiento CSS

### Base de Datos

- **Apache Cassandra** - Base de datos NoSQL distribuida
- **Docker** - Contenedorización de servicios

## 📁 Estructura del Proyecto

```
admin-panel/
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   │   ├── AdminDashboard.jsx    # Componente principal del dashboard
│   │   │   ├── StatsCard.jsx         # Tarjetas de estadísticas
│   │   │   ├── DataTable.jsx         # Tabla de datos reutilizable
│   │   │   └── Charts.jsx            # Componentes de gráficos
│   │   └── Forms/
│   │       ├── BusForm.jsx           # Formulario de buses
│   │       ├── ConductorForm.jsx     # Formulario de choferes
│   │       └── UsuarioForm.jsx       # Formulario de usuarios
│   ├── services/
│   │   ├── api.js                    # Configuración y endpoints de API
│   │   └── dataService.js            # Servicios de datos y lógica de negocio
│   ├── hooks/
│   │   └── useApi.js                 # Hooks personalizados para API
│   └── ...
├── public/
├── package.json
└── README.md
```

## 🚀 Instalación

### Prerrequisitos

- **Node.js** >= 14.0.0
- **npm** >= 6.0.0
- **Git**

### Pasos de Instalación

1. **Clonar el repositorio**

```bash
git clone https://github.com/tu-usuario/admin-panel-buses.git
cd admin-panel-buses
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

```bash
cp .env.example .env
```

4. **Iniciar la aplicación**

```bash
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## ⚙️ Configuración

### Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```bash
# URL de la API (OBLIGATORIO)
REACT_APP_API_URL=http://localhost:8080/api

# Configuraciones opcionales
REACT_APP_DEBUG_MODE=true
REACT_APP_API_TIMEOUT=15000
REACT_APP_REFRESH_INTERVAL=30000

# Para producción
# REACT_APP_API_URL=https://tu-servidor-produccion.com/api
# REACT_APP_DEBUG_MODE=false
```

### Configuración de API

El sistema está configurado para trabajar con los siguientes endpoints:

```
Base URL: http://localhost:8080/api

GET    /buses              # Obtener todos los buses
POST   /buses              # Crear nuevo bus
PUT    /buses/:id          # Actualizar bus
DELETE /buses/:id          # Eliminar bus

GET    /conductores        # Obtener todos los choferes
POST   /conductores        # Crear nuevo chofer
PUT    /conductores/:id    # Actualizar chofer
DELETE /conductores/:id    # Eliminar chofer

GET    /usuarios           # Obtener todos los usuarios
POST   /usuarios           # Crear nuevo usuario
PUT    /usuarios/:id       # Actualizar usuario
DELETE /usuarios/:id       # Eliminar usuario

GET    /estadisticas/dashboard  # Estadísticas del dashboard
```

## 🎮 Uso

### Dashboard Principal

- **Estadísticas en Tiempo Real**: Visualiza métricas clave del sistema
- **Buses Activos**: Monitorea el estado de la flota en tiempo real
- **Navegación por Pestañas**: Acceso rápido a diferentes secciones

### Gestión de Buses

- **Crear Bus**: Formulario completo con validaciones
- **Editar Bus**: Modificación de datos existentes
- **Estados**: Activo, Inactivo, Mantenimiento, Fuera de Servicio
- **Asignación de Choferes**: Vinculación con conductores disponibles

### Gestión de Choferes

- **Registro Completo**: Nombre, licencia, teléfono, fecha de ingreso
- **Validaciones**: Formato de teléfono paraguayo (0981-123456)
- **IDs Únicos**: Generación automática de UUIDs

### Gestión de Usuarios

- **Control de Acceso**: Gestión de credenciales y autenticación
- **Manejo de Saldos**: Control de montos en guaraníes
- **Seguridad**: Campos de password encriptados

## 🔌 API Endpoints

### Estructura de Respuesta Esperada

```json
{
  "data": [...],           // Datos principales
  "total": 100,            // Total de registros
  "page_state": "...",     // Para paginación de Cassandra
  "has_more": true         // Indica si hay más páginas
}
```

### Ejemplos de Payloads

**Bus:**

```json
{
  "bus_id": "BUS_001",
  "plate": "ABC-123",
  "route_id": "RUTA_A",
  "route_name": "Centro - Terminal",
  "route_color": "#3b82f6",
  "capacity": 40,
  "status": "activo",
  "driver_id": "uuid-del-chofer"
}
```

**Chofer:**

```json
{
  "driver_id": "uuid-generado",
  "nombre": "Juan Pérez",
  "licencia": "LIC-001234",
  "telefono": "0981-123456",
  "fecha_ingreso": "2024-01-15T00:00:00.000Z"
}
```

**Usuario:**

```json
{
  "user_id": "uuid-generado",
  "nombre": "María García",
  "password": "password-hasheado",
  "email": "maria@email.com",
  "telefono": "0985-654321",
  "fecha_reg": "2024-01-15T00:00:00.000Z",
  "saldo": "50000"
}
```

## 📊 Estructura de Datos

### Esquema de Cassandra

```sql
-- Tabla de choferes
CREATE TABLE IF NOT EXISTS transit.choferes (
  driver_id    uuid PRIMARY KEY,
  nombre       text,
  licencia     text,
  telefono     text,
  fecha_ingreso timestamp
);

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS transit.usuarios (
  user_id    uuid PRIMARY KEY,
  nombre     text,
  password   text,
  email      text,
  telefono   text,
  fecha_reg  timestamp,
  saldo      text
);

-- Tabla de buses
CREATE TABLE IF NOT EXISTS transit.buses (
  bus_id       text PRIMARY KEY,
  plate        text,
  route_id     text,
  route_name   text,
  route_color  text,
  capacity     int,
  status       text,
  driver_id    uuid
);

-- Índices
CREATE INDEX IF NOT EXISTS ON transit.usuarios (email);
```

## 🧑‍💻 Desarrollo

### Scripts Disponibles

```bash
# Iniciar en modo desarrollo
npm start

# Ejecutar tests
npm test

# Construir para producción
npm run build

# Analizar bundle
npm run build && npx serve -s build
```

### Estructura de Componentes

- **AdminDashboard**: Componente principal que maneja el estado global
- **DataTable**: Tabla reutilizable con paginación, búsqueda y acciones
- **Forms**: Formularios específicos con validaciones propias
- **StatsCard**: Componente para mostrar métricas

### Hooks Personalizados

- **useBuses**: Manejo de datos de buses con refresh automático
- **useConductores**: Gestión de choferes
- **useUsuarios**: Control de usuarios
- **useEstadisticas**: Estadísticas en tiempo real
- **useConnectionTest**: Monitoreo de conexión con API

## 🚀 Despliegue

### Build de Producción

```bash
# Generar build optimizado
npm run build

# El contenido estará en la carpeta 'build/'
```

### Variables de Entorno para Producción

```bash
REACT_APP_API_URL=https://tu-dominio-produccion.com/api
REACT_APP_DEBUG_MODE=false
REACT_APP_API_TIMEOUT=30000
```

### Estándares de Código

- **ESLint**: Seguir las reglas configuradas
- **Componentes**: Usar functional components con hooks
- **Naming**: camelCase para variables, PascalCase para componentes
- **Commits**: Usar conventional commits (feat:, fix:, docs:, etc.)
