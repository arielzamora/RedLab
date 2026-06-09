import * as dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']); // Force Node.js to use Google DNS to resolve MongoDB SRV records
dns.setDefaultResultOrder('ipv4first'); // Speed up connection by prioritizing IPv4 addresses

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors(); // Enable CORS for frontend requests

  // Ensure uploads directory exists and serve it as static files
  const uploadsDir = join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.useStaticAssets(uploadsDir, {
    prefix: '/uploads/',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
