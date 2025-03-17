import app, { __dirname } from "./app.js";
import dotenv from "dotenv";
import mongoose from "mongoose";  
dotenv.config({ path: `${__dirname}/config.env` });
const port = process.env.PORT || 5000;
mongoose
  .connect(process.env.DATA_BASE)
  .then(() => {
    console.log("db is connected");
  })
  .catch((err) => {
    console.log(err);
  });
  app.listen(port, () => {
    console.log("server is run");
  });