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

  // async CargaSaldos(email: string, monto: number): Promise<any> {
  //   const query = `
  //     UPDATE transit.usuarios
  //     SET saldo = saldo + ?
  //     WHERE email = ?
  //   `;

  //   const params = [monto, email];

  //   try {
  //     await cassandraClient.execute(query, params, { prepare: true });
  //     console.log(`Saldo cargado correctamente para el usuario con correo: ${email}`);

  //     try{
  //         const query = `
  //         SELECT saldo from transit.usuarios
  //         WHERE email = ?`;
  //         const params = [email];
  //         const res = await cassandraClient.execute(query, params, { prepare: true });
  //         console.log(`Saldo actual del usuario con correo: ${res}`);
  //         return res
  //     }catch(error){
  //       console.error('Error en carga de saldo:', error);
  //       throw error;
  //     }
  //   } catch (error) {
  //     console.error('Error en carga de saldo:', error);
  //     throw error;
  //   }
  // }

// async CargaSaldos(monto: number, email: string): Promise<any> {
//   console.log("email: ",email, " monto: ", monto);
//   try {
//     if (typeof email !== 'string') {
//       throw new TypeError(`El email debe ser un string. Recibido: ${email}`);
//     }

//     const consultaSaldo = `
//       SELECT saldo FROM transit.usuarios
//       WHERE email = ?
//     `;
//     const resultadoSaldo = await cassandraClient.execute(consultaSaldo, [email], { prepare: true });

//     const saldoActual = resultadoSaldo.rows[0]?.saldo ?? 0;
//     const nuevoSaldo = saldoActual + monto;

//     const updateQuery = `
//       UPDATE transit.usuarios
//       SET saldo = ?
//       WHERE email = ?
//     `;
//     await cassandraClient.execute(updateQuery, [nuevoSaldo, email], { prepare: true });
//     console.log(`✅ Saldo actualizado correctamente para ${email}. Nuevo saldo: ${nuevoSaldo}`);

//     return { email, saldo: nuevoSaldo };

//   } catch (error) {
//     console.error('❌ Error en carga de saldo:', error);
//     throw error;
//   }
// }

// async CargaSaldos(monto: number, email: string): Promise<any> {
//   console.log("email: ", email, " monto: ", monto);

//   try {
//     if (typeof email !== 'string') {
//       throw new TypeError(`El email debe ser un string. Recibido: ${email}`);
//     }

//     // Paso 1: Buscar el user_id con ALLOW FILTERING
//     const buscarIdQuery = `
//       SELECT user_id FROM transit.usuarios
//       WHERE email = ?
//       ALLOW FILTERING
//     `;
//     const buscarRes = await cassandraClient.execute(buscarIdQuery, [email], { prepare: true });

//     if (buscarRes.rowLength === 0) {
//       throw new Error(`No se encontró usuario con email: ${email}`);
//     }

//     const userId = buscarRes.first().user_id;

//     // Paso 2: Obtener el saldo actual usando el user_id
//     const consultaSaldo = `
//       SELECT saldo FROM transit.usuarios
//       WHERE user_id = ?
//     `;
//     const resultadoSaldo = await cassandraClient.execute(consultaSaldo, [userId], { prepare: true });

//     const saldoActual = Number(resultadoSaldo.rows[0]?.saldo ?? 0);
//     const montoNum = Number(monto);
//     const nuevoSaldo = saldoActual + montoNum;

//     // Paso 3: Actualizar el saldo
//     const updateQuery = `
//       UPDATE transit.usuarios
//       SET saldo = ?
//       WHERE user_id = ?
//     `;
//     await cassandraClient.execute(updateQuery, [nuevoSaldo, userId], { prepare: true });

//     console.log(`✅ Saldo actualizado correctamente para ${email}. Nuevo saldo: ${nuevoSaldo}`);

//     return { email, saldo: nuevoSaldo };

//   } catch (error) {
//     console.error('❌ Error en carga de saldo:', error);
//     throw error;
//   }
// }

async CargaSaldos(monto: number, user_id: string): Promise<any> {
  console.log("user_id: ", user_id, " monto: ", monto);

  try {

    // Obtener el saldo actual
    const consultaSaldo = `
      SELECT saldo FROM transit.usuarios
      WHERE user_id = ?
    `;
    const resultadoSaldo = await cassandraClient.execute(consultaSaldo, [user_id], { prepare: true });

    // Convertir saldo de string a número
    const saldoActualString = resultadoSaldo.rows[0]?.saldo ?? "0";
    const saldoActual = parseFloat(saldoActualString);
    const nuevoSaldo = saldoActual + monto;

    // Actualizar el saldo (convertido nuevamente a string)
    const updateQuery = `
      UPDATE transit.usuarios
      SET saldo = ?
      WHERE user_id = ?
    `;
    await cassandraClient.execute(updateQuery, [String(nuevoSaldo), user_id], { prepare: true });

    console.log(`✅ Saldo actualizado correctamente. Nuevo saldo: ${nuevoSaldo}`);

    return { user_id, saldo: nuevoSaldo };

  } catch (error) {
    console.error('❌ Error en carga de saldo:', error);
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
