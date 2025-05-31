import { cassandraClient } from "../config/db/cassandra";
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { authConfig } from "../config/auth.config";


export interface CreateUserDto {
  nombre: string;
  email: string;
  password: string;
  user_id?: string;
  fecha_reg?: Date;
}

export interface User {
  user_id: string;
  nombre: string;
  email: string;
  password: string;
  saldo: string;
  fecha_reg: Date;
}

class UserService {
  async registerUser(data: CreateUserDto): Promise<{ user: Omit<CreateUserDto, 'password'> & { user_id: string; saldo: string; fecha_reg: Date }, token: string }> {
    const { nombre, email, password } = data;

    if (!nombre || !email || !password) {
      throw new Error('Nombre, email y password son requeridos');
    }

    const existing = await cassandraClient.execute('SELECT email FROM transit.usuarios WHERE email = ?', [email], { prepare: true });
    if (existing.rowLength > 0) throw new Error('El usuario ya existe');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user_id = uuidv4();
    const fecha_reg = new Date();
    const saldo = "0";

    const query = `
    INSERT INTO transit.usuarios (user_id, nombre, email, password, fecha_reg, saldo)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

    const params = [
      user_id,
      nombre,
      email,
      hashedPassword,
      fecha_reg.toISOString(),
      saldo,
    ];

    try {
      await cassandraClient.execute(query, params, { prepare: true });

      const user = { user_id, nombre, email, saldo, fecha_reg };

      const token = jwt.sign(
        { user_id, email },
        authConfig.jwtSecret,
        { expiresIn: '24h' }
      );

      return { user, token };
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    const query = 'SELECT * FROM transit.usuarios';

    try {
      const result = await cassandraClient.execute(query);
      return result.rows.map(row => ({
        user_id: row.user_id,
        nombre: row.nombre,
        email: row.email,
        password: row.password,
        saldo: row.saldo,
        fecha_reg: row.fecha_reg,
      }));
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      throw error;
    }
  }

  async CargaSaldos(email: string, monto: number): Promise<any> {
    const query = `
      UPDATE transit.usuarios
      SET saldo = saldo + ?
      WHERE email = ?
    `;

    const params = [monto, email];

    try {
      await cassandraClient.execute(query, params, { prepare: true });
      console.log(`Saldo cargado correctamente para el usuario con correo: ${email}`);

      try{
          const query = `
          SELECT saldo from transit.usuarios
          WHERE email = ?`;
          const params = [email];
          const res = await cassandraClient.execute(query, params, { prepare: true });
          console.log(`Saldo actual del usuario con correo: ${res}`);
          return res
      }catch(error){
        console.error('Error en carga de saldo:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error en carga de saldo:', error);
      throw error;
    }
  }

  async restaSaldos(email: string, monto: number): Promise<any> {
    const query = `
      UPDATE transit.usuarios
      SET saldo = saldo - ?
      WHERE email = ?
    `;

    const params = [monto, email];

    try {
      await cassandraClient.execute(query, params, { prepare: true });
      console.log(`Saldo restado correctamente para el usuario con correo: ${email}`);

      try{
          const query = `
          SELECT saldo from transit.usuarios
          WHERE email = ?`;
          const params = [email];
          const res = await cassandraClient.execute(query, params, { prepare: true });
          console.log(`Saldo actual del usuario con correo: ${res}`);
          return res
      }catch(error){
        console.error('Error en descuento de saldo:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error en descuento de saldo:', error);
      throw error;
    }
  }


  async loginUser(email: string, password: string): Promise<{ user: Omit<User, 'password'>; token: string } | null> {
    const query = 'SELECT * FROM transit.usuarios WHERE email = ?';
    const params = [email];

    try {
      const result = await cassandraClient.execute(query, params, { prepare: true });

      if (result.rowLength === 0) return null;

      const row = result.first();

      const isPasswordValid = await bcrypt.compare(password, row.password);
      if (!isPasswordValid) return null;

      const user: User = {
        user_id: row.user_id,
        nombre: row.nombre,
        email: row.email,
        password: row.password,
        saldo: row.saldo,
        fecha_reg: row.fecha_reg,
      };

      const token = jwt.sign(
        { user_id: user.user_id, email: user.email },
        authConfig.jwtSecret,
        { expiresIn: '24h' }
      );

      const { password: _, ...safeUser } = user;

      return { user: safeUser, token };
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
