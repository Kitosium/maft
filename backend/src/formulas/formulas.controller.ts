import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { CurrentUser, Roles } from "../common/decorators/user.decorator";
import { FormulasService, type FormulaInput } from "./formulas.service";
import type { AuthUser } from "../common/types/auth.types";

@Controller("formulas")
export class FormulasController {
  constructor(private readonly svc: FormulasService) {}

  @Get()
  list(
    @Query("category") category?: string,
    @Query("q") q?: string,
    @Query("group") group?: string,
    @Query("all") all?: string,
    @CurrentUser() user?: AuthUser | null,
  ) {
    const admin = user?.role === "ADMIN";
    return this.svc.list({
      category: category || undefined,
      q: q?.trim() || undefined,
      group: group || undefined,
      all: admin && all === "1",
    });
  }

  @Get(":id")
  byId(@Param("id") id: string, @CurrentUser() user?: AuthUser | null) {
    return this.svc.byId(id, user?.role === "ADMIN");
  }

  @Post()
  @Roles("ADMIN")
  create(@Body() body: FormulaInput) {
    return this.svc.create(body);
  }

  @Patch(":id")
  @Roles("ADMIN")
  update(@Param("id") id: string, @Body() body: FormulaInput) {
    return this.svc.update(id, body);
  }

  @Delete(":id")
  @Roles("ADMIN")
  remove(@Param("id") id: string) {
    return this.svc.remove(id);
  }
}
