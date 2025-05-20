-- 1. Keyspace
CREATE KEYSPACE IF NOT EXISTS transit
  WITH replication = {'class': 'SimpleStrategy', 'replication_factor': '1'}
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
  email      text,
  telefono   text,            
  fecha_reg  timestamp
);

-- 4. Tabla de paradas
CREATE TABLE IF NOT EXISTS transit.paradas (
  parada_id  uuid PRIMARY KEY,
  nombre     text,
  latitude   double,
  longitude  double,
  direccion  text              
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

-- 7. Historial de recorrido real
CREATE TABLE IF NOT EXISTS transit.historial_recorrido_real (
  bus_id       text,
  recorrido_id timeuuid,
  ts           timestamp,
  latitude     double,
  longitude    double,
  parada_ini   uuid,
  parada_fin   uuid,
  PRIMARY KEY (bus_id, recorrido_id, ts)
) WITH CLUSTERING ORDER BY (recorrido_id ASC, ts ASC);

-- 8. Tabla de viajes
CREATE TABLE IF NOT EXISTS transit.viajes (
  bus_id     text,
  user_id    uuid,
  ts         timestamp,       
  viaje_id   timeuuid,
  parada_ini uuid,
  parada_fin uuid,
  cobro      decimal,
  PRIMARY KEY ((bus_id, user_id), ts, viaje_id)
) WITH CLUSTERING ORDER BY (ts DESC, viaje_id ASC);

