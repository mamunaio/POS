import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // web client (and later mobile) on a different origin
  const port = Number(process.env.API_PORT ?? 3000);
  await app.listen(port);
  console.log(`POS API running on http://localhost:${port}`);
}

bootstrap();
