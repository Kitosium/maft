import { Body, Controller, Get, Post } from "@nestjs/common";
import { CurrentUser, Roles } from "../common/decorators/user.decorator";
import { HistoryService } from "./history.service";
import type { AuthUser } from "../common/types/auth.types";

@Controller("history")
@Roles("USER", "ADMIN")
export class HistoryController {
  constructor(private readonly svc: HistoryService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.svc.list(user.id);
  }

  @Post()
  record(@CurrentUser() user: AuthUser, @Body() body: { formulaId?: string }) {
    return this.svc.record(user.id, body.formulaId ?? "");
  }
}
