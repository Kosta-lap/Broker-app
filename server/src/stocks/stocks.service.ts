import { Injectable } from "@nestjs/common";
import { JsonStorageService } from "../common/json-storage.service";
import * as path from "path";
import * as fs from "fs";

export interface Stock {
  symbol: string;
  name: string;
  active: boolean;
}

export interface StockHistoryPoint {
  date: string; // "11/5/2021"
  open: string;
}

@Injectable()
export class StocksService {
  private readonly file = "stocks.json";

  private parseDate(dateStr: string): number {
    const [m, d, y] = dateStr.split("/");
    const year = Number(y);
    const month = Number(m) - 1;
    const day = Number(d);
    return new Date(year, month, day).getTime();
  }

  constructor(private storage: JsonStorageService) {}

  getStocks(): Stock[] {
    return this.storage.read<Stock[]>(this.file);
  }

  setStockActive(symbol: string, active: boolean): Stock {
    const stocks = this.getStocks();
    const idx = stocks.findIndex((s) => s.symbol === symbol);
    if (idx === -1) {
      throw new Error("Stock not found");
    }
    stocks[idx].active = active;
    this.storage.write(this.file, stocks);
    return stocks[idx];
  }

  getHistory(symbol: string): StockHistoryPoint[] {
    const fileName = path.join("history", `${symbol}.json`);
    const data = this.storage.read<StockHistoryPoint[]>(fileName);

    data.forEach((item) => {
      item.open = item.open.replace("$", " ");
    });

    return data.reverse();
  }
}
