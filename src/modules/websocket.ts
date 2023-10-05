import { Server, ServerOptions } from "socket.io";
import http from "http";
import type { Server as HTTPSServer } from "https";
import type { Http2SecureServer } from "http2";

const WEBSOCKET_CORS = {
  origin: "*",
  methods: ["GET", "POST"],
};

class Websocket extends Server {
  private static io: Websocket;

  constructor(
    httpServer?: http.Server | HTTPSServer | Http2SecureServer | number,
    opts?: Partial<ServerOptions>,
  ) {
    super(httpServer, {
      cors: WEBSOCKET_CORS,
    });
  }

  public static getInstance(httpServer?: any): Websocket {
    if (!Websocket.io) {
      Websocket.io = new Websocket(httpServer);
    }

    return Websocket.io;
  }
}

export default Websocket;
