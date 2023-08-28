const { Client } = require("pg");
const config = require("../config");

//Establish connection to the database
const client = new Client({
  host: config.HOST,
  user: config.USER,
  password: config.PASSWORD,
  database: config.DATABSE,
});

async function connectToDatabase() {
  try {
    const connection = await client.connect();
    //Query to create a table if not already present
    await client.query(` CREATE TABLE IF NOT EXISTS USER_DETAILS(
            id SERIAL PRIMARY KEY,
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
    //If there was an error in the connection, return the error
    console.log("Couldn't connect to database");
    console.log(ex);
  }
}

connectToDatabase();

module.exports = client;
