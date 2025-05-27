import { Client } from 'cassandra-driver';

export const cassandraClient = new Client({
  contactPoints: ['cassandra'],
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
