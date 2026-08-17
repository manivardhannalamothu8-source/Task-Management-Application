import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketIOServer | null = null;

export function initializeSocket(httpServer: HTTPServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      credentials: true,
    },
    path: '/socket.io',
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket: Socket) => {
    // console.log(`🔌 Client connected: ${socket.id}`);

    // Join authenticated user's private room
    socket.on('join_user_room', (userId: string) => {
      if (userId) {
        socket.join(`user_${userId}`);
        // console.log(`👤 Socket ${socket.id} joined room user_${userId}`);
        socket.emit('room_joined', { userId, status: 'connected' });
      }
    });

    // Leave room on logout or change
    socket.on('leave_user_room', (userId: string) => {
      if (userId) {
        socket.leave(`user_${userId}`);
      }
    });

    socket.on('disconnect', () => {
      // console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

export function emitToUser(userId: string, event: string, payload: any) {
  if (io && userId) {
    io.to(`user_${userId}`).emit(event, payload);
  }
}
