import { Injectable } from "@nestjs/common";
import { StocksService, StockHistoryPoint } from "../stocks/stocks.service";

export interface ExchangeSettings {
  startDate: string;
  speedSeconds: number;
}

@Injectable()
export class ExchangeService {
  private settings: ExchangeSettings = {
    startDate: "",
    speedSeconds: 1,
  };

  private timer: NodeJS.Timeout | null = null;
  private currentIndex = 0;
  private historyCache: Record<string, StockHistoryPoint[]> = {};

  constructor(private stocksService: StocksService) {}

  setSettings(settings: ExchangeSettings) {
    this.settings = settings;
    this.currentIndex = 0;
    this.historyCache = {};
    return this.settings;
  }

  getSettings() {
    return this.settings;
  }

  private parseDate(dateStr: string): number {
    const [m, d, y] = dateStr.split("/");
    const year = Number(y);
    const month = Number(m) - 1;
    const day = Number(d);
    return new Date(year, month, day).getTime();
  }

  /** Загружаем историю активных акций */
  private loadHistories() {
    const activeStocks = this.stocksService.getStocks().filter((s) => s.active);
    activeStocks.forEach((s) => {
      this.historyCache[s.symbol] = this.stocksService.getHistory(s.symbol);
    });

    // выравниваем по startDate — ищем индекс по первой акции
    const anySymbol = activeStocks[0]?.symbol;
    if (!anySymbol) return;

    const arr = this.historyCache[anySymbol];

    const targetTime = this.parseDate(this.settings.startDate);
    let idx = arr.findIndex((p) => this.parseDate(p.date) >= targetTime);

    console.log(targetTime);
    this.currentIndex = idx !== -1 ? idx : 0;
  }

  /** Запуск цикла — Gateway будет получать колбэк */
  start(callback: (payload: any) => void) {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.loadHistories();

    const tick = () => {
      const payload: {
        date: string;
        prices: { symbol: string; price: string }[];
      } = { date: "", prices: [] };

      const symbols = Object.keys(this.historyCache);
      if (!symbols.length) return;

      const mainHistory = this.historyCache[symbols[0]];
      if (!mainHistory[this.currentIndex]) {
        clearInterval(this.timer!);
        this.timer = null;
        return;
      }

      const currentDate = mainHistory[this.currentIndex].date;
      payload.date = currentDate;

      symbols.forEach((sym) => {
        const arr = this.historyCache[sym];
        if (this.currentIndex < arr.length) {
          payload.prices.push({ symbol: sym, price: arr[this.currentIndex].open });
        }
      });

      callback(payload);
      this.currentIndex++;
    };

    tick();

    this.timer = setInterval(() => tick(), this.settings.speedSeconds * 1000);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
