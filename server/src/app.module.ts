import { Module } from "@nestjs/common";
import { BrokersModule } from "./brokers/brokers.module";
import { StocksModule } from "./stocks/stocks.module";
import { ExchangeModule } from "./exchange/exchange.module";
import { JsonStorageService } from "./common/json-storage.service";
import { TradingModule } from "./trading/trading.module";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [BrokersModule, StocksModule, ExchangeModule, TradingModule, AuthModule],
  providers: [JsonStorageService],
})
export class AppModule {}
