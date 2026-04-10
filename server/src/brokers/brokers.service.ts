import { Injectable, NotFoundException } from "@nestjs/common";
import { JsonStorageService } from "../common/json-storage.service";
import { CreateBrokerDto } from "./dto/create-broker.dto";
import { UpdateBrokerDto } from "./dto/update-broker.dto";

export interface Broker {
  id: number;
  name: string;
  balance: number;
  password?: string;
  isAdmin?: boolean;
}

@Injectable()
export class BrokersService {
  private readonly file = "brokers.json";

  constructor(private storage: JsonStorageService) {}

  private getAll(): Broker[] {
    return this.storage.read<Broker[]>(this.file);
  }

  private saveAll(list: Broker[]) {
    this.storage.write(this.file, list);
  }

  findAll(): Broker[] {
    return this.getAll();
  }

  create(dto: CreateBrokerDto): Broker {
    const brokers = this.getAll();
    const maxId = brokers.reduce((m, b) => (b.id > m ? b.id : m), 0);
    const id = maxId + 1;

    const password = dto.password && dto.password.trim().length > 0 ? dto.password : "123";
    const isAdmin = dto.isAdmin ?? false;

    const broker: Broker = {
      id,
      name: dto.name,
      balance: dto.balance,
      password,
      isAdmin,
    };

    brokers.push(broker);
    this.saveAll(brokers);
    return broker;
  }

  update(id: number, dto: UpdateBrokerDto): Broker {
    const list = this.getAll();
    const idx = list.findIndex((b) => b.id === id);
    if (idx === -1) throw new NotFoundException("Broker not found");
    list[idx] = { ...list[idx], ...dto };
    this.saveAll(list);
    return list[idx];
  }

  remove(id: number) {
    const list = this.getAll();
    const filtered = list.filter((b) => b.id !== id);
    this.saveAll(filtered);
  }
}
