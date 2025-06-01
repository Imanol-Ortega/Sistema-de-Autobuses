import { cassandraClient } from "../config/db/cassandra";

export interface Chofer {
  driver_id: string;
  nombre: string;
  licencia: string;
  telefono: string;
  fecha_ingreso: Date;
}

class ChoferesService {
  async getAllChoferes(): Promise<Chofer[]> {
    const query = 'SELECT * FROM transit.choferes';

    try {
      const result = await cassandraClient.execute(query);
      return result.rows.map(row => ({
        driver_id: row.driver_id,
        nombre: row.nombre,
        licencia: row.licencia,
        telefono: row.telefono,
        fecha_ingreso: row.fecha_ingreso,
      }));
    } catch (error) {
      console.error('Error obteniendo choferes:', error);
      throw error;
    }
  }
}

export const choferesService = new ChoferesService();
