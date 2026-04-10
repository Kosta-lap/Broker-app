import { Module } from "@nestjs/common";
import { ExchangeService } from "./exchange.service";
import { ExchangeController } from "./exchange.controller";
import { ExchangeGateway } from "./exchange.gateway";
import { StocksModule } from "../stocks/stocks.module";

@Module({
  imports: [StocksModule],
  controllers: [ExchangeController],
  providers: [ExchangeService, ExchangeGateway],
})
export class ExchangeModule {}
