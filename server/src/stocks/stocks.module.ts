import { Module } from "@nestjs/common";
import { StocksService } from "./stocks.service";
import { StocksController } from "./stocks.controller";
import { JsonStorageService } from "../common/json-storage.service";

@Module({
  controllers: [StocksController],
  providers: [StocksService, JsonStorageService],
  exports: [StocksService],
})
export class StocksModule {}
