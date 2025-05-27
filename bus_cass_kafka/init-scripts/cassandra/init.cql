-- 1. Keyspace
CREATE KEYSPACE IF NOT EXISTS transit
  WITH replication = {
    'class': 'NetworkTopologyStrategy',
    'dc1': 2
  }
  AND durable_writes = true;

-- 2. Tabla de choferes
CREATE TABLE IF NOT EXISTS transit.choferes (
  driver_id    uuid PRIMARY KEY,
  nombre       text,
  licencia     text,
  telefono     text,          
  fecha_ingreso timestamp
);

-- 3. Tabla de usuarios
CREATE TABLE IF NOT EXISTS transit.usuarios (
  user_id    uuid PRIMARY KEY,
  nombre     text,
  password   text,
  email      text,
  telefono   text,            
  fecha_reg  timestamp,
  saldo      text
);

-- 4. Tabla de paradas
CREATE TABLE IF NOT EXISTS transit.paradas (
  parada_id  uuid PRIMARY KEY,
  nombre     text,
  latitude   double,
  longitude  double,
  direccion  text,
  precio     decimal
);

-- 5. Tabla de buses
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

-- 6. Historial de pagos
CREATE TABLE IF NOT EXISTS transit.historial_pagos (
  user_id     uuid,
  fecha_hora  timestamp,
  pago_id     timeuuid,
  bus_id      text,
  monto       decimal,
  parada_ini  uuid,
  parada_fin  uuid,
  PRIMARY KEY (user_id, fecha_hora, pago_id)
) WITH CLUSTERING ORDER BY (fecha_hora DESC, pago_id ASC);

-- 7. Horarios
CREATE TABLE IF NOT EXISTS transit.horarios (
  horario_id   text,
  bus_id       timeuuid,
  parada_ini   uuid,
  parada_fin   uuid,
  horario_ini  text,
  PRIMARY KEY (horario_id, bus_id)
) WITH CLUSTERING ORDER BY (bus_id ASC);

-- 8. Tabla de viajes
CREATE TABLE IF NOT EXISTS transit.viajes (
  viaje_id   text,
  horario_id text,
  cant_pasaj text,       
  fecha_hora timestamp,
  estado text,
  PRIMARY KEY ((horario_id), viaje_id)
) WITH CLUSTERING ORDER BY (viaje_id ASC);

