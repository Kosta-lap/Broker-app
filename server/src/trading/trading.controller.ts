import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { TradingService, TradeDto } from "./trading.service";

@Controller("trading")
export class TradingController {
  constructor(private tradingService: TradingService) {}

  @Get("broker/:id")
  getPortfolio(@Param("id") id: string) {
    return this.tradingService.getPortfolio(+id);
  }

  @Post("broker/:id/trade")
  makeTrade(@Param("id") id: string, @Body() body: TradeDto) {
    return this.tradingService.trade(+id, body);
  }

  @Get("admin/summary")
  getAdminSummary() {
    return this.tradingService.getAdminSummary();
  }
}
