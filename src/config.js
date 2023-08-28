const dotenv = require("dotenv");
const path = require("path");

//Read Data from ENV Variables
dotenv.config({ path: path.resolve(__dirname, "../config.env") });

module.exports = {
  PORTDATABASE: process.env.PORTDATABASE,
  HOST: process.env.HOST,
  USER: process.env.USER,
  PASSWORD: process.env.PASSWORD,
  DATABASE: process.env.DATABASE,
  PORTAPP: process.env.PORTAPP,
};
