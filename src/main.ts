import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger } from '@nestjs/common';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({ prefix: 'Onboarding' }),
  });
  await app.listen(process.env.PORT ?? 3000);
};
bootstrap();
