import {Pool} from 'pg';

require('dotenv').config({quiet: true});

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});