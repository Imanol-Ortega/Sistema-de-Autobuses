require('dotenv').config();
const { Kafka } = require('kafkajs');
const cassandra = require('cassandra-driver');
const Uuid = cassandra.types.Uuid;

const kafka = new Kafka({
  brokers: process.env.KAFKA_BROKERS.split(','),
});

const consumer = kafka.consumer({ groupId: 'bus-ingestor' });

//Cassandra
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

//retry  cass
async function safeExecute(query, params = []) {
  for (let i = 0; i < 5; i++) {
    try {
      return await client.execute(query, params, { prepare: true });
    } catch (err) {
      console.warn(`Retry ${i} failed: ${err.message}`);
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw new Error('Failed to execute query after retries');
}

async function eachMessage({ topic, partition, message }) {
  try {
    const value = JSON.parse(message.value.toString());
    const driverId = value.driver_id;

    // Validar el formato del UUID
    if (!Uuid.isValid(driverId)) {
      throw new Error(`Invalid UUID format: ${driverId}`);
    }

    const uuid = Uuid.fromString(driverId);

    // Procesar el mensaje (ejemplo)
    console.log(`Procesando mensaje para driver_id: ${uuid}`);
    // ... lógica para insertar en Cassandra ...
  } catch (error) {
    console.error(`[Error] Procesando mensaje en topic ${topic}:`, error.message);
  }
}

async function run() {
  await consumer.connect();
  await client.connect();
  const topics = [
    process.env.TOPIC_CHOFERES,
    process.env.TOPIC_USUARIOS,
    process.env.TOPIC_PARADAS,
    process.env.TOPIC_BUSES,
    process.env.TOPIC_PAGOS,
    process.env.TOPIC_RECORRIDO,
    process.env.TOPIC_VIAJES,
  ];
  for (const t of topics) {
    await consumer.subscribe({ topic: t, fromBeginning: true });
  }

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const value = JSON.parse(message.value.toString());

      switch (topic) {
        case process.env.TOPIC_CHOFERES: {
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
          console.log(`╰(*°▽°*)╯╰(*°▽°*)╯ choferes guardados: ${value.driver_id}`);
          break;
        }

        case process.env.TOPIC_USUARIOS: {
          const q = `
            INSERT INTO usuarios (
              user_id, nombre, email, telefono, fecha_reg
            ) VALUES (?, ?, ?, ?, ?)
          `;
          await safeExecute(q, [
            cassandra.types.Uuid.fromString(value.user_id),
            value.nombre,
            value.email,
            value.telefono,
            new Date(value.fecha_reg),
          ]);
          console.log(`(*/ω＼*)(*/ω＼*) usuarios guardados: ${value.user_id}`);
          break;
        }

        case process.env.TOPIC_PARADAS: {
          const q = `
            INSERT INTO paradas (
              parada_id, nombre, latitude, longitude, direccion
            ) VALUES (?, ?, ?, ?, ?)
          `;
          await safeExecute(q, [
            cassandra.types.Uuid.fromString(value.parada_id),
            value.nombre,
            value.latitude,
            value.longitude,
            value.direccion,
          ]);
          console.log(`O(∩_∩)O O(∩_∩)O paradas guardadas: ${value.parada_id}`);
          break;
        }

        case process.env.TOPIC_BUSES: {
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
          console.log(`ψ(｀∇´)ψ ψ(｀∇´)ψ buses guardados: ${value.bus_id}`);
          break;
        }

        case process.env.TOPIC_PAGOS: {
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
          console.log(`φ(゜▽゜*)♪ φ(゜▽゜*)♪ historial_pagos guardados: ${value.pago_id}`);
          break;
        }

        case process.env.TOPIC_RECORRIDO: {
          const q = `
            INSERT INTO historial_recorrido_real (
              bus_id, recorrido_id, ts,
              latitude, longitude, parada_ini, parada_fin
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
          `;
          await safeExecute(q, [
            value.bus_id,
            cassandra.types.TimeUuid.fromDate(new Date(value.ts)),
            new Date(value.ts),
            value.latitude,
            value.longitude,
            cassandra.types.Uuid.fromString(value.parada_ini),
            cassandra.types.Uuid.fromString(value.parada_fin),
          ]);
          console.log(`(✿◡‿◡)(✿◡‿◡) recorrido guardados: ${value.recorrido_id}`);
          break;
        }

        case process.env.TOPIC_VIAJES: {
          const q = `
            INSERT INTO viajes (
              bus_id, user_id, ts, viaje_id,
              parada_ini, parada_fin, cobro
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
          `;
          await safeExecute(q, [
            value.bus_id,
            cassandra.types.Uuid.fromString(value.user_id),
            new Date(value.ts),
            cassandra.types.TimeUuid.fromDate(new Date(value.ts)),
            cassandra.types.Uuid.fromString(value.parada_ini),
            cassandra.types.Uuid.fromString(value.parada_fin),
            value.cobro,
          ]);
          console.log(`（￣︶￣）↗　（￣︶￣）↗　 viajes guardados: ${value.viaje_id}`);
          break;
        }

        default:
          console.warn(`（＾∀＾●）ﾉｼ（＾∀＾●）ﾉｼ  Topic desconocido: ${topic}`);
      }
    }
  });

  console.log('(～￣▽￣)～(～￣▽￣)～ Ingestor corriendo …');
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

module.exports = { eachMessage };
