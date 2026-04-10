import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { JsonStorageService } from "../common/json-storage.service";

export interface Broker {
  id: number;
  name: string;
  balance: number;
}

export interface Position {
  brokerId: number;
  symbol: string;
  quantity: number;
  avgPrice: number;
}

export type TradeSide = "buy" | "sell";

export interface TradeDto {
  symbol: string;
  quantity: number;
  side: TradeSide;
  price: number;
}

export interface PortfolioResponse {
  brokerId: number;
  name: string;
  cash: number;
  positions: {
    symbol: string;
    quantity: number;
    avgPrice: number;
  }[];
}

export interface AdminBrokerSummary {
  id: number;
  name: string;
  cash: number;
  positions: {
    symbol: string;
    quantity: number;
    avgPrice: number;
  }[];
}

@Injectable()
export class TradingService {
  private readonly portfoliosFile = "portfolios.json";
  private readonly brokersFile = "brokers.json";

  constructor(private storage: JsonStorageService) {}

  // ====== служебные методы чтения/записи ======

  private readPortfolios(): Position[] {
    return this.storage.read<Position[]>(this.portfoliosFile) ?? [];
  }

  private savePortfolios(items: Position[]) {
    this.storage.write(this.portfoliosFile, items);
  }

  private readBrokers(): Broker[] {
    return this.storage.read<Broker[]>(this.brokersFile) ?? [];
  }

  private saveBrokers(items: Broker[]) {
    this.storage.write(this.brokersFile, items);
  }

  private getBrokerOrThrow(id: number): Broker {
    const brokers = this.readBrokers();
    const broker = brokers.find((b) => b.id === id);
    if (!broker) {
      throw new NotFoundException("Broker not found");
    }
    return broker;
  }

  // ====== публичные методы ======

  getPortfolio(brokerId: number): PortfolioResponse {
    const broker = this.getBrokerOrThrow(brokerId);
    const all = this.readPortfolios();
    const positions = all.filter((p) => p.brokerId === brokerId).map(({ symbol, quantity, avgPrice }) => ({ symbol, quantity, avgPrice }));

    return {
      brokerId: broker.id,
      name: broker.name,
      cash: broker.balance,
      positions,
    };
  }

  trade(brokerId: number, dto: TradeDto): PortfolioResponse {
    const { symbol, quantity, side, price } = dto;

    if (!symbol || !symbol.trim()) {
      throw new BadRequestException("Symbol is required");
    }
    if (!quantity || quantity <= 0) {
      throw new BadRequestException("Quantity must be > 0");
    }
    if (!price || price <= 0) {
      throw new BadRequestException("Price must be > 0");
    }
    if (side !== "buy" && side !== "sell") {
      throw new BadRequestException("Side must be 'buy' or 'sell'");
    }

    const brokers = this.readBrokers();
    const brokerIdx = brokers.findIndex((b) => b.id === brokerId);
    if (brokerIdx === -1) {
      throw new NotFoundException("Broker not found");
    }
    const broker = brokers[brokerIdx];

    const portfolios = this.readPortfolios();
    const posIdx = portfolios.findIndex((p) => p.brokerId === brokerId && p.symbol === symbol.toUpperCase());
    const existing = posIdx !== -1 ? portfolios[posIdx] : null;

    const totalCost = price * quantity;

    if (side === "buy") {
      if (broker.balance < totalCost) {
        throw new BadRequestException("Недостаточно баланса для покупки");
      }

      broker.balance -= totalCost;

      const newQty = (existing?.quantity ?? 0) + quantity;
      const oldCost = (existing?.avgPrice ?? price) * (existing?.quantity ?? 0);
      const newAvgPrice = (oldCost + totalCost) / newQty;

      const updated: Position = {
        brokerId,
        symbol: symbol.toUpperCase(),
        quantity: newQty,
        avgPrice: newAvgPrice,
      };

      if (existing) {
        portfolios[posIdx] = updated;
      } else {
        portfolios.push(updated);
      }
    } else {
      // sell
      if (!existing || existing.quantity < quantity) {
        throw new BadRequestException("Недостаточно акций для продажи");
      }

      broker.balance += totalCost;

      const remainingQty = existing.quantity - quantity;
      if (remainingQty === 0) {
        portfolios.splice(posIdx, 1);
      } else {
        portfolios[posIdx] = {
          ...existing,
          quantity: remainingQty,
        };
      }
    }

    brokers[brokerIdx] = broker;
    this.saveBrokers(brokers);
    this.savePortfolios(portfolios);

    return this.getPortfolio(brokerId);
  }

  getAdminSummary(): AdminBrokerSummary[] {
    const brokers = this.readBrokers();
    const portfolios = this.readPortfolios();

    return brokers.map((b) => ({
      id: b.id,
      name: b.name,
      cash: b.balance,
      positions: portfolios.filter((p) => p.brokerId === b.id).map(({ symbol, quantity, avgPrice }) => ({ symbol, quantity, avgPrice })),
    }));
  }
}
