import http from "http";
import app from "./app";
import { initSocket } from "./realtime/socket";
import connectDB from "../src/config/db"

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const server = http.createServer(app);

// Initialize websockets
initSocket(server);
connectDB();

server.listen(PORT, () => {
  console.log(`BiteBuddy API listening on http://localhost:${PORT}`);
});
