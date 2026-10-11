import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { Roles } from "../common/decorators/user.decorator";
import { CategoriesService, type CategoryInput } from "./categories.service";

@Controller("categories")
export class CategoriesController {
  constructor(private readonly svc: CategoriesService) {}

  @Get()
  tree() {
    return this.svc.tree();
  }

  @Get(":slug")
  bySlug(@Param("slug") slug: string) {
    return this.svc.bySlug(slug);
  }

  @Post()
  @Roles("ADMIN")
  create(@Body() body: CategoryInput) {
    return this.svc.create(body);
  }

  @Patch(":id")
  @Roles("ADMIN")
  update(@Param("id") id: string, @Body() body: CategoryInput) {
    return this.svc.update(id, body);
  }

  @Delete(":id")
  @Roles("ADMIN")
  remove(@Param("id") id: string) {
    return this.svc.remove(id);
  }
}
