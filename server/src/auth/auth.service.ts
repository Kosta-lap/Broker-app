import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JsonStorageService } from "../common/json-storage.service";

interface BrokerEntity {
  id: number;
  name: string;
  balance: number;
  password?: string;
  isAdmin?: boolean;
}

export interface AuthBroker {
  id: number;
  name: string;
  isAdmin: boolean;
}

@Injectable()
export class AuthService {
  private readonly fileName = "brokers.json";

  constructor(private storage: JsonStorageService) {}

  private readBrokers(): BrokerEntity[] {
    return this.storage.read<BrokerEntity[]>(this.fileName) ?? [];
  }

  private toAuthBroker(b: BrokerEntity): AuthBroker {
    return {
      id: b.id,
      name: b.name,
      isAdmin: b.isAdmin ?? false,
    };
  }

  async validateBroker(name: string, password: string): Promise<AuthBroker | null> {
    const brokers = this.readBrokers();
    const broker = brokers.find((b) => b.name === name);
    if (!broker) {
      return null;
    }

    const storedPassword = broker.password ?? "123";

    if (storedPassword !== password) {
      return null;
    }

    return this.toAuthBroker(broker);
  }

  async getById(id: number): Promise<AuthBroker> {
    const brokers = this.readBrokers();
    const broker = brokers.find((b) => b.id === id);
    if (!broker) {
      throw new UnauthorizedException("Broker not found");
    }
    return this.toAuthBroker(broker);
  }
}
