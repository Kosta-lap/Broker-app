import { Module } from "@nestjs/common";
import { TradingService } from "./trading.service";
import { TradingController } from "./trading.controller";
import { JsonStorageService } from "../common/json-storage.service";

@Module({
  controllers: [TradingController],
  providers: [TradingService, JsonStorageService],
})
export class TradingModule {}
