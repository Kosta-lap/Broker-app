import { Controller, Post, UseGuards, Req, Res, Get, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthService, AuthBroker } from "./auth.service";
import { Request, Response } from "express";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("login")
  @UseGuards(AuthGuard("local"))
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as AuthBroker;

    res.cookie("broker_id", String(user.id), {
      httpOnly: false,
      sameSite: "lax",
    });

    return user; // { id, name, isAdmin }
  }

  @Post("logout")
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("broker_id");
    return { success: true };
  }

  @Get("me")
  async me(@Req() req: Request): Promise<AuthBroker> {
    const raw = req.cookies?.["broker_id"];
    if (!raw) {
      throw new UnauthorizedException("Not logged in");
    }
    const id = Number(raw);
    if (!Number.isFinite(id)) {
      throw new UnauthorizedException("Invalid id");
    }
    return this.authService.getById(id);
  }
}
