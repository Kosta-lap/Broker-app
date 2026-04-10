export interface Broker {
  id: number;
  name: string;
  balance: number;
  password: string;
  isAdmin: boolean;
}

export interface Stock {
  symbol: string;
  name: string;
  active: boolean;
}

export interface Position {
  symbol: string;
  quantity: number;
  avgPrice: number;
}

export interface PortfolioResponse {
  brokerId: number;
  name: string;
  cash: number;
  positions: Position[];
}

export interface AdminBrokerSummary {
  id: number;
  name: string;
  cash: number;
  positions: Position[];
}

export interface TickPayload {
  date: string;
  prices: { symbol: string; price: string }[];
}
