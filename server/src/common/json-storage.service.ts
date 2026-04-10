import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class JsonStorageService {
  private basePath: string;

  constructor() {
    this.basePath = path.join(process.cwd(), "src", "data");
  }

  private ensureDirExists(fullPath: string) {
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  read<T = any>(fileName: string): T {
    const fullPath = path.join(this.basePath, fileName);
    if (!fs.existsSync(fullPath)) {
      return [] as any;
    }
    const raw = fs.readFileSync(fullPath, "utf-8");
    return JSON.parse(raw);
  }

  write(fileName: string, data: any): void {
    const fullPath = path.join(this.basePath, fileName);
    this.ensureDirExists(fullPath); // <-- создаём папку, если её нет
    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), "utf-8");
  }
}
