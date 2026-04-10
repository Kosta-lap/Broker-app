import { Controller, Get, Param, Patch, Body } from "@nestjs/common";
import { StocksService } from "./stocks.service";

@Controller("stocks")
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Get()
  getStocks() {
    return this.stocksService.getStocks();
  }

  @Get(":symbol/history")
  getHistory(@Param("symbol") symbol: string) {
    return this.stocksService.getHistory(symbol.toUpperCase());
  }

  @Patch(":symbol/active")
  setActive(@Param("symbol") symbol: string, @Body() body: { active: boolean }) {
    return this.stocksService.setStockActive(symbol.toUpperCase(), body.active);
  }
}
