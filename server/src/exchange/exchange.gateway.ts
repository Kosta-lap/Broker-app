import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ExchangeService } from "./exchange.service";

@WebSocketGateway({
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  },
})
export class ExchangeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private exchangeService: ExchangeService) {}

  handleConnection(client: Socket) {
    console.log("Client connected", client.id);
  }

  handleDisconnect(client: Socket) {
    console.log("Client disconnected", client.id);
  }

  // Метод, который дергает ExchangeService и рассылает события
  startBroadcast() {
    this.exchangeService.start((payload) => {
      this.server.emit("exchange_tick", payload);
    });
  }

  stopBroadcast() {
    this.exchangeService.stop();
    this.server.emit("exchange_reset");
  }
}
