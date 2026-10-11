import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    credentials: true,
  });
  app.setGlobalPrefix("api");
  const port = Number(process.env.BACKEND_PORT ?? 8000);
  await app.listen(port, "0.0.0.0");
  console.log(`maft api listening on :${port}`);
};

void bootstrap();
