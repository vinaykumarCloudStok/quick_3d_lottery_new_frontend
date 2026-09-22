import { io, Socket } from "socket.io-client";

const URL = import.meta.env.VITE_APP_BASE_SOCKET_URL as string;

export const createSocket = (token: string, gameId: string): Socket => {
  return io(URL, {
    transports: ["websocket"],
    query: {
      game_id: gameId,
      token,
    },
  });
};
