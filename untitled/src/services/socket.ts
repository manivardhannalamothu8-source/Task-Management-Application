import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(window.location.origin, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      autoConnect: true,
    });

    socket.on('connect', () => {
      // console.log('🟢 Socket.IO Connected:', socket?.id);
      const userStr = localStorage.getItem('taskflow_user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user?._id) {
            socket?.emit('join_user_room', user._id);
          }
        } catch {
          // ignore
        }
      }
    });

    socket.on('disconnect', () => {
      // console.log('🔴 Socket.IO Disconnected');
    });
  }

  return socket;
}

export function joinUserRoom(userId: string) {
  const s = getSocket();
  if (s && userId) {
    s.emit('join_user_room', userId);
  }
}

export function leaveUserRoom(userId: string) {
  const s = getSocket();
  if (s && userId) {
    s.emit('leave_user_room', userId);
  }
}
