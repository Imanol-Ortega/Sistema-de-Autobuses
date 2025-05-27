import { Client } from 'cassandra-driver';

export const cassandraClient = new Client({
  contactPoints: ['127.0.0.1'],
  localDataCenter: 'dc1',
  keyspace: 'transit',
});

export const connectCassandra = async () => {
  try {
    await cassandraClient.connect();
    console.log('✅ Cassandra conectado');
  } catch (err) {
    console.error('❌ Error al conectar con Cassandra:', err);
  }
};
