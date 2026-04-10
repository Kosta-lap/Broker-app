import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { LocalStrategy } from "./local.strategy";
import { AuthController } from "./auth.controller";
import { JsonStorageService } from "../common/json-storage.service";

@Module({
  imports: [PassportModule],
  providers: [AuthService, LocalStrategy, JsonStorageService],
  controllers: [AuthController],
})
export class AuthModule {}
