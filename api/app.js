import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";
import catchError from "./Utils/catchError.js";
import morgan from "morgan";

import HandleERROR from "./Utils/handleError.js";

const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);
const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());


app.use("*", (req, res, next) => {
  return next(new HandleERROR("invalid route", 404));
});
app.use(catchError);
export default app;
