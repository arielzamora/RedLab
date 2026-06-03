import * as dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']); // Force Node.js to use Google DNS to resolve MongoDB SRV records

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new TransformInterceptor());
  app.enableCors(); // Enable CORS for frontend requests
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
