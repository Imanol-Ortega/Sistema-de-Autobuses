require('dotenv').config();
const { Kafka } = require('kafkajs');
const cassandra = require('cassandra-driver');

const kafka = new Kafka({
  brokers: [process.env.KAFKA_BROKER],
});

const admin = kafka.admin();
const consumer = kafka.consumer({
  groupId: 'bus-ingestor',
  retry: {
    retries: 10,
    initialRetryTime: 1000,
    maxRetryTime: 30000,
  },
});

const authProvider = new cassandra.auth.PlainTextAuthProvider('cassandra', 'cassandra');
const client = new cassandra.Client({
  contactPoints: [process.env.CASSANDRA_HOST],
  localDataCenter: process.env.CASSANDRA_DC,
  keyspace: 'transit',
  authProvider: authProvider,
  pooling: { coreConnectionsPerHost: { local: 2 } }
});

async function ensureTopics(topicsArray) {
  try {
    await admin.connect();
    const currentTopics = await admin.listTopics();
    
    for (const t of topicsArray) {
      if (!currentTopics.includes(t)) {
        const numPartitions = parseInt(process.env.KAFKA_NUM_PARTITIONS) || 3;
        const replicationFactor = parseInt(process.env.KAFKA_REPLICATION_FACTOR) || 1;
        
        try {
          const created = await admin.createTopics({
            topics: [{
              topic: t,
              numPartitions,
              replicationFactor
            }],
            waitForLeaders: true
          });
          
          if (created) {
            console.log(`(☞ﾟヮﾟ)☞ Topic ${t} creado`);
          } else {
            console.log(`¯\\_(ツ)_/¯ No se pudo confirmar la creación del topic ${t} (probablemente ya existe)`);
          }
        } catch (err) {
          console.error(`(┬┬﹏┬┬) Error al crear el topic ${t}: ${err.message}`);
        }
      } else {
        console.log(`ℹ Topic ${t} ya existe`);
      }
    }
  } finally {
    await admin.disconnect();
  }
}

async function safeExecute(query, params) {
  for (let i = 0; i < 5; i++) {
    try {
      return await client.execute(query, params, { prepare: true });
    } catch (err) {
      console.error(`Retry ${i} error:`, err.message);
      await new Promise(r => setTimeout(r, 1000 * 2 ** i));
    }
  }
  throw new Error('Insertion failed after retries');
}

async function run() {
  const topicMetadata = process.env.KAFKA_TOPIC_METADATA || 'bus-metadata';
  const topicLocation = process.env.KAFKA_TOPIC_LOCATION || 'bus-location';
  
  if (process.env.CREATE_TOPICS === 'true') {
    await ensureTopics([topicMetadata, topicLocation]);
  } else {
    console.log('Saltando creación de topics (CREATE_TOPICS no está en "true")');
  }
  
  await consumer.connect();
  await consumer.subscribe({ topic: topicMetadata, fromBeginning: false });
  await consumer.subscribe({ topic: topicLocation, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      try {
        const m = JSON.parse(message.value.toString());

        if (!m.ts || !m.busId) {
          console.error('(╯°□°）╯︵ ┻━┻ Mensaje incompleto recibido:', m);
          return;
        }
        
        if (topic === topicMetadata) {
          if (!m.plate || !m.routeId || !m.routeName || !m.routeColor || !m.capacity || !m.status) {
            console.error('(╯°□°）╯︵ ┻━┻ Mensaje incompleto para metadata:', m);
            return;
          }
          
          const metaQuery = `
            INSERT INTO bus_metadata 
              (bus_id, plate, route_id, route_name, route_color, capacity, status)
            VALUES 
              (?, ?, ?, ?, ?, ?, ?);
          `;
          await safeExecute(metaQuery, [
            m.busId, m.plate, m.routeId, m.routeName, m.routeColor, m.capacity, m.status
          ]);
          console.log(`╰(*°▽°*)╯ Metadata insertada para bus ${m.busId} at ${m.ts}`);
        } else if (topic === topicLocation) {
          if (!m.latitude || !m.longitude || !m.speed || !m.passengers) {
            console.error('(╯°□°）╯︵ ┻━┻ Mensaje incompleto para ubicación:', m);
            return;
          }
          const date = m.ts.slice(0, 10);
          const locQuery = `
            INSERT INTO bus_location 
              (bus_id, date, ts, latitude, longitude, speed, passengers)
            VALUES 
              (?, ?, ?, ?, ?, ?, ?);
          `;
          await safeExecute(locQuery, [
            m.busId, date, new Date(m.ts), m.latitude, m.longitude, m.speed, m.passengers
          ]);
          console.log(`╰(*°▽°*)╯ Ubicación insertada para bus ${m.busId} at ${m.ts}`);
        }
      } catch (err) {
        console.error('(┬┬﹏┬┬) Error al procesar mensaje:', err.message);
      }
    }
  });

  console.log('(^///^) Ingestor corriendo…');
}

run().catch(console.error);
