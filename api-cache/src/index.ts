
import { Server } from "./server"

const server = new Server();
server.init(() => {
  console.log(`Servidor corriendo en el puerto ${server.port}`);
});