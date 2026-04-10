import { Controller, Get, Post, Body, Param, Delete, Patch } from "@nestjs/common";
import { BrokersService } from "./brokers.service";
import { CreateBrokerDto } from "./dto/create-broker.dto";
import { UpdateBrokerDto } from "./dto/update-broker.dto";

@Controller("brokers")
export class BrokersController {
  constructor(private readonly brokersService: BrokersService) {}

  @Get()
  findAll() {
    return this.brokersService.findAll();
  }

  @Post()
  create(@Body() dto: CreateBrokerDto) {
    return this.brokersService.create(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateBrokerDto) {
    return this.brokersService.update(+id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.brokersService.remove(+id);
  }
}
