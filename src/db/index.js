const { Client } = require("pg");
const config = require("../config");

const client = new Client({
  host: config.HOST,
  user: config.USER,
  password: config.PASSWORD,
  database: config.DATABSE,
});

async function connectToDatabase() {
  try {
    const connection = await client.connect();
    await client.query(` CREATE TABLE IF NOT EXISTS USER_DETAILS(
            id INTEGER PRIMARY KEY,
            phoneNumber VARCHAR(20),
            email VARCHAR(100),
            linkedId INTEGER,
            linkPrecedence  VARCHAR(20),
            createdAt         TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updatedAt         TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            deletedAt         TIMESTAMPTZ
          );`);
    console.log("Connected to database");
  } catch (ex) {
    console.log("Couldn't connect to database");
    console.log(ex);
  }
}

connectToDatabase();

module.exports = client;
