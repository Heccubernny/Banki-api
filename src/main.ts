import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ValidationErrorFilter } from './mongo-validation.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Banki Public API')
    .setDescription('Official Public API documentation for Banki Services')
    .setVersion('1.0')
    .addTag('Banki', 'Opay Fintech app')
    .addBearerAuth()
    .addCookieAuth()
    .addApiKey()
    .addBasicAuth()
    .build();

  const swaggerDocOptions: SwaggerDocumentOptions = {
    ignoreGlobalPrefix: true,
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  };
  const document = SwaggerModule.createDocument(app, config, swaggerDocOptions);

  const setupOptions: SwaggerCustomOptions = {
    jsonDocumentUrl: 'swagger/json',
  };

  SwaggerModule.setup('swagger-ui', app, document, setupOptions);

  // register all plugins and extension
  app.enableCors({ origin: '*' });
  app.useGlobalPipes(new ValidationPipe({}));
  app.useGlobalFilters(new ValidationErrorFilter());
  app.enableVersioning({ type: VersioningType.URI });
  app.use(helmet());
  app.use(cookieParser());
  app.use(compression());
  await app.listen(4000, () => {
    console.log('🔥🔥🔥 Application connected on port 4000');
  });
}
bootstrap();
