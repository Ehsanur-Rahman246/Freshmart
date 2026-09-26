import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";
import User from "../models/User.js";

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL?.split(",") || [],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const raw = socket.handshake.headers.cookie;
      const token = raw ? cookie.parse(raw).token : null;

      if (!token) {
        console.log("socket auth rejected: no token/cookie");
        return next(new Error("Unauthorized"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded.userId || decoded.purpose) {
        console.log("socket auth rejected: bad decoded payload", decoded);
        return next(new Error("Unauthorized"));
      }

      const user = await User.findById(decoded.userId).select(
        "isActive role passwordChangedAt",
      );

      if (!user || !user.isActive) {
        console.log("socket auth rejected: user missing/inactive");
        return next(new Error("Unauthorized"));
      }

      if (
        user.passwordChangedAt &&
        decoded.iat * 1000 < user.passwordChangedAt.getTime()
      ) {
        console.log("socket auth rejected: stale token (password changed)");
        return next(new Error("Unauthorized"));
      }

      socket.userId = decoded.userId;
      socket.userRole = user.role;

      next();
    } catch (err) {
      console.log("socket auth rejected: exception", err.message);
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.userId}`);
    console.log("socket joined room:", `user:${socket.userId}`);

    if (socket.userRole === "admin") {
      socket.join("admins");
    }
  });

  return io;
};

export const getIO = () => io;
