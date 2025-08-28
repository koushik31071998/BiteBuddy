import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

type JWTPayload = { id: string; role: string; iat?: number; exp?: number };

let io: Server | null = null;

/**
 * Initialize Socket.IO on top of the HTTP server, with JWT auth.
 * - Clients must send token via `auth: { token }` or `Authorization: Bearer ...`
 * - Each user joins a room == their userId
 */
export function initSocket(server: http.Server) {
  io = new Server(server, {
    cors: { origin: "*", credentials: true }, // tighten in prod
  });

  // Authenticate socket handshakes with JWT
  io.use((socket, next) => {
    try {
      const header = (socket.handshake.headers["authorization"] as string) || "";
      const bearer = header.startsWith("Bearer ") ? header.split(" ")[1] : null;
      const token =
        socket.handshake.auth?.token ||
        (socket.handshake.query?.token as string | undefined) ||
        bearer;

      if (!token) return next(new Error("Unauthorized: missing token"));

      const payload = jwt.verify(token, process.env.JWT_SECRET as string) as JWTPayload;
      // attach user on the socket for later
      (socket as any).user = { id: payload.id, role: payload.role };
      return next();
    } catch (err) {
      return next(new Error("Unauthorized: invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const user = (socket as any).user as { id: string; role: string };
    const room = user.id; // 1 user = 1 private room
    socket.join(room);

    // Optional: confirm connection
    socket.emit("connected", { userId: user.id, role: user.role });

    socket.on("disconnect", () => {
      // cleanup if needed
    });
  });

  return io;
}

/** Get the singleton io instance */
export function getIO(): Server {
  if (!io) throw new Error("Socket.IO not initialized. Call initSocket(server) first.");
  return io;
}
