import { Controller, Get, Post, Body } from "@nestjs/common";
import { ExchangeService, ExchangeSettings } from "./exchange.service";
import { ExchangeGateway } from "./exchange.gateway";

@Controller("exchange")
export class ExchangeController {
  constructor(private exchangeService: ExchangeService, private gateway: ExchangeGateway) {}

  @Get("settings")
  getSettings() {
    return this.exchangeService.getSettings();
  }

  @Post("settings")
  setSettings(@Body() body: ExchangeSettings) {
    return this.exchangeService.setSettings(body);
  }

  @Post("start")
  start() {
    this.gateway.startBroadcast();
    return { started: true };
  }

  @Post("stop")
  stop() {
    this.gateway.stopBroadcast();
    return { stopped: true };
  }
}
