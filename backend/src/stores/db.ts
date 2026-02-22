import {Pool} from 'pg';
require('dotenv').config({quiet: true});

const isDev = process.env.NODE_ENV === "test" || process.env.NODE_ENV === "dev";

const connectionString = isDev ? process.env.DEV_DATABASE_URL : process.env.DATABASE_URL;

export const db = new Pool({
  connectionString,
});