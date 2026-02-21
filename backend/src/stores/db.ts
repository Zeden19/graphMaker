import {Pool} from 'pg';
require('dotenv').config({quiet: true});

const isTest = process.env.NODE_ENV === "test";

const connectionString = isTest ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;

export const db = new Pool({
  connectionString,
});