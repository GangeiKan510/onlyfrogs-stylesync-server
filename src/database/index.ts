import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;

const { POSTGRES_URL, DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT } =
  process.env as {
    POSTGRES_URL: string;
    DB_NAME: string;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_HOST: string;
    DB_PORT: string;
  };

const pool = new Pool({
  connectionString: POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const sequelize = new Sequelize(POSTGRES_URL, {
  dialect: 'postgres',
  logging: (msg) =>
    console.log(`[Sequelize] ${new Date().toISOString()} - ${msg}`),
  dialectModule: pg,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

testConnection();

export default sequelize;
