import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ZodFilter } from "./common/filters/zod-filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalFilters(new ZodFilter());
  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
