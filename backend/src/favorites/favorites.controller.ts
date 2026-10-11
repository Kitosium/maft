import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { CurrentUser, Roles } from "../common/decorators/user.decorator";
import { FavoritesService } from "./favorites.service";
import type { AuthUser } from "../common/types/auth.types";

@Controller("favorites")
@Roles("USER", "ADMIN")
export class FavoritesController {
  constructor(private readonly svc: FavoritesService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.svc.list(user.id);
  }

  @Post()
  add(@CurrentUser() user: AuthUser, @Body() body: { formulaId?: string }) {
    return this.svc.toggle(user.id, body.formulaId ?? "");
  }

  @Delete(":formulaId")
  remove(@CurrentUser() user: AuthUser, @Param("formulaId") formulaId: string) {
    return this.svc.remove(user.id, formulaId);
  }
}
