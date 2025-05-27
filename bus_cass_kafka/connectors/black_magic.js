require('dotenv').config();
const { Kafka } = require('kafkajs');
const cassandra = require('cassandra-driver');
const Uuid = cassandra.types.Uuid;

const kafka = new Kafka({
  brokers: process.env.KAFKA_BROKERS.split(','),
});

const consumer = kafka.consumer({ groupId: 'bus-ingestor' });

// Cassandra: configuración
const authProvider = new cassandra.auth.PlainTextAuthProvider(
  process.env.CASSANDRA_USERNAME,
  process.env.CASSANDRA_PASSWORD
);
const client = new cassandra.Client({
  contactPoints: process.env.CASSANDRA_CONTACT_POINTS.split(','),
  localDataCenter: process.env.CASSANDRA_LOCAL_DC,
  keyspace: process.env.CASSANDRA_KEYSPACE,
  authProvider,
});

// Función de reintento para ejecutar comandos en Cassandra
async function safeExecute(query, params = []) {
  for (let i = 0; i < 5; i++) {
    try {
      return await client.execute(query, params, { prepare: true });
    } catch (err) {
      console.warn(`Retry ${i} failed: ${err.message}`);
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw new Error('Failed to execute query after retries');
}

async function eachMessage({ topic, partition, message }) {
  try {
    const value = JSON.parse(message.value.toString());
    // Ejemplo de validación: para choferes se valida que driver_id sea un UUID válido
    if (topic === process.env.TOPIC_CHOFERES && !Uuid.isValid(value.driver_id)) {
      throw new Error(`Invalid UUID format: ${value.driver_id}`);
    }
    console.log(`Procesando mensaje en topic ${topic}`);
    // Aquí se pueden delegar funciones especializadas según el topic.
  } catch (error) {
    console.error(`[Error] Procesando mensaje en topic ${topic}:`, error.message);
  }
}

async function run() {
  await consumer.connect();
  await client.connect();

  // Lista de topics (se removió TOPIC_RECORRIDO, se agregó TOPIC_HORARIOS)
  const topics = [
    process.env.TOPIC_CHOFERES,
    process.env.TOPIC_USUARIOS,
    process.env.TOPIC_PARADAS,
    process.env.TOPIC_BUSES,
    process.env.TOPIC_PAGOS,
    process.env.TOPIC_HORARIOS,
    process.env.TOPIC_VIAJES,
  ];
  for (const t of topics) {
    await consumer.subscribe({ topic: t, fromBeginning: true });
  }

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const value = JSON.parse(message.value.toString());

      switch (topic) {
        // -------------------- CHOFERES --------------------
        case process.env.TOPIC_CHOFERES: {
          if (value.action && value.action.toLowerCase() === 'update') {
            let query = 'UPDATE choferes SET ';
            const params = [];
            if (value.nombre) {
              query += 'nombre = ?, ';
              params.push(value.nombre);
            }
            if (value.licencia) {
              query += 'licencia = ?, ';
              params.push(value.licencia);
            }
            if (value.telefono) {
              query += 'telefono = ?, ';
              params.push(value.telefono);
            }
            if (value.fecha_ingreso) {
              query += 'fecha_ingreso = ?, ';
              params.push(new Date(value.fecha_ingreso));
            }
            query = query.replace(/, $/, ' ') + ' WHERE driver_id = ?';
            params.push(cassandra.types.Uuid.fromString(value.driver_id));
            await safeExecute(query, params);
            console.log(`✍(◔◡◔) Chofer actualizado: ${value.driver_id}`);
          } else {
            const q = `
              INSERT INTO choferes (
                driver_id, nombre, licencia, telefono, fecha_ingreso
              ) VALUES (?, ?, ?, ?, ?)
            `;
            await safeExecute(q, [
              cassandra.types.Uuid.fromString(value.driver_id),
              value.nombre,
              value.licencia,
              value.telefono,
              new Date(value.fecha_ingreso),
            ]);
            console.log(`╰(*°▽°*)╯ Chofer insertado: ${value.driver_id}`);
          }
          break;
        }

        // -------------------- USUARIOS --------------------
        case process.env.TOPIC_USUARIOS: {
          if (value.action && value.action.toLowerCase() === 'update') {
            let query = 'UPDATE usuarios SET ';
            const params = [];
            if (value.nombre) {
              query += 'nombre = ?, ';
              params.push(value.nombre);
            }
            if (value.password) {
              query += 'password = ?, ';
              params.push(value.password);
            }
            if (value.email) {
              query += 'email = ?, ';
              params.push(value.email);
            }
            if (value.telefono) {
              query += 'telefono = ?, ';
              params.push(value.telefono);
            }
            if (value.fecha_reg) {
              query += 'fecha_reg = ?, ';
              params.push(new Date(value.fecha_reg));
            }
            if (value.saldo) {
              query += 'saldo = ?, ';
              params.push(value.saldo);
            }
            query = query.replace(/, $/, ' ') + ' WHERE user_id = ?';
            params.push(cassandra.types.Uuid.fromString(value.user_id));

            await safeExecute(query, params);
            console.log(`(*/ω＼*)(*/ω＼*) Usuario actualizado: ${value.user_id}`);
          } else {
            const q = `
              INSERT INTO usuarios (
                user_id, nombre, password, email, telefono, fecha_reg, saldo
              ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            await safeExecute(q, [
              cassandra.types.Uuid.fromString(value.user_id),
              value.nombre,
              value.password,
              value.email,
              value.telefono,
              new Date(value.fecha_reg),
              value.saldo || '0'
            ]);
            console.log(`(*/ω＼*)(*/ω＼*) Usuario insertado: ${value.user_id}`);
          }
          break;
        }

        // -------------------- PARADAS --------------------
        case process.env.TOPIC_PARADAS: {
          if (value.action && value.action.toLowerCase() === 'update') {
            let query = 'UPDATE paradas SET ';
            const params = [];
            if (value.nombre) {
              query += 'nombre = ?, ';
              params.push(value.nombre);
            }
            if (value.latitude !== undefined) {
              query += 'latitude = ?, ';
              params.push(value.latitude);
            }
            if (value.longitude !== undefined) {
              query += 'longitude = ?, ';
              params.push(value.longitude);
            }
            if (value.direccion) {
              query += 'direccion = ?, ';
              params.push(value.direccion);
            }
            if (value.precio) {
              query += 'precio = ?, ';
              params.push(value.precio);
            }
            query = query.replace(/, $/, ' ') + ' WHERE parada_id = ?';
            params.push(cassandra.types.Uuid.fromString(value.parada_id));
            await safeExecute(query, params);
            console.log(`O(∩_∩)O Parada actualizada: ${value.parada_id}`);
          } else {
            const q = `
              INSERT INTO paradas (
                parada_id, nombre, latitude, longitude, direccion, precio
              ) VALUES (?, ?, ?, ?, ?, ?)
            `;
            await safeExecute(q, [
              cassandra.types.Uuid.fromString(value.parada_id),
              value.nombre,
              value.latitude,
              value.longitude,
              value.direccion,
              value.precio
            ]);
            console.log(`O(∩_∩)O Parada insertada: ${value.parada_id}`);
          }
          break;
        }

        // -------------------- BUSES --------------------
        case process.env.TOPIC_BUSES: {
          if (value.action && value.action.toLowerCase() === 'update') {
            let query = 'UPDATE buses SET ';
            const params = [];
            if (value.plate) {
              query += 'plate = ?, ';
              params.push(value.plate);
            }
            if (value.route_id) {
              query += 'route_id = ?, ';
              params.push(value.route_id);
            }
            if (value.route_name) {
              query += 'route_name = ?, ';
              params.push(value.route_name);
            }
            if (value.route_color) {
              query += 'route_color = ?, ';
              params.push(value.route_color);
            }
            if (value.capacity) {
              query += 'capacity = ?, ';
              params.push(value.capacity);
            }
            if (value.status) {
              query += 'status = ?, ';
              params.push(value.status);
            }
            if (value.driver_id) {
              query += 'driver_id = ?, ';
              params.push(cassandra.types.Uuid.fromString(value.driver_id));
            }
            query = query.replace(/, $/, ' ') + ' WHERE bus_id = ?';
            params.push(value.bus_id);
            await safeExecute(query, params);
            console.log(`ψ(｀∇´)ψ Bus actualizado: ${value.bus_id}`);
          } else {
            const q = `
              INSERT INTO buses (
                bus_id, plate, route_id, route_name, route_color,
                capacity, status, driver_id
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            await safeExecute(q, [
              value.bus_id,
              value.plate,
              value.route_id,
              value.route_name,
              value.route_color,
              value.capacity,
              value.status,
              cassandra.types.Uuid.fromString(value.driver_id),
            ]);
            console.log(`ψ(｀∇´)ψ Bus insertado: ${value.bus_id}`);
          }
          break;
        }

        // -------------------- HISTORIAL DE PAGOS --------------------
        case process.env.TOPIC_PAGOS: {
          if (value.action && value.action.toLowerCase() === 'update') {
            let query = 'UPDATE historial_pagos SET ';
            const params = [];
            if (value.bus_id) {
              query += 'bus_id = ?, ';
              params.push(value.bus_id);
            }
            if (value.monto) {
              query += 'monto = ?, ';
              params.push(value.monto);
            }
            if (value.parada_ini) {
              query += 'parada_ini = ?, ';
              params.push(cassandra.types.Uuid.fromString(value.parada_ini));
            }
            if (value.parada_fin) {
              query += 'parada_fin = ?, ';
              params.push(cassandra.types.Uuid.fromString(value.parada_fin));
            }
            query = query.replace(/, $/, ' ') + ' WHERE user_id = ? AND fecha_hora = ? AND pago_id = ?';
            params.push(cassandra.types.Uuid.fromString(value.user_id));
            params.push(new Date(value.fecha_hora));
            // Asumimos que pago_id se recibe como string convertible a TimeUuid
            params.push(cassandra.types.TimeUuid.fromString(value.pago_id));
            await safeExecute(query, params);
            console.log(`φ(゜▽゜*)♪ Historial de pagos actualizado: ${value.pago_id}`);
          } else {
            const q = `
              INSERT INTO historial_pagos (
                user_id, fecha_hora, pago_id, bus_id,
                monto, parada_ini, parada_fin
              ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            await safeExecute(q, [
              cassandra.types.Uuid.fromString(value.user_id),
              new Date(value.fecha_hora),
              cassandra.types.TimeUuid.fromDate(new Date(value.fecha_hora)),
              value.bus_id,
              value.monto,
              cassandra.types.Uuid.fromString(value.parada_ini),
              cassandra.types.Uuid.fromString(value.parada_fin),
            ]);
            console.log(`φ(゜▽゜*)♪ Historial de pagos insertado: ${value.pago_id}`);
          }
          break;
        }

        // -------------------- HORARIOS --------------------
        case process.env.TOPIC_HORARIOS: {
          if (value.action && value.action.toLowerCase() === 'update') {
            let query = 'UPDATE horarios SET ';
            const params = [];
            if (value.parada_ini) {
              query += 'parada_ini = ?, ';
              params.push(cassandra.types.Uuid.fromString(value.parada_ini));
            }
            if (value.parada_fin) {
              query += 'parada_fin = ?, ';
              params.push(cassandra.types.Uuid.fromString(value.parada_fin));
            }
            if (value.horario_ini) {
              query += 'horario_ini = ?, ';
              params.push(value.horario_ini);
            }
            query = query.replace(/, $/, ' ') + ' WHERE horario_id = ? AND bus_id = ?';
            params.push(value.horario_id);
            params.push(cassandra.types.TimeUuid.fromString(value.bus_id));
            await safeExecute(query, params);
            console.log(`(⌐■_■) Horario actualizado: ${value.horario_id}`);
          } else {
            const q = `
              INSERT INTO horarios (
                horario_id, bus_id, parada_ini, parada_fin, horario_ini
              ) VALUES (?, ?, ?, ?, ?)
            `;
            await safeExecute(q, [
              value.horario_id,
              cassandra.types.TimeUuid.fromString(value.bus_id),
              cassandra.types.Uuid.fromString(value.parada_ini),
              cassandra.types.Uuid.fromString(value.parada_fin),
              value.horario_ini,
            ]);
            console.log(`(⌐■_■) Horario insertado: ${value.horario_id}`);
          }
          break;
        }

        // -------------------- VIAJES --------------------
        case process.env.TOPIC_VIAJES: {
          if (value.action && value.action.toLowerCase() === 'update') {
            let query = 'UPDATE viajes SET ';
            const params = [];
            if (value.cant_pasaj) {
              query += 'cant_pasaj = ?, ';
              params.push(value.cant_pasaj);
            }
            if (value.fecha_hora) {
              query += 'fecha_hora = ?, ';
              params.push(new Date(value.fecha_hora));
            }
            if (value.estado) {
              query += 'estado = ?, ';
              params.push(value.estado);
            }
            query = query.replace(/, $/, ' ') + ' WHERE horario_id = ? AND viaje_id = ?';
            params.push(value.horario_id);
            params.push(value.viaje_id);
            await safeExecute(query, params);
            console.log(`（￣︶￣）↗ Viaje actualizado: ${value.viaje_id}`);
          } else {
            const q = `
              INSERT INTO viajes (
                viaje_id, horario_id, cant_pasaj, fecha_hora, estado
              ) VALUES (?, ?, ?, ?, ?)
            `;
            await safeExecute(q, [
              value.viaje_id,
              value.horario_id,
              value.cant_pasaj,
              new Date(value.fecha_hora),
              value.estado,
            ]);
            console.log(`（￣︶￣）↗ Viaje insertado: ${value.viaje_id}`);
          }
          break;
        }

        default:
          console.warn(`Topic desconocido: ${topic}`);
      }
    }
  });

  console.log('(～￣▽￣)～ Ingestor corriendo …');
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

module.exports = { eachMessage };
