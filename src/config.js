const dotenv = require("dotenv");
const path = require("path");

//Read Data from ENV Variables
dotenv.config({ path: path.resolve(__dirname, "../config.env") });

module.exports = {
  PORT: process.env.PORT,
  HOST: process.env.HOST,
  USER: process.env.USER,
  PASSWORD: process.env.PASSWORD,
  DATABSE: process.env.DATABSE,
};
