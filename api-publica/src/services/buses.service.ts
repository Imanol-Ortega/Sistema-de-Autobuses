import { cassandraClient } from "../config/db/cassandra";

export interface Bus {
  bus_id: string;
  plate: string;
  route_id: string;
  route_name: string;
  route_color: string;
  capacity: number;
  status: string;
  driver_id: string;
}

class BusesService {
  async getAllBuses(): Promise<Bus[]> {
    const query = 'SELECT * FROM transit.buses';

    try {
      const result = await cassandraClient.execute(query);
      return result.rows.map(row => ({
        bus_id: row.bus_id,
        plate: row.plate,
        route_id: row.route_id,
        route_name: row.route_name,
        route_color: row.route_color,
        capacity: row.capacity,
        status: row.status,
        driver_id: row.driver_id,
      }));
    } catch (error) {
      console.error('Error obteniendo buses:', error);
      throw error;
    }
  }
}

export const busesService = new BusesService();
