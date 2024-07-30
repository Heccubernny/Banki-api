import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

dotenvConfig({ path: '.env' });

const config = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASS,
  database: process.env.DATABASE_NAME,
  entities: ['src/**/*.entity{.ts, .js}'],
  migrations: ['src/**/migrations/*{.ts, .js}'],
  synchronize: false,
  retryAttempts: 3,
  retryDelay: 3000,
  cli: {
    migrationsDir: 'src/migrations',
  },
};

export default registerAs(
  'typeorm',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE_NAME,
    entities: ['src/**/*.entity{.ts, .js}'],
    migrations: ['src/**/migrations/*{.ts, .js}'],
    synchronize: false,
    retryAttempts: 3,
    retryDelay: 3000,
    namingStrategy: new SnakeNamingStrategy(),
  }),
);

export const connectionSource = new DataSource(config as DataSourceOptions);
