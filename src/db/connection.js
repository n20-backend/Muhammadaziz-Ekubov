import pg from "pg"
import logger from '../utils/logger.js';

const { Pool } = pg

logger.info("Connecting to database...")

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

logger.info("Connected to database")
pool.on("error", (err) => {
    logger.error("Unexpected error on idle client", err)
    process.exit(-1)
});

export default pool;