import { io } from 'socket.io-client';
import { TOKEN_NAME } from '../constants/general';
import { getCookies } from '@/utils/helpers/cookies';

export let socket: any;
export let socketMap: any;

export const initiateSocketConnection = (isGuest: boolean) => {
  const token = getCookies(TOKEN_NAME);
  socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}/socket.io`, {
    forceNew: true,
    reconnectionAttempts: 3,
    timeout: 20000,
    transports: ['websocket'],
    query: {
      token: `${isGuest ? '' : token}`,
    },
  });
};

export const disconnectSocket = () => {
  if (socket) socket.disconnect();
};

export const emitToSocket = (key: string, data: unknown) => {
  socket?.emit(key, data);
};

export const unEmitToSocket = (key: string) => {
  socket?.emit(key);
};

export const initiateSocketMapConnection = () => {
  const token = getCookies(TOKEN_NAME);
  socketMap = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}/board`, {
    forceNew: true,
    reconnectionAttempts: 3,
    timeout: 20000,
    transports: ['websocket'],
    query: {
      token,
    },
  });
};

export const disconnectSocketMap = () => {
  if (socketMap) socketMap.disconnect();
};

export const emitToSocketMap = (key: any, data: any) => {
  socketMap?.emit(key, data);
};

export const unEmitToSocketMap = (key: any) => {
  socketMap?.emit(key);
};
