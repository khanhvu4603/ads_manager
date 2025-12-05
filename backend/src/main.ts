import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Enable CORS for Dashboard and Client
  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 Backend is running on: http://localhost:${port}`);
}
bootstrap();
