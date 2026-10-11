import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { AuthGuard } from "./common/guards/auth.guard";
import { RolesGuard } from "./common/guards/roles.guard";
import { CategoriesModule } from "./categories/categories.module";
import { FormulasModule } from "./formulas/formulas.module";
import { FavoritesModule } from "./favorites/favorites.module";
import { HistoryModule } from "./history/history.module";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CategoriesModule,
    FormulasModule,
    FavoritesModule,
    HistoryModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
