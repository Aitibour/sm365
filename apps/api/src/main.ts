import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initializeDatabase } from './db.service';

async function bootstrap() {
  await initializeDatabase();
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
}
void bootstrap();
